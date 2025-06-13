import db from "../../../../../lib/db";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const session = await getServerSession(req, res, authOptions);
    if (!session) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const [rows] = await db.query(
      `SELECT 
        hs.MaHoSo,
        hs.TenHoSo,
        hs.NgayTao,
        uv.TenUngVien,
        uv.Email,
        uv.SDT,
        hs.TrangThai,
        nhs.TrangThaiDuyet,

        nhs.LyDo,
       
        nv.TenNhanVien as NguoiDuyet

      FROM HO_SO hs 
      JOIN UNG_VIEN uv ON hs.MaUngVien = uv.MaUngVien
      LEFT JOIN DUYET_HO_SO nhs ON hs.MaHoSo = nhs.MaHoSo
      LEFT JOIN NHAN_VIEN nv ON nhs.MaNhanVien = nv.MaNhanVien
      WHERE uv.Email = ?
      ORDER BY 
        CASE 
          WHEN nhs.TrangThaiDuyet = 'Chưa duyệt' THEN 1
          WHEN nhs.TrangThaiDuyet = 'Đã duyệt' THEN 2
          ELSE 3
        END,
        hs.NgayTao DESC`,
      [session.user.email]
    );
    return res.status(200).json({
      success: true,
      data: rows
    });

  } catch (error) {
    console.error("API dshoso error:", error);
    return res.status(500).json({ 
      success: false,
      message: "Lỗi server",
      error: error.message 
    });
  }
}