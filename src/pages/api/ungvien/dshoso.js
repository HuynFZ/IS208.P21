import db from "../../../../lib/db";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const session = await getServerSession(req, res, authOptions);
    if (!session) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const maUngVien = session.user.id;

    //  chỉ lấy từ bảng HO_SO trước
    const [rows] = await db.query(
      `SELECT hs.MaHoSo, hs.MaUngVien, hs.CV, hs.ThuGioiThieu 
       FROM HO_SO hs 
       WHERE hs.MaUngVien = ?`,
      [maUngVien]
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