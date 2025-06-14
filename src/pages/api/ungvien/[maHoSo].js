import db from "../../../../lib/db";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";

export default async function handler(req, res) {
  try {
    // Kiểm tra session
    const session = await getServerSession(req, res, authOptions);
    

    if (!session) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    // Kiểm tra quyền truy cập
    const allowedRoles = ['ungvien', 'nhatuyendung', 'qlhoso'];
    if (!allowedRoles.includes(session.user.role)) {
      return res.status(403).json({ success: false, message: 'Forbidden' });
    }

    const { maHoSo } = req.query;

    // Handle GET request - Xem hồ sơ
    if (req.method === 'GET') {
      console.log('Processing GET request for:', maHoSo);

      // Chuẩn bị tham số truy vấn
      let params = [maHoSo];
      
      // Base query
      let baseQuery = `
        SELECT 
          hs.MaHoSo,
          hs.TenHoSo,
          hs.NgayTao,
          uv.MaUngVien,
          uv.TenUngVien,
          uv.Email,
          uv.NgaySinh,
          uv.SDT,
          uv.DiaChi,
          COALESCE(dhs.TrangThaiDuyet, 'Chưa duyệt') as TrangThai,
          dhs.ThoiGian as NgayDuyet,
          dhs.LyDo,
          nv.TenNhanVien as NguoiDuyet
        FROM HO_SO hs
        JOIN UNG_VIEN uv ON hs.MaUngVien = uv.MaUngVien
        LEFT JOIN (
          SELECT 
            MaHoSo, 
            TrangThaiDuyet, 
            ThoiGian, 
            MaNhanVien,
            LyDo
          FROM DUYET_HO_SO dhs1
          WHERE ThoiGian = (
            SELECT MAX(ThoiGian)
            FROM DUYET_HO_SO dhs2
            WHERE dhs1.MaHoSo = dhs2.MaHoSo
          )
        ) dhs ON hs.MaHoSo = dhs.MaHoSo
        LEFT JOIN NHAN_VIEN nv ON dhs.MaNhanVien = nv.MaNhanVien
        WHERE hs.MaHoSo = ?
      `;

      // Thêm điều kiện cho role ungvien
      if (session.user.role === 'ungvien') {
        baseQuery += ' AND uv.Email = ?';
        params.push(session.user.email);
      }


      // Thực thi truy vấn
      const [hoSoData] = await db.query(baseQuery, params);

      if (!hoSoData || hoSoData.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy hồ sơ'
        });
      }

      return res.status(200).json({
        success: true,
        data: hoSoData[0]
      });
    }

    // Handle DELETE request - Xóa hồ sơ
    if (req.method === 'DELETE') {
      console.log('Processing DELETE request for:', maHoSo);

      // Chỉ cho phép ứng viên xóa hồ sơ của mình
      if (session.user.role !== 'ungvien') {
        return res.status(403).json({
          success: false,
          message: 'Chỉ ứng viên mới có thể xóa hồ sơ'
        });
      }

      // Kiểm tra quyền sở hữu hồ sơ
      const [ownership] = await db.query(
        `SELECT hs.MaHoSo 
         FROM HO_SO hs
         JOIN UNG_VIEN uv ON hs.MaUngVien = uv.MaUngVien
         WHERE hs.MaHoSo = ? AND uv.Email = ?`,
        [maHoSo, session.user.email]
      );

      if (!ownership) {
        return res.status(403).json({
          success: false,
          message: 'Không có quyền xóa hồ sơ này'
        });
      }

      // Thực hiện xóa
      await db.query('DELETE FROM HO_SO WHERE MaHoSo = ?', [maHoSo]);

      return res.status(200).json({
        success: true,
        message: 'Đã xóa hồ sơ thành công'
      });
    }

    // Handle unsupported methods
    return res.status(405).json({ 
      success: false,
      message: 'Method not allowed' 
    });

  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi server',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  } 
}