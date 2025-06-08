import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";
import db from "../../../../lib/db";

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const session = await getServerSession(req, res, authOptions);
  if (!session) {
    return res.status(401).json({ message: 'Chưa đăng nhập' });
  }
  if (session.user.role !== "qltintd") {
    return res.status(403).json({ message: 'Bạn không có quyền duyệt tin tuyển dụng' });
  }

  const { id, action } = req.body; // id: mã tin, action: 'approve' hoặc 'reject'
  if (!id || !['approve', 'reject'].includes(action)) {
    return res.status(400).json({ message: 'Thiếu thông tin hoặc action không hợp lệ' });
  }

  try {
    const status = action === 'approve' ? 'Đã Duyệt' : 'Đã Từ Chối';
    await db.query(
      'UPDATE TIN_TUYEN_DUNG SET TrangThai = ?, NgayDuyet = ? WHERE MaTinTuyenDung = ?',
      [status, new Date().toISOString().split('T')[0], id]
    );
    return res.status(200).json({ success: true, message: `Tin đã được ${action === 'approve' ? 'duyệt' : 'từ chối'}` });
  } catch (err) {
    return res.status(500).json({ message: 'Lỗi server' });
  }
}