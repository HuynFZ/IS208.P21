import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";
import db from "../../../../lib/db";

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const session = await getServerSession(req, res, authOptions);
  if (!session) {
    return res.status(401).json({ message: 'Chưa đăng nhập' });
  }
  if (session.user.role !== "nhatuyendung") {
    return res.status(403).json({ message: 'Bạn không có quyền truy cập' });
  }

  try {
    const maNhaTuyenDung = session.user.user_code;

    if (!maNhaTuyenDung) {
      return res.status(400).json({ message: 'Không xác định được nhà tuyển dụng' });
    }

    // Lấy danh sách tin tuyển dụng của nhà tuyển dụng
    const [rows] = await db.query(
      `SELECT MaTinTuyenDung, TieuDe, HinhThuc, DiaDiem, MucLuong, NgayDangTin, NgayHetHan, SoLuongYeuCau, TrangThai
       FROM TIN_TUYEN_DUNG
       WHERE MaNhaTuyenDung = ?
       ORDER BY NgayDangTin DESC`,
      [maNhaTuyenDung]
    );

    return res.status(200).json({ success: true, data: rows });
  } catch (err) {
    console.error('Lỗi lấy danh sách tin tuyển dụng:', err);
    return res.status(500).json({ message: 'Lỗi server khi lấy danh sách tin tuyển dụng', error: err.message });
  }
}