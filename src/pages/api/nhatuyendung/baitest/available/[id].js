import db from '../../../../../../lib/db';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../../auth/[...nextauth]';

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

    if (req.method !== 'GET') {
      return res.status(405).json({
        success: false,
        message: 'Phương thức không được hỗ trợ'
      });
    }

    const { id } = req.query; // id là MaTinTuyenDung

    // Lấy danh sách bài test chưa diễn ra
    const [tests] = await db.query(`
      SELECT *
      FROM BAI_TEST
      WHERE MaTinTuyenDung = ?
      AND MaNhaTuyenDung = ?
      AND ThoiGianBatDau > NOW()
      AND TrangThai = 'Chưa diễn ra'
      ORDER BY ThoiGianBatDau ASC
    `, [id, session.user.user_code]);

    return res.status(200).json({
      success: true,
      data: tests
    });

  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi hệ thống'
    });
  }
}