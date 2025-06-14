import db from '../../../../../../lib/db';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../../auth/[...nextauth]';

export default async function handler(req, res) {
  try {
    const session = await getServerSession(req, res, authOptions);
    if (!session || session.user.role !== 'nhatuyendung') {
      return res.status(401).json({ 
        success: false, 
        message: 'Không có quyền truy cập' 
      });
    }

    if (req.method !== 'PUT') {
      return res.status(405).json({ 
        success: false, 
        message: 'Phương thức không được hỗ trợ' 
      });
    }

    const { id: maPhongVan } = req.query;
    const { ungVienId, trangThai } = req.body;

    let connection;
    try {
      connection = await db.getConnection();
      await connection.beginTransaction();

      // Kiểm tra quyền và lấy thông tin phỏng vấn
      const [phongVan] = await connection.query(`
        SELECT pv.*, tgpv.LanThu, nhs.MaHoSo
        FROM PHONG_VAN pv
        JOIN THAM_GIA_PHONG_VAN tgpv ON pv.MaLichPhongVan = tgpv.MaLichPhongVan
        JOIN HO_SO hs ON tgpv.MaUngVien = hs.MaUngVien
        JOIN NOP_HO_SO nhs ON hs.MaHoSo = nhs.MaHoSo AND pv.MaTinTuyenDung = nhs.MaTinTuyenDung
        WHERE pv.MaLichPhongVan = ? 
        AND tgpv.MaUngVien = ?
        AND (pv.TrangThai = 'Đang diễn ra' OR pv.TrangThai = 'Đã kết thúc')`,
        [maPhongVan, ungVienId, session.user.user_code]
      );

      if (!phongVan.length) {
        await connection.rollback();
        return res.status(403).json({
          success: false,
          message: 'Không thể cập nhật trạng thái phỏng vấn này'
        });
      }

      // Cập nhật trạng thái tham gia phỏng vấn
      await connection.query(
        `UPDATE THAM_GIA_PHONG_VAN 
         SET TrangThai = ?
         WHERE MaLichPhongVan = ? AND MaUngVien = ?`,
        [trangThai, maPhongVan, ungVienId]
      );

      // Cập nhật trạng thái hồ sơ dựa vào kết quả phỏng vấn
      const newStatus = trangThai === 'Đã tham gia' 
        ? `Đã phỏng vấn lần ${phongVan[0].LanThu}`
        : `Từ chối phỏng vấn lần ${phongVan[0].LanThu}`;

      await connection.query(
        `UPDATE NOP_HO_SO 
         SET TrangThai = ?
         WHERE MaHoSo = ? AND MaTinTuyenDung = ?`,
        [newStatus, phongVan[0].MaHoSo, phongVan[0].MaTinTuyenDung]
      );

      await connection.commit();
      return res.status(200).json({
        success: true,
        message: 'Cập nhật trạng thái thành công'
      });

    } catch (error) {
      if (connection) await connection.rollback();
      throw error;
    } finally {
      if (connection) connection.release();
    }

  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi hệ thống',
      error: error.message
    });
  }
}