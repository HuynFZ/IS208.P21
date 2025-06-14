import db from '../../../../../../../lib/db';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../../../auth/[...nextauth]';

export default async function handler(req, res) {
  try {
    const session = await getServerSession(req, res, authOptions);
    if (!session || session.user.role !== 'ungvien') {
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

    const { type, id } = req.query;
    const { action } = req.body;

    let connection;
    try {
      connection = await db.getConnection();
      await connection.beginTransaction();

      if (type === 'test') {
        // Cập nhật cho bài test
        await connection.query(
          `UPDATE LAM_BAI_TEST 
           SET TrangThaiXacNhan = ?,
               TrangThai = CASE 
                 WHEN ? = 'Từ chối' THEN 'Đã từ chối'
                 WHEN ? = 'Xác nhận' THEN 'Chưa làm'
                 ELSE TrangThai 
               END,
               NgayLam = CASE 
                 WHEN ? = 'Xác nhận' THEN NOW()
                 ELSE NgayLam 
               END
           WHERE ID = ? AND MaUngVien = ?`,
          [action, action, action, action, id, session.user.user_code]
        );
      } else if (type === 'phongvan') {
        // Cập nhật cho phỏng vấn
        await connection.query(
          `UPDATE THAM_GIA_PHONG_VAN 
           SET TrangThaiXacNhan = ?,
               TrangThai = CASE 
                 WHEN ? = 'Từ chối' THEN 'Không tham gia'
                 WHEN ? = 'Xác nhận' THEN 'Chưa diễn ra'
                 ELSE TrangThai 
               END
           WHERE ID = ? AND MaUngVien = ?`,
          [action, action, action, id, session.user.user_code]
        );
      }

      await connection.commit();
      return res.status(200).json({
        success: true,
        message: action === 'Xác nhận' ? 'Xác nhận thành công' : 'Từ chối thành công'
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