import db from '../../../../lib/db';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';

export default async function handler(req, res) {
  try {
    const session = await getServerSession(req, res, authOptions);
    if (!session || session.user.role !== 'nhatuyendung') {
      return res.status(401).json({ 
        success: false, 
        message: 'Không có quyền truy cập' 
      });
    }

    if (req.method !== 'POST') {
      return res.status(405).json({ 
        success: false, 
        message: 'Phương thức không được hỗ trợ' 
      });
    }

    const { maHoSo, maTinTuyenDung, noiDung, trangThaiDanhGia } = req.body;

    let connection;
    try {
      connection = await db.getConnection();
      await connection.beginTransaction();

      // Check if evaluation exists
      const [existing] = await connection.query(
        `SELECT * FROM DANH_GIA 
         WHERE MaHoSo = ? AND MaTinTuyenDung = ? AND MaNhaTuyenDung = ?`,
        [maHoSo, maTinTuyenDung, session.user.user_code]
      );

      if (existing.length > 0) {
        // Update existing evaluation
        await connection.query(
          `UPDATE DANH_GIA 
           SET NoiDung = ?, TrangThaiDanhGia = ?, NgayDanhGia = CURRENT_TIMESTAMP
           WHERE MaHoSo = ? AND MaTinTuyenDung = ? AND MaNhaTuyenDung = ?`,
          [noiDung, trangThaiDanhGia, maHoSo, maTinTuyenDung, session.user.user_code]
        );
      } else {
        // Create new evaluation
        await connection.query(
          `INSERT INTO DANH_GIA (MaHoSo, MaTinTuyenDung, MaNhaTuyenDung, NoiDung, TrangThaiDanhGia)
           VALUES (?, ?, ?, ?, ?)`,
          [maHoSo, maTinTuyenDung, session.user.user_code, noiDung, trangThaiDanhGia]
        );
      }

      await connection.commit();
      return res.status(200).json({
        success: true,
        message: 'Đánh giá ứng viên thành công'
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