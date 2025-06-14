import db from '../../../../../lib/db';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../auth/[...nextauth]';

export default async function handler(req, res) {
  try {
    const session = await getServerSession(req, res, authOptions);
    if (!session || session.user.role !== 'nhatuyendung') {
      return res.status(401).json({
        success: false,
        message: 'Không có quyền truy cập'
      });
    }

    const { id } = req.query;

    if (req.method === 'GET') {
      // Lấy thông tin tin tuyển dụng
      const [tinTuyenDung] = await db.query(
        'SELECT * FROM TIN_TUYEN_DUNG WHERE MaTinTuyenDung = ? AND MaNhaTuyenDung = ?',
        [id, session.user.user_code]
      );

      // Lấy danh sách bài test
      const [danhSachTest] = await db.query(`
        SELECT * FROM BAI_TEST 
        WHERE MaTinTuyenDung = ? AND MaNhaTuyenDung = ?
        ORDER BY ThoiGianBatDau DESC`,
        [id, session.user.user_code]
      );

      // Lấy danh sách phỏng vấn
      const [danhSachPhongVan] = await db.query(`
        SELECT * FROM PHONG_VAN
        WHERE MaTinTuyenDung = ? AND MaNhaTuyenDung = ?
        ORDER BY ThoiGianBatDau DESC`,
        [id, session.user.user_code]
      );

      return res.status(200).json({
        success: true,
        tinTuyenDung: tinTuyenDung[0],
        danhSachTest,
        danhSachPhongVan
      });
    }

    return res.status(405).json({
      success: false,
      message: 'Phương thức không được hỗ trợ'
    });

  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi hệ thống'
    });
  }
}