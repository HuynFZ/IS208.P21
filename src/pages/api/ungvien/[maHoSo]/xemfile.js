import db from "../../../../../lib/db";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]";

export default async function handler(req, res) {
  console.log('API được gọi với method:', req.method);
  console.log('Query params:', req.query);
  
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const session = await getServerSession(req, res, authOptions);
    if (!session) {
      return res.status(401).json({ message: 'Chưa đăng nhập' });
    }

    const { maHoSo, type } = req.query;
    console.log('API nhận request:', { 
      maHoSo, 
      type, 
      email: session.user.email,
      headers: req.headers
    });

    if (!type || !['cv', 'letter'].includes(type)) {
      return res.status(400).json({
        success: false,
        message: 'Loại file không hợp lệ'
      });
    }

    const [fileData] = await db.query(
      `SELECT 
        CAST(hs.${type === 'cv' ? 'CV' : 'ThuGioiThieu'} AS BINARY) as file,
        hs.TenHoSo
      FROM HO_SO hs
      JOIN UNG_VIEN uv ON hs.MaUngVien = uv.MaUngVien
      WHERE hs.MaHoSo = ? AND uv.Email = ?`,
      [maHoSo, session.user.email]
    );

    console.log('Kết quả query:', {
      coData: !!fileData,
      coFile: !!fileData?.file,
      kichThuoc: fileData?.file?.length
    });

    if (!fileData?.file) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy file'
      });
    }

    const buffer = Buffer.from(fileData.file);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Length', buffer.length);
    res.setHeader('Content-Disposition', `inline; filename="${fileData.TenHoSo}_${type}.pdf"`);
    return res.send(buffer);

  } catch (error) {
    console.error('Lỗi API:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi máy chủ'
    });
  }
}