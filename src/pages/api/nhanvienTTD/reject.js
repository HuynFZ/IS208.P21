import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]";
import db from "../../../../../lib/db";

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const session = await getServerSession(req, res, authOptions);
  if (!session) {
    return res.status(401).json({ message: 'Chưa đăng nhập' });
  }
  // Chỉ cho phép qltintd hoặc admin từ chối tin
  if (!["qltintd", "admin"].includes(session.user.role)) {
    return res.status(403).json({ message: 'Bạn không có quyền từ chối tin tuyển dụng' });
  }

  const { maTinTD } = req.body;
  if (!maTinTD) {
    return res.status(400).json({ message: 'Thiếu mã tin tuyển dụng' });
  }

  try {
    const [existing] = await db.query(
      'SELECT TrangThai FROM TIN_TUYEN_DUNG WHERE MaTinTuyenDung = ?',
      [maTinTD]
    );

    if (existing.length === 0) {
      return res.status(404).json({ message: 'Tin tuyển dụng không tồn tại' });
    }

    const tin = existing[0];
    if (tin.TrangThai === 'Đã Từ Chối' || tin.TrangThai === 'Đã Hủy' || tin.TrangThai === 'Đã Duyệt') {
      return res.status(400).json({ message: 'Tin này không thể từ chối' });
    }

    await db.query(
      'UPDATE TIN_TUYEN_DUNG SET TrangThai = ?, NgayDuyet = ? WHERE MaTinTuyenDung = ?',
      ['Đã Từ Chối', new Date().toISOString().split('T')[0], maTinTD]
    );

    return res.status(200).json({ success: true, message: 'Tin tuyển dụng đã bị từ chối' });
  } catch (err) {
    console.error('Lỗi từ chối tin:', err);
    return res.status(500).json({ message: 'Lỗi server khi từ chối tin' });
  }
}