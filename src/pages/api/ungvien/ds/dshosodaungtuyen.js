import db from '../../../../../lib/db';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../auth/[...nextauth]';

export default async function handler(req, res) {
  try {
    const session = await getServerSession(req, res, authOptions);
    
    if (!session || session.user.role !== 'ungvien') {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const [appliedJobs] = await db.query(`
      SELECT 
        ttd.MaTinTuyenDung,
        ttd.TieuDe,
        ttd.MoTa,
        ttd.NgayHetHan,
        hs.MaHoSo,
        hs.TenHoSo,
        nhs.NgayNop,
        nhs.TrangThai,
        nhs.KetQuaDuyet,
        nhs.NgayDuyet,
        nhs.LyDoTuChoi,
        ntd.CongTy
      FROM NOP_HO_SO nhs
      JOIN HO_SO hs ON nhs.MaHoSo = hs.MaHoSo
      JOIN TIN_TUYEN_DUNG ttd ON nhs.MaTinTuyenDung = ttd.MaTinTuyenDung
      JOIN UNG_VIEN uv ON hs.MaUngVien = uv.MaUngVien
      JOIN NHA_TUYEN_DUNG ntd ON ttd.MaNhaTuyenDung = ntd.MaNhaTuyenDung
      WHERE uv.Email = ?
      ORDER BY nhs.NgayNop DESC
    `, [session.user.email]);

    return res.status(200).json({
      success: true,
      data: appliedJobs
    });

  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal Server Error'
    });
  }
}