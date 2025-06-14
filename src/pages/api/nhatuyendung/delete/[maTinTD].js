import { withEmployerAuth } from '@/middleware/auth';
import db from '../../../../../lib/db';
import { verifyToken } from '@/lib/jwt';

export default withEmployerAuth(async (req, res) => {
  if (req.method !== 'DELETE') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { maTinTD } = req.query;

  if (!maTinTD) {
    return res.status(400).json({ message: 'Thiếu mã tin tuyển dụng' });
  }

  try {
    const token = req.headers.authorization?.split(' ')[1];
    const decodedToken = verifyToken(token);
    const maNhaTuyenDung = decodedToken?.user_code;

    const [existing] = await db.query(
      'SELECT TrangThai, MaNhaTuyenDung FROM TIN_TUYEN_DUNG WHERE MaTinTD = ?',
      [maTinTD]
    );

    if (existing.length === 0) {
      return res.status(404).json({ message: 'Tin tuyển dụng không tồn tại' });
    }

    const tin = existing[0];
    if (tin.MaNhaTuyenDung !== maNhaTuyenDung) {
      return res.status(403).json({ message: 'Bạn không có quyền xóa tin này' });
    }

    if (tin.TrangThai !== 'pending' && tin.TrangThai !== 'rejected') {
      return res.status(400).json({ message: 'Chỉ có thể xóa tin ở trạng thái chờ duyệt hoặc đã hủy' });
    }

    await db.query('DELETE FROM TIN_TUYEN_DUNG WHERE MaTinTD = ?', [maTinTD]);

    return res.status(200).json({ success: true, message: 'Xóa tin tuyển dụng thành công' });
  } catch (err) {
    console.error('Lỗi xóa tin:', err);
    return res.status(500).json({ message: 'Lỗi server khi xóa tin' });
  }
});