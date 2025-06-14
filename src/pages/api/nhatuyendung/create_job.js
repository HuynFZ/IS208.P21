import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";
import db from "../../../../lib/db";

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const session = await getServerSession(req, res, authOptions);
  console.log("Session in API:", session);
  if (!session) {
    return res.status(401).json({ message: 'Chưa đăng nhập' });
  }
  if (session.user.role !== "nhatuyendung") {
    return res.status(403).json({ message: 'Bạn không có quyền tạo tin tuyển dụng' });
  }

  const {
    tieuDe, moTa, yeuCau, quyenLoi, level, nganhNghe, hinhThuc, diaDiem,
    mucLuong, ngayDangTin, ngayHetHan, soLuongYeuCau, ghiChu
  } = req.body;

  // Validation
  if (typeof tieuDe !== 'string' || tieuDe.length < 5 || tieuDe.length > 100) {
    return res.status(400).json({ message: 'Tiêu đề phải từ 5-100 ký tự' });
  }
  if (!moTa || !yeuCau || !diaDiem || !mucLuong || !level || !nganhNghe) {
    return res.status(400).json({ message: 'Thiếu thông tin bắt buộc' });
  }
  const validHinhThuc = ['Toàn thời gian', 'Bán thời gian', 'Làm việc tự do', 'Làm việc theo hợp đồng'];
  if (!validHinhThuc.includes(hinhThuc)) {
    return res.status(400).json({ message: 'Hình thức làm việc không hợp lệ' });
  }
  if (!Number.isInteger(Number(soLuongYeuCau)) || Number(soLuongYeuCau) <= 0) {
    return res.status(400).json({ message: 'Số lượng yêu cầu phải là số nguyên dương' });
  }
  const ngayDang = new Date(ngayDangTin);
  const ngayHet = new Date(ngayHetHan);
  if (isNaN(ngayDang.getTime()) || isNaN(ngayHet.getTime()) || ngayHet <= ngayDang) {
    return res.status(400).json({ message: 'Ngày đăng hoặc hết hạn không hợp lệ' });
  }

  let conn;
  try {
    conn = await db.getConnection();
    await conn.beginTransaction();

    const maNhaTuyenDung = session.user.user_code;
    if (!maNhaTuyenDung) {
      return res.status(400).json({ message: 'Không xác định được nhà tuyển dụng' });
    }

    // Kiểm tra MaNhaTuyenDung
    const [nhaTuyenDungExists] = await conn.query(
      'SELECT 1 FROM NHA_TUYEN_DUNG WHERE MaNhaTuyenDung = ?',
      [maNhaTuyenDung]
    );
    if (!nhaTuyenDungExists.length) {
      return res.status(400).json({ message: `Nhà tuyển dụng ${maNhaTuyenDung} không tồn tại` });
    }

    // Kiểm tra MaNganhNghe
    const [nganhNgheExists] = await conn.query(
      'SELECT 1 FROM NGANH_NGHE WHERE MaNganhNghe = ?',
      [nganhNghe]
    );
    if (!nganhNgheExists.length) {
      return res.status(400).json({ message: `Ngành nghề ${nganhNghe} không tồn tại` });
    }

    // Kiểm tra MaLevel
    const [levelExists] = await conn.query(
      'SELECT 1 FROM LEVEL WHERE MaLevel = ?',
      [level]
    );
    if (!levelExists.length) {
      return res.status(400).json({ message: `Cấp bậc ${level} không tồn tại` });
    }

    // Tạo mã tin
    const [rows] = await conn.query(
      'SELECT MaTinTuyenDung FROM TIN_TUYEN_DUNG ORDER BY MaTinTuyenDung DESC LIMIT 1'
    );
    let maTinTuyenDung = 'TTD0000001'; // 9 ký tự
    if (rows.length > 0) {
      const lastNum = parseInt(rows[0].MaTinTuyenDung.slice(3));
      if (isNaN(lastNum)) {
        throw new Error('Invalid MaTinTuyenDung format');
      }
      const nextNum = lastNum + 1;
      if (nextNum > 9999999) {
        throw new Error('Maximum number of job postings reached');
      }
      maTinTuyenDung = `TTD${String(nextNum).padStart(7, '0')}`; // TTD + 7 số
    }

    // Insert vào bảng TIN_TUYEN_DUNG
    await conn.query(
      `INSERT INTO TIN_TUYEN_DUNG (
        MaTinTuyenDung, TieuDe, MoTa, YeuCau, QuyenLoi, MaLevel, MaNganhNghe,
        HinhThuc, DiaDiem, MucLuong, NgayDangTin, NgayHetHan, SoLuongYeuCau,
        GhiChu, MaNhaTuyenDung, MaNhanVienDuyet, TrangThai
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NULL, ?)`,
      [
        maTinTuyenDung, tieuDe, moTa, yeuCau, quyenLoi || 'Không có', level, nganhNghe,
        hinhThuc, diaDiem, mucLuong, ngayDangTin, ngayHetHan, Number(soLuongYeuCau),
        ghiChu || null, maNhaTuyenDung, 'Chưa duyệt'
      ]
    );

    await conn.commit();
    return res.status(201).json({ success: true, message: 'Tạo tin thành công' });
  } catch (err) {
    if (conn) await conn.rollback();
    console.error('Lỗi:', err);
    if (err.code === 'ER_NO_REFERENCED_ROW_2') {
      return res.status(400).json({ message: 'Dữ liệu tham chiếu không tồn tại', error: err.message });
    }
    if (err.code === 'ER_NO_SUCH_TABLE') {
      return res.status(500).json({ message: 'Bảng không tồn tại', error: err.message });
    }
    if (err.code === 'ER_BAD_FIELD_ERROR') {
      return res.status(500).json({ message: 'Cột không tồn tại', error: err.message });
    }
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ message: 'Mã tin tuyển dụng đã tồn tại', error: err.message });
    }
    if (err.code === 'ER_DATA_TOO_LONG') {
      return res.status(400).json({ message: 'Mã tin tuyển dụng quá dài', error: err.message });
    }
    return res.status(500).json({
      message: 'Lỗi server',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  } finally {
    if (conn) conn.release();
  }
}