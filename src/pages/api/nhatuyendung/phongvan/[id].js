import db from '../../../../../lib/db';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../auth/[...nextauth]';

export default async function handler(req, res) {
  const { method } = req;

  try {
    const session = await getServerSession(req, res, authOptions);
    if (!session || session.user.role !== 'nhatuyendung') {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    switch (method) {
      case 'GET':
        return handleGet(req, res, session);
      case 'PUT':
        return handleUpdate(req, res, session);
      case 'DELETE':
        return handleDelete(req, res, session);
      case 'PATCH': // method mới cho cập nhật trạng thái tham gia
        return handleUpdateAttendance(req, res, session);
      default:
        return res.status(405).json({ success: false, message: 'Method not allowed' });
    }
  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
}

async function handleGet(req, res, session) {
  const { id } = req.query;
  const [interviews] = await db.query(`
    SELECT 
      pv.*,
      ttd.TieuDe as TenTinTuyenDung,
      COUNT(DISTINCT tgpv.MaUngVien) as SoUngVien,
      COUNT(DISTINCT CASE WHEN tgpv.TrangThai = 'Đã xác nhận' THEN tgpv.MaUngVien END) as SoXacNhan
    FROM PHONG_VAN pv
    LEFT JOIN TIN_TUYEN_DUNG ttd ON pv.MaTinTuyenDung = ttd.MaTinTuyenDung
    LEFT JOIN THAM_GIA_PHONG_VAN tgpv ON pv.MaLichPhongVan = tgpv.MaLichPhongVan
    WHERE pv.MaLichPhongVan = ? AND pv.MaNhaTuyenDung = ?
    GROUP BY pv.MaLichPhongVan
  `, [id, session.user.user_code]);

  if (!interviews.length) {
    return res.status(404).json({ 
      success: false, 
      message: 'Không tìm thấy thông tin phỏng vấn' 
    });
  }

  return res.status(200).json({
    success: true,
    data: interviews[0]
  });
}

async function handleDelete(req, res, session) {
  const { id } = req.query;
  let connection;

  try {
    connection = await db.getConnection();
    await connection.beginTransaction();

    // Check if interview exists and belongs to this recruiter
    const [interviews] = await connection.query(
      'SELECT * FROM PHONG_VAN WHERE MaLichPhongVan = ? AND MaNhaTuyenDung = ?',
      [id, session.user.user_code]
    );

    if (!interviews.length) {
      await connection.rollback();
      return res.status(404).json({ 
        success: false, 
        message: 'Không tìm thấy phỏng vấn' 
      });
    }

    // Check if interview can be deleted
    const interview = interviews[0];
    if (interview.TrangThai === 'Đã kết thúc' || interview.TrangThai === 'Đã hủy') {
      await connection.rollback();
      return res.status(400).json({ 
        success: false, 
        message: 'Không thể xóa phỏng vấn đã kết thúc hoặc đã hủy' 
      });
    }

    // Update status to 'Đã hủy' (soft delete)
    await connection.query(
      'UPDATE PHONG_VAN SET TrangThai = ? WHERE MaLichPhongVan = ?',
      ['Đã hủy', id]
    );

    await connection.commit();
    return res.status(200).json({
      success: true,
      message: 'Xóa phỏng vấn thành công'
    });

  } catch (error) {
    if (connection) await connection.rollback();
    throw error;
  } finally {
    if (connection) connection.release();
  }
}

// Thêm hàm xử lý cập nhật
async function handleUpdate(req, res, session) {
  const { id } = req.query;
  const { 
    maTinTuyenDung,
    moTa,
    diaChi,
    thoiGianBatDau,
    thoiGianKetThuc,
    hanXacNhan 
  } = req.body;
  
  let connection;

  try {
    connection = await db.getConnection();
    await connection.beginTransaction();

    // Kiểm tra phỏng vấn tồn tại và thuộc về nhà tuyển dụng
    const [interviews] = await connection.query(
      'SELECT * FROM PHONG_VAN WHERE MaLichPhongVan = ? AND MaNhaTuyenDung = ?',
      [id, session.user.user_code]
    );

    if (!interviews.length) {
      await connection.rollback();
      return res.status(404).json({ 
        success: false, 
        message: 'Không tìm thấy phỏng vấn' 
      });
    }

    // Kiểm tra trạng thái có cho phép cập nhật
    const interview = interviews[0];
    if (interview.TrangThai === 'Đã kết thúc' || interview.TrangThai === 'Đã hủy') {
      await connection.rollback();
      return res.status(400).json({ 
        success: false, 
        message: 'Không thể cập nhật phỏng vấn đã kết thúc hoặc đã hủy' 
      });
    }

    // Cập nhật thông tin phỏng vấn
    await connection.query(`
      UPDATE PHONG_VAN 
      SET 
        MaTinTuyenDung = ?,
        MoTa = ?,
        DiaChi = ?,
        ThoiGianBatDau = ?,
        ThoiGianKetThuc = ?,
        HanXacNhan = ?,
        TrangThai = CASE 
          WHEN ? < NOW() THEN 'Đã kết thúc'
          WHEN ? <= NOW() AND NOW() <= ? THEN 'Đang diễn ra'
          ELSE 'Chưa diễn ra'
        END
      WHERE MaLichPhongVan = ?
    `, [
      maTinTuyenDung,
      moTa,
      diaChi,
      thoiGianBatDau,
      thoiGianKetThuc,
      hanXacNhan,
      thoiGianKetThuc, // For status check
      thoiGianBatDau,  // For status check
      thoiGianKetThuc, // For status check
      id
    ]);

    await connection.commit();
    return res.status(200).json({
      success: true,
      message: 'Cập nhật phỏng vấn thành công'
    });

  } catch (error) {
    if (connection) await connection.rollback();
    console.error('API Error:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Lỗi hệ thống' 
    });
  } finally {
    if (connection) connection.release();
  }
}

// Thêm hàm mới xử lý cập nhật trạng thái tham gia phỏng vấn
async function handleUpdateAttendance(req, res, session) {
  const { id } = req.query;
  const { thamGiaId, trangThai } = req.body;

  let connection;
  try {
    connection = await db.getConnection();
    await connection.beginTransaction();

    // Kiểm tra quyền và lấy thông tin phỏng vấn
    const [phongVan] = await connection.query(`
      SELECT tgpv.*, pv.MaNhaTuyenDung, hs.MaHoSo, hs.MaTinTuyenDung, tgpv.LanThu
      FROM THAM_GIA_PHONG_VAN tgpv
      JOIN PHONG_VAN pv ON tgpv.MaLichPhongVan = pv.MaLichPhongVan
      JOIN HO_SO_UNG_TUYEN hs ON hs.MaUngVien = tgpv.MaUngVien AND hs.MaTinTuyenDung = pv.MaTinTuyenDung
      WHERE tgpv.ID = ? AND pv.MaLichPhongVan = ?`,
      [thamGiaId, id]
    );

    if (!phongVan.length || phongVan[0].MaNhaTuyenDung !== session.user.user_code) {
      await connection.rollback();
      return res.status(403).json({
        success: false,
        message: 'Không có quyền cập nhật'
      });
    }

    // Cập nhật trạng thái tham gia phỏng vấn
    await connection.query(
      `UPDATE THAM_GIA_PHONG_VAN 
       SET TrangThai = ?
       WHERE ID = ?`,
      [trangThai, thamGiaId]
    );

    // Nếu xác nhận đã tham gia, cập nhật trạng thái hồ sơ
    if (trangThai === 'Đã tham gia') {
      await connection.query(
        `UPDATE HO_SO_UNG_TUYEN 
         SET TrangThai = ?
         WHERE MaHoSo = ? AND MaTinTuyenDung = ?`,
        [`Đã phỏng vấn lần ${phongVan[0].LanThu}`, phongVan[0].MaHoSo, phongVan[0].MaTinTuyenDung]
      );
    }

    await connection.commit();
    return res.status(200).json({
      success: true,
      message: 'Cập nhật trạng thái thành công'
    });

  } catch (error) {
    if (connection) await connection.rollback();
    console.error('API Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi hệ thống'
    });
  } finally {
    if (connection) connection.release();
  }
}