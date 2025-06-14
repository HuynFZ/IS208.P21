import db from "../../../../../lib/db";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]";

export default async function handler(req, res) {
  try {
    // Kiểm tra session và quyền truy cập
    const session = await getServerSession(req, res, authOptions);
    if (!session || session.user.role !== 'nhatuyendung') {
      return res.status(401).json({ 
        success: false, 
        message: 'Không có quyền truy cập' 
      });
    }

    const { id } = req.query; // id là MaTinTuyenDung

    switch (req.method) {
      case 'GET':
        return handleGetResumes(req, res, session, id);
      case 'PUT':
        return handleUpdateStatus(req, res, session, id);
      default:
        return res.status(405).json({ 
          success: false, 
          message: 'Phương thức không được hỗ trợ' 
        });
    }
  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Lỗi hệ thống' 
    });
  }
}

async function handleGetResumes(req, res, session, maTinTuyenDung) {
  // Kiểm tra quyền sở hữu tin tuyển dụng
  const [ownership] = await db.query(
    'SELECT * FROM TIN_TUYEN_DUNG WHERE MaTinTuyenDung = ? AND MaNhaTuyenDung = ?',
    [maTinTuyenDung, session.user.user_code]
  );

  if (!ownership.length) {
    return res.status(403).json({
      success: false,
      message: 'Không có quyền truy cập tin tuyển dụng này'
    });
  }

  // Lấy danh sách hồ sơ đã nộp với thông tin bài test và phỏng vấn
  const [hoSos] = await db.query(`
    SELECT 
      nhs.*,
      hs.TenHoSo,
      uv.MaUngVien,
      uv.TenUngVien,
      uv.Email,
      uv.SDT,
      
      -- Kiểm tra đã gửi bài test
      (SELECT COUNT(*) 
       FROM BAI_TEST bt 
       JOIN LAM_BAI_TEST lbt ON bt.MaBaiTest = lbt.MaBaiTest
       WHERE lbt.MaUngVien = uv.MaUngVien 
       AND bt.MaTinTuyenDung = nhs.MaTinTuyenDung
       AND bt.TrangThai != 'Đã hủy') as DaGuiTest,
       
      -- Trạng thái làm bài test mới nhất
      (SELECT lbt.TrangThai
       FROM BAI_TEST bt 
       JOIN LAM_BAI_TEST lbt ON bt.MaBaiTest = lbt.MaBaiTest
       WHERE lbt.MaUngVien = uv.MaUngVien 
       AND bt.MaTinTuyenDung = nhs.MaTinTuyenDung
       ORDER BY lbt.NgayLam DESC LIMIT 1) as TrangThaiTest,
       
      -- Kiểm tra đã gửi lời mời phỏng vấn
      (SELECT COUNT(*) 
       FROM PHONG_VAN pv 
       JOIN THAM_GIA_PHONG_VAN tgpv ON pv.MaLichPhongVan = tgpv.MaLichPhongVan
       WHERE tgpv.MaUngVien = uv.MaUngVien 
       AND pv.MaTinTuyenDung = nhs.MaTinTuyenDung
       AND pv.TrangThai != 'Đã hủy') as DaGuiPV,
       
      -- Trạng thái phỏng vấn mới nhất
      (SELECT tgpv.TrangThai
       FROM PHONG_VAN pv 
       JOIN THAM_GIA_PHONG_VAN tgpv ON pv.MaLichPhongVan = tgpv.MaLichPhongVan
       WHERE tgpv.MaUngVien = uv.MaUngVien 
       AND pv.MaTinTuyenDung = nhs.MaTinTuyenDung
       ORDER BY tgpv.ThoiGian DESC LIMIT 1) as TrangThaiPV
       
    FROM NOP_HO_SO nhs
    JOIN HO_SO hs ON nhs.MaHoSo = hs.MaHoSo
    JOIN UNG_VIEN uv ON hs.MaUngVien = uv.MaUngVien
    WHERE nhs.MaTinTuyenDung = ?
    ORDER BY nhs.NgayNop DESC
  `, [maTinTuyenDung]);

  return res.status(200).json({
    success: true,
    data: hoSos
  });
}

async function handleUpdateStatus(req, res, session, maTinTuyenDung) {
  const { maHoSo, action, lyDo } = req.body;

  if (!maHoSo || !action) {
    return res.status(400).json({
      success: false,
      message: 'Thiếu thông tin cần thiết'
    });
  }

  let connection;
  try {
    connection = await db.getConnection();
    await connection.beginTransaction();

    // Kiểm tra quyền sở hữu và trạng thái hiện tại
    const [current] = await connection.query(
      `SELECT nhs.*, ttd.MaNhaTuyenDung 
       FROM NOP_HO_SO nhs
       JOIN TIN_TUYEN_DUNG ttd ON nhs.MaTinTuyenDung = ttd.MaTinTuyenDung
       WHERE nhs.MaHoSo = ? AND nhs.MaTinTuyenDung = ?`,
      [maHoSo, maTinTuyenDung]
    );

    if (!current.length || current[0].MaNhaTuyenDung !== session.user.user_code) {
      await connection.rollback();
      return res.status(403).json({
        success: false,
        message: 'Không có quyền cập nhật hồ sơ này'
      });
    }

    // Cập nhật trạng thái
    await connection.query(
      `UPDATE NOP_HO_SO 
       SET TrangThai = ?,
           NgayDuyet = CURRENT_TIMESTAMP,
           LyDoTuChoi = ?,
           KetQuaDuyet = ?
       WHERE MaHoSo = ? AND MaTinTuyenDung = ?`,
      [
        action === 'approve' ? 'Đã duyệt' : 'Từ chối',
        action === 'reject' ? lyDo : null,
        action === 'approve' ? 'Đạt yêu cầu' : 'Không đạt yêu cầu',
        maHoSo,
        maTinTuyenDung
      ]
    );

    await connection.commit();
    return res.status(200).json({
      success: true,
      message: action === 'approve' ? 'Duyệt hồ sơ thành công' : 'Từ chối hồ sơ thành công'
    });

  } catch (error) {
    if (connection) await connection.rollback();
    throw error;
  } finally {
    if (connection) connection.release();
  }
}