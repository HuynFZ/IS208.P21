import db from '../../../../../lib/db';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../auth/[...nextauth]';

export default async function handler(req, res) {
  try {
    // Kiểm tra đăng nhập và quyền nhà tuyển dụng
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

    const { maBaiTest, maUngVien, maTinTuyenDung } = req.body;

    // Bắt đầu transaction
    let connection;
    try {
      connection = await db.getConnection();
      await connection.beginTransaction();

      // Kiểm tra quyền sở hữu bài test
      const [testOwnership] = await connection.query(
        'SELECT * FROM BAI_TEST WHERE MaBaiTest = ? AND MaNhaTuyenDung = ?',
        [maBaiTest, session.user.user_code]
      );

      if (!testOwnership.length) {
        await connection.rollback();
        return res.status(403).json({
          success: false,
          message: 'Không có quyền gán bài test này'
        });
      }

      // Thêm vào bảng LAM_BAI_TEST
      await connection.query(
        `INSERT INTO LAM_BAI_TEST (MaBaiTest, MaUngVien, TrangThai)
         VALUES (?, ?, 'Chưa làm')`,
        [maBaiTest, maUngVien]
      );

      await connection.commit();
      return res.status(200).json({
        success: true,
        message: 'Gán bài test thành công'
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