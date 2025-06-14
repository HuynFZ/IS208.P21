import db from "../../../../lib/db";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";

export default async function handler(req, res) {
  try {
    const session = await getServerSession(req, res, authOptions);
    
    if (!session) {
      return res.status(401).json({ 
        success: false, 
        message: "Vui lòng đăng nhập" 
      });
    }

    if (session.user.role !== 'qlhoso') {
      return res.status(403).json({
        success: false,
        message: "Không có quyền truy cập"
      });
    }

    const [rows] = await db.query(
      `SELECT 
        hs.MaHoSo,
        hs.TenHoSo,
        hs.TrangThai,
        hs.NgayTao,
        hs.CV,
        hs.ThuGioiThieu,
        uv.TenUngVien,
        uv.Email,
        uv.SDT,
        uv.DiaChi,
        uv.NgaySinh,
        lsd.MaNhanVien,
        nv.TenNhanVien as NguoiDuyet,
        lsd.ThoiGian as NgayDuyet,
        lsd.LyDo
       FROM HO_SO hs
       INNER JOIN UNG_VIEN uv ON hs.MaUngVien = uv.MaUngVien
       LEFT JOIN (
         SELECT MaHoSo, MaNhanVien, ThoiGian, LyDo
         FROM DUYET_HO_SO lsd1
         WHERE ThoiGian = (
           SELECT MAX(ThoiGian)
           FROM DUYET_HO_SO lsd2
           WHERE lsd1.MaHoSo = lsd2.MaHoSo
         )
       ) lsd ON hs.MaHoSo = lsd.MaHoSo
       LEFT JOIN NHAN_VIEN nv ON lsd.MaNhanVien = nv.MaNhanVien
       ORDER BY 
         CASE 
           WHEN hs.TrangThai = 'Chưa duyệt' THEN 1
           WHEN hs.TrangThai = 'Đã duyệt' THEN 2
           WHEN hs.TrangThai = 'Từ chối' THEN 3
           ELSE 4
         END,
         hs.NgayTao DESC`
    );

    const formattedRows = rows.map(row => ({
      ...row,
      NgayTao: row.NgayTao ? new Date(row.NgayTao).toISOString() : null,
      NgayDuyet: row.NgayDuyet ? new Date(row.NgayDuyet).toISOString() : null,
      NgaySinh: row.NgaySinh ? new Date(row.NgaySinh).toISOString() : null
    }));

    return res.status(200).json({
      success: true,
      data: formattedRows
    });

  } catch (error) {
    console.error("API Error:", error);
    return res.status(500).json({ 
      success: false, 
      message: "Lỗi hệ thống" 
    });
  }
}