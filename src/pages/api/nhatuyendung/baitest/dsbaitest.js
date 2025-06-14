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
    if (!session || session.user.role !== 'nhatuyendung') {
      return res.status(401).json({ message: "Unauthorized" });
    }

    connection = await db.getConnection();

    const [tests] = await connection.query(`
      SELECT 
        bt.MaBaiTest,
        bt.TieuDe,
        bt.MoTa,
        bt.LinkTest,
        bt.ThoiGianBatDau,
        bt.ThoiGianKetThuc,
        bt.HanXacNhan,
        bt.TrangThai,
        ttd.TieuDe as TenTinTuyenDung,
        COUNT(DISTINCT lbt.MaUngVien) as SoLuotLam,
        AVG(CASE WHEN lbt.TrangThai = 'Đã chấm điểm' THEN lbt.KetQua END) as DiemTrungBinh,
        COUNT(DISTINCT CASE WHEN lbt.TrangThai = 'Đã làm' THEN lbt.MaUngVien END) as SoDaLam
      FROM BAI_TEST bt
      LEFT JOIN TIN_TUYEN_DUNG ttd ON bt.MaTinTuyenDung = ttd.MaTinTuyenDung
      LEFT JOIN LAM_BAI_TEST lbt ON bt.MaBaiTest = lbt.MaBaiTest
      WHERE bt.MaNhaTuyenDung = ?
      GROUP BY 
        bt.MaBaiTest, 
        bt.TieuDe, 
        bt.MoTa, 
        bt.LinkTest,
        bt.ThoiGianBatDau,
        bt.ThoiGianKetThuc,
        bt.HanXacNhan,
        bt.TrangThai,
        ttd.TieuDe
      ORDER BY bt.ThoiGianBatDau DESC
    `, [session.user.user_code]);

    return res.status(200).json({
      success: true,
      data: tests
    });

  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  } finally {
    if (connection) connection.release();
  }
}