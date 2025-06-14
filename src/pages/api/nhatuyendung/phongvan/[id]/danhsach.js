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

    if (req.method !== 'GET') {
      return res.status(405).json({ 
        success: false, 
        message: 'Phương thức không được hỗ trợ' 
      });
    }

    const { id } = req.query; // MaLichPhongVan

    let connection;
    try {
      connection = await db.getConnection();

      // Lấy danh sách ứng viên tham gia phỏng vấn với kiểm tra hạn xác nhận
      const [danhSach] = await connection.query(`
        SELECT 
          tgpv.*,
          uv.TenUngVien,
          uv.Email,
          pv.HanXacNhan,
          pv.TrangThai as TrangThaiPhongVan,
          CURRENT_TIMESTAMP <= pv.HanXacNhan as ConHanXacNhan
        FROM THAM_GIA_PHONG_VAN tgpv
        JOIN UNG_VIEN uv ON tgpv.MaUngVien = uv.MaUngVien
        JOIN PHONG_VAN pv ON tgpv.MaLichPhongVan = pv.MaLichPhongVan
        WHERE tgpv.MaLichPhongVan = ?
        AND pv.MaNhaTuyenDung = ?
        ORDER BY tgpv.ThoiGian DESC
      `, [id, session.user.user_code]);

      return res.status(200).json({
        success: true,
        danhSach: danhSach || []
      });

    } catch (error) {
      console.error('Database Error:', error);
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