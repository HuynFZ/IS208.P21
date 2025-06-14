import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";
import db from "../../../../lib/db";

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { id } = req.query;
  if (!id) return res.status(400).json({ message: 'Thiếu id tin tuyển dụng' });

  try {
    const [rows] = await db.query(
      `SELECT t.*, c.*, n.TenNganhNghe, V.TenLevel
       FROM TIN_TUYEN_DUNG t
       LEFT JOIN NGANH_NGHE n ON t.MaNganhNghe = n.MaNganhNghe
       LEFT JOIN LEVEL V ON t.MaLevel = V.MaLevel
       LEFT JOIN NHA_TUYEN_DUNG c ON t.MaNhaTuyenDung = c.MaNhaTuyenDung
       WHERE t.MaTinTuyenDung = ?`,
      [id]
    );
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Không tìm thấy tin tuyển dụng' });
    }
    return res.status(200).json({ success: true, data: rows[0] });
  } catch (err) {
    return res.status(500).json({ message: 'Lỗi server' });
  }
}