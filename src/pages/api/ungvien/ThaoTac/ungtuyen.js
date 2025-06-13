import db from '../../../../../lib/db';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../auth/[...nextauth]';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  let connection;
  try {
    const session = await getServerSession(req, res, authOptions);
    console.log('Session:', session);
    
    if (!session || session.user.role !== 'ungvien') {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const { maHoSo, maTinTuyenDung } = req.body;
    console.log('Request body:', { maHoSo, maTinTuyenDung });

    if (!maHoSo || !maTinTuyenDung) {
      return res.status(400).json({
        success: false,
        message: 'Thiếu thông tin bắt buộc: mã hồ sơ hoặc mã tin tuyển dụng'
      });
    }

    connection = await db.getConnection();
    await connection.beginTransaction();

    // Kiểm tra hồ sơ có tồn tại và đã được duyệt chưa
    const [hoSoCheck] = await connection.query(`
      SELECT 
        hs.MaHoSo,
        hs.TenHoSo,
        hs.NgayTao,
        hs.TrangThai as TrangThaiHoSo,
        uv.MaUngVien,
        uv.TenUngVien,
        uv.Email,
        uv.SDT,
        uv.DiaChi,
        dhs.trangthaiduyet as TrangThaiDuyet
      FROM HO_SO hs
      JOIN UNG_VIEN uv ON hs.MaUngVien = uv.MaUngVien
      LEFT JOIN (
        SELECT MaHoSo, trangthaiduyet
        FROM DUYET_HO_SO dhs1
        WHERE ThoiGian = (
          SELECT MAX(ThoiGian)
          FROM DUYET_HO_SO dhs2
          WHERE dhs1.MaHoSo = dhs2.MaHoSo
        )
      ) dhs ON hs.MaHoSo = dhs.MaHoSo
      WHERE hs.MaHoSo = ? AND uv.Email = ?
    `, [maHoSo, session.user.email]);


    if (!hoSoCheck || hoSoCheck.length === 0) {
      await connection.rollback();
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy hồ sơ'
      });
    }

    if (hoSoCheck[0].TrangThaiDuyet !== 'Đã duyệt') {
      await connection.rollback();
      return res.status(400).json({
        success: false,
        message: 'Hồ sơ chưa được duyệt hoặc đã bị từ chối'
      });
    }

    // Kiểm tra tin tuyển dụng còn hiệu lực
    const [tinTuyenDung] = await connection.query(`
      SELECT * FROM TIN_TUYEN_DUNG 
      WHERE MaTinTuyenDung = ? 
      AND TrangThai = 'Đã duyệt'
      AND NgayHetHan >= CURDATE()
    `, [maTinTuyenDung]);

    if (!tinTuyenDung || tinTuyenDung.length === 0) {
      await connection.rollback();
      return res.status(400).json({
        success: false,
        message: 'Tin tuyển dụng không tồn tại hoặc đã hết hạn'
      });
    }

    // Kiểm tra đã nộp hồ sơ chưa
        const [existing] = await connection.query(
      'SELECT * FROM NOP_HO_SO WHERE MaHoSo = ? AND MaTinTuyenDung = ?',
      [maHoSo, maTinTuyenDung]
    );

    if (existing && existing.length > 0) {
      await connection.rollback();
      return res.status(400).json({
        success: false,
        message: 'Bạn đã nộp hồ sơ này cho vị trí này rồi'
      });
    }

    // Thêm vào bảng NOP_HO_SO với đúng cấu trúc
    await connection.query(`
      INSERT INTO NOP_HO_SO (
        MaHoSo,
        MaTinTuyenDung,
        TrangThai,
        NgayNop,
        GhiChu
      ) VALUES (?, ?, ?, NOW(), ?)`,
      [
        maHoSo,
        maTinTuyenDung,
        'Chưa duyệt',
        `Hồ sơ được nộp bởi ứng viên ${hoSoCheck[0].TenUngVien}`
      ]
    );

    await connection.commit();
    console.log('Nộp hồ sơ thành công:', {
      maHoSo,
      maTinTuyenDung,
      ungVien: hoSoCheck[0].TenUngVien
    });

    return res.status(200).json({
      success: true,
      message: 'Nộp hồ sơ thành công'
    });

  } catch (error) {
    console.error('API Error:', error);
    if (connection) await connection.rollback();
    
    return res.status(500).json({
      success: false,
      message: 'Có lỗi xảy ra khi xử lý yêu cầu',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  } finally {
    if (connection) connection.release();
  }
}