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

    const { id } = req.query; // MaBaiTest

    if (req.method === 'GET') {
      const [danhSach] = await db.query(`
        SELECT 
          lbt.*,
          uv.TenUngVien,
          uv.Email
        FROM LAM_BAI_TEST lbt
        JOIN UNG_VIEN uv ON lbt.MaUngVien = uv.MaUngVien
        JOIN BAI_TEST bt ON lbt.MaBaiTest = bt.MaBaiTest
        WHERE bt.MaBaiTest = ? AND bt.MaNhaTuyenDung = ?
        ORDER BY lbt.NgayLam DESC`,
        [id, session.user.user_code]
      );

      return res.status(200).json({
        success: true,
        danhSach
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