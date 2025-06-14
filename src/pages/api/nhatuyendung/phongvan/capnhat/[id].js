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

    const { id } = req.query; // ID của THAM_GIA_PHONG_VAN
    const { trangThai } = req.body;

    let connection;
    try {
      connection = await db.getConnection();
      await connection.beginTransaction();

      // Lấy thông tin phỏng vấn
      const [phongVan] = await connection.query(`
        SELECT tgpv.*, pv.MaNhaTuyenDung, hs.MaHoSo, hs.MaTinTuyenDung, tgpv.LanThu
        FROM THAM_GIA_PHONG_VAN tgpv
        JOIN PHONG_VAN pv ON tgpv.MaLichPhongVan = pv.MaLichPhongVan
        JOIN HO_SO_UNG_TUYEN hs ON hs.MaUngVien = tgpv.MaUngVien AND hs.MaTinTuyenDung = pv.MaTinTuyenDung
        WHERE tgpv.ID = ?`,
        [id]
      );

      if (!phongVan.length || phongVan[0].MaNhaTuyenDung !== session.user.user_code) {
        await connection.rollback();
        return res.status(403).json({
          success: false,
          message: 'Không có quyền cập nhật'
        });
      }

      // Cập nhật trạng thái phỏng vấn
      await connection.query(
        `UPDATE THAM_GIA_PHONG_VAN 
         SET TrangThai = ?
         WHERE ID = ?`,
        [trangThai, id]
      );

      // Cập nhật trạng thái hồ sơ nếu đã tham gia
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
      throw error;
    } finally {
      if (connection) connection.release();
    }

  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi hệ thống'
    });
  }
}