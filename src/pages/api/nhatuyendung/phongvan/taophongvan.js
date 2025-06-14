import db from '../../../../../lib/db';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../auth/[...nextauth]';
import { generateId } from '../../../../utils/generateId';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  try {
    const session = await getServerSession(req, res, authOptions);
    if (!session || session.user.role !== 'nhatuyendung') {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const { tieuDe, maTinTuyenDung, moTa,diaChi, thoiGianBatDau, thoiGianKetThuc, hanXacNhan } = req.body;
    const maNhaTuyenDung = session.user.user_code;
    const maLichPhongVan = await generateId('PV', maNhaTuyenDung, db);
     // Convert strings to Date objects
    const now = new Date();
    const startTime = new Date(thoiGianBatDau);
    const endTime = new Date(thoiGianKetThuc);
    const confirmTime = new Date(hanXacNhan);

    // Validate all times are in the future
    if (startTime <= now || endTime <= now || confirmTime <= now) {
      return res.status(400).json({
        success: false,
        message: 'Thời gian phải lớn hơn thời gian hiện tại'
      });
    }

    // Validate time sequence: confirmTime < startTime < endTime
    if (confirmTime >= startTime || startTime >= endTime) {
      return res.status(400).json({
        success: false,
        message: 'Thời gian không hợp lệ: Hạn xác nhận < Thời gian bắt đầu < Thời gian kết thúc'
      });
    }
    const [result] = await db.execute(
      `INSERT INTO PHONG_VAN (
        MaLichPhongVan, MaNhaTuyenDung, MaTinTuyenDung, TieuDe, 
        MoTa,  DiaChi,ThoiGianBatDau, ThoiGianKetThuc, HanXacNhan
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        maLichPhongVan,
        maNhaTuyenDung,
        maTinTuyenDung,
        tieuDe,
        moTa,
        diaChi,
        thoiGianBatDau,
        thoiGianKetThuc,
        hanXacNhan
      ]
    );

    return res.status(200).json({
      success: true,
      message: 'Tạo phỏng vấn thành công',
      data: { maLichPhongVan }
    });

  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi khi tạo phỏng vấn'
    });
  }
}