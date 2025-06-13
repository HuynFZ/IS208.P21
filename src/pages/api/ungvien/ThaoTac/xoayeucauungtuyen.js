import db from '../../../../../lib/db';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../auth/[...nextauth]';

export default async function handler(req, res) {
  if (req.method !== 'DELETE') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  try {
    console.log('Request query:', req.query); // Debug log
    console.log('Request body:', req.body); // Debug log

    const session = await getServerSession(req, res, authOptions);
    
    if (!session || session.user.role !== 'ungvien') {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    // Try to get parameters from both query and body
    const maHoSo = req.query.maHoSo || req.body.maHoSo;
    const maTinTuyenDung = req.query.maTinTuyenDung || req.body.maTinTuyenDung;

    console.log('Parameters:', { maHoSo, maTinTuyenDung }); // Debug log

    if (!maHoSo || !maTinTuyenDung) {
      return res.status(400).json({
        success: false,
        message: 'Thiếu thông tin bắt buộc',
        debug: { maHoSo, maTinTuyenDung }
      });
    }


    // Kiểm tra quyền sở hữu hồ sơ
    const [ownership] = await db.query(`
      SELECT 1
      FROM HO_SO hs
      JOIN UNG_VIEN uv ON hs.MaUngVien = uv.MaUngVien
      WHERE hs.MaHoSo = ? AND uv.Email = ?
    `, [maHoSo, session.user.email]);

    if (!ownership || ownership.length === 0) {
      return res.status(403).json({
        success: false,
        message: 'Bạn không có quyền hủy yêu cầu này'
      });
    }

    // Kiểm tra trạng thái ứng tuyển
    const [application] = await db.query(`
      SELECT TrangThai
      FROM NOP_HO_SO
      WHERE MaHoSo = ? AND MaTinTuyenDung = ?
    `, [maHoSo, maTinTuyenDung]);

    if (!application || application.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy yêu cầu ứng tuyển'
      });
    }

    if (application[0].TrangThai !== 'Chưa duyệt') {
      return res.status(400).json({
        success: false,
        message: 'Không thể hủy yêu cầu đã được duyệt'
      });
    }

    // Xóa yêu cầu ứng tuyển
    await db.query(`
      DELETE FROM NOP_HO_SO
      WHERE MaHoSo = ? AND MaTinTuyenDung = ?
    `, [maHoSo, maTinTuyenDung]);

    return res.status(200).json({
      success: true,
      message: 'Đã hủy yêu cầu ứng tuyển thành công'
    });

  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal Server Error'
    });
  }
}