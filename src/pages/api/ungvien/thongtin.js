import db from "../../../../lib/db";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";

export default async function handler(req, res) {
  if (req.method !== "GET") return res.status(405).json({ message: "Method not allowed" });
  try {
    const session = await getServerSession(req, res, authOptions);
    if (!session) return res.status(401).json({ message: "Unauthorized" });
    const maUngVien = session.user.user_code; 
    const [rows] = await db.query(
      "SELECT TenUngVien, Email, NgaySinh, SDT, DiaChi, CV FROM UNG_VIEN WHERE MaUngVien = ?",
      [maUngVien]
    );
    if (!rows.length) return res.status(404).json({ message: "Không tìm thấy ứng viên" });
    const uv = rows[0];
    return res.status(200).json({
      data: {
        TenUngVien: uv.TenUngVien,
        Email: uv.Email,
        NgaySinh: uv.NgaySinh,
        SDT: uv.SDT,
        DiaChi: uv.DiaChi,
        CV: uv.CV ? true : false 
      }
    });
  } catch (err) {
    return res.status(500).json({ message: "Lỗi server", error: err.message });
  }
}