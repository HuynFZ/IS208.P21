import db from '../../../../../lib/db';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../auth/[...nextauth]';

export default async function handler(req, res) {
  try {
    const session = await getServerSession(req, res, authOptions);
    
    if (!session) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    // Chỉ cho phép ứng viên xem hồ sơ của mình
    if (session.user.role !== 'ungvien') {
      return res.status(403).json({ success: false, message: 'Forbidden' });
    }

    const query = `
      SELECT 
        hs.MaHoSo,
        hs.TenHoSo,
        hs.NgayTao,
        COALESCE(dhs.TrangThaiDuyet, 'Chưa duyệt') as TrangThai
      FROM HO_SO hs
      JOIN UNG_VIEN uv ON hs.MaUngVien = uv.MaUngVien
      LEFT JOIN (
        SELECT MaHoSo, TrangThaiDuyet
        FROM DUYET_HO_SO dhs1
        WHERE ThoiGian = (
          SELECT MAX(ThoiGian)
          FROM DUYET_HO_SO dhs2
          WHERE dhs1.MaHoSo = dhs2.MaHoSo
        )
      ) dhs ON hs.MaHoSo = dhs.MaHoSo
      WHERE uv.Email = ?
      AND dhs.TrangThaiDuyet = 'Đã duyệt'
    `;

    console.log('Executing query for email:', session.user.email);
    const [hoSos] = await db.query(query, [session.user.email]);
    console.log('Found profiles:', hoSos.length);

    return res.status(200).json({
      success: true,
      data: hoSos
    });

  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal Server Error'
    });
  }
}