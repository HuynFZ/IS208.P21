import db from "../../../../../lib/db";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  let connection;
  try {
    const session = await getServerSession(req, res, authOptions);
    console.log('Session:', session); // Debug session

    if (!session || session.user.role !== 'nhatuyendung') {
      return res.status(401).json({ message: "Unauthorized" });
    }

    connection = await db.getConnection();

    // Cập nhật query để lấy thêm thông tin thời gian và trạng thái
    const [interviews] = await connection.query(`
      SELECT 
        pv.MaLichPhongVan,
        pv.TieuDe,
        pv.MoTa,
        pv.ThoiGianBatDau,
        pv.ThoiGianKetThuc,
        pv.HanXacNhan,
        pv.TrangThai,
        ttd.TieuDe as TenTinTuyenDung,
        COUNT(DISTINCT tgpv.MaUngVien) as SoUngVien,
        COUNT(DISTINCT CASE WHEN tgpv.TrangThai = 'Đã xác nhận' THEN tgpv.MaUngVien END) as SoXacNhan
      FROM PHONG_VAN pv
      LEFT JOIN TIN_TUYEN_DUNG ttd ON pv.MaTinTuyenDung = ttd.MaTinTuyenDung
      LEFT JOIN THAM_GIA_PHONG_VAN tgpv ON pv.MaLichPhongVan = tgpv.MaLichPhongVan
      WHERE pv.MaNhaTuyenDung = ?
      GROUP BY 
        pv.MaLichPhongVan, 
        pv.TieuDe, 
        pv.MoTa, 
        pv.ThoiGianBatDau,
        pv.ThoiGianKetThuc,
        pv.HanXacNhan,
        pv.TrangThai,
        ttd.TieuDe
      ORDER BY pv.ThoiGianBatDau DESC
    `, [session.user.user_code]);

    console.log('Query result:', interviews); // Debug kết quả

    return res.status(200).json({
      success: true,
      data: interviews
    });

  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Internal server error',
      error: error.message 
    });
  } finally {
    if (connection) connection.release();
  }
}