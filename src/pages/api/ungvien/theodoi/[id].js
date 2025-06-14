import db from '../../../../../lib/db';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../auth/[...nextauth]';

export default async function handler(req, res) {
  try {
    const session = await getServerSession(req, res, authOptions);
    if (!session || session.user.role !== 'ungvien') {
      return res.status(401).json({
        success: false,
        message: 'Không có quyền truy cập'
      });
    }

    const { id } = req.query; // MaTinTuyenDung

    if (req.method === 'GET') {
      // Lấy thông tin tin tuyển dụng
      const [tinTuyenDung] = await db.query(
        'SELECT * FROM TIN_TUYEN_DUNG WHERE MaTinTuyenDung = ?',
        [id]
      );

      // Lấy danh sách bài test
      const [danhSachTest] = await db.query(`
        SELECT 
          bt.*, lbt.*
        FROM BAI_TEST bt
        JOIN LAM_BAI_TEST lbt ON bt.MaBaiTest = lbt.MaBaiTest
        WHERE bt.MaTinTuyenDung = ? AND lbt.MaUngVien = ?
        ORDER BY bt.ThoiGianBatDau ASC
      `, [id, session.user.user_code]);

      // Lấy danh sách phỏng vấn
      const [danhSachPhongVan] = await db.query(`
        SELECT 
          pv.*, tgpv.*
        FROM PHONG_VAN pv
        JOIN THAM_GIA_PHONG_VAN tgpv ON pv.MaLichPhongVan = tgpv.MaLichPhongVan
        WHERE pv.MaTinTuyenDung = ? AND tgpv.MaUngVien = ?
        ORDER BY tgpv.ThoiGian ASC
      `, [id, session.user.user_code]);

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