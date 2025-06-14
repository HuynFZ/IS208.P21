import db from '../../../../lib/db';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';

export default async function handler(req, res) {
  try {
    const session = await getServerSession(req, res, authOptions);
    if (!session || session.user.role !== 'nhatuyendung') {
      return res.status(401).json({ 
        success: false, 
        message: 'Không có quyền truy cập' 
      });
    }

    const { id } = req.query; // id là MaTinTuyenDung
    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'Thiếu mã tin tuyển dụng'
      });
    }
    
    switch (req.method) {
      case 'GET':
        return handleGetApplicants(req, res, session, id);
      case 'PUT':
        return handleUpdateStatus(req, res, session, id);
      default:
        return res.status(405).json({ 
          success: false, 
          message: 'Phương thức không được hỗ trợ' 
        });
    }
  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Lỗi hệ thống',
      error: error.message 
    });
  }
}

async function handleGetApplicants(req, res, session, maTinTuyenDung) {
  let connection;
  try {
    connection = await db.getConnection();

    // Kiểm tra quyền sở hữu tin tuyển dụng
    const [ownership] = await connection.query(
      'SELECT * FROM TIN_TUYEN_DUNG WHERE MaTinTuyenDung = ? AND MaNhaTuyenDung = ?',
      [maTinTuyenDung, session.user.user_code]
    );

    if (!ownership || ownership.length === 0) {
      return res.status(403).json({
        success: false,
        message: 'Không có quyền truy cập tin tuyển dụng này'
      });
    }

    // Lấy thông tin tin tuyển dụng
    const [tinTuyenDung] = await connection.query(
      'SELECT * FROM TIN_TUYEN_DUNG WHERE MaTinTuyenDung = ?',
      [maTinTuyenDung]
    );

    // Lấy danh sách bài test
    const [danhSachTest] = await connection.query(`
      SELECT 
        bt.*,
        (
          SELECT COUNT(*)
          FROM LAM_BAI_TEST lbt
          WHERE lbt.MaBaiTest = bt.MaBaiTest
        ) as SoLuongUngVien
      FROM BAI_TEST bt
      WHERE bt.MaTinTuyenDung = ?
      ORDER BY bt.ThoiGianBatDau DESC
    `, [maTinTuyenDung]);

    // Lấy danh sách phỏng vấn
    const [danhSachPhongVan] = await connection.query(`
      SELECT 
        pv.*,
        (
          SELECT COUNT(*)
          FROM THAM_GIA_PHONG_VAN tgpv
          WHERE tgpv.MaLichPhongVan = pv.MaLichPhongVan
        ) as SoLuongUngVien
      FROM PHONG_VAN pv
      WHERE pv.MaTinTuyenDung = ?
      ORDER BY pv.ThoiGianBatDau DESC
    `, [maTinTuyenDung]);

    return res.status(200).json({
      success: true,
      tinTuyenDung: tinTuyenDung[0],
      danhSachTest,
      danhSachPhongVan
    });

  } catch (error) {
    console.error('Database Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi truy vấn database',
      error: error.message
    });
  } finally {
    if (connection) {
      connection.release();
    }
  }
}

async function handleUpdateStatus(req, res, session, maTinTuyenDung) {
  const { maHoSo, action, lyDo } = req.body;
  
  if (!maHoSo || !action) {
    return res.status(400).json({
      success: false,
      message: 'Thiếu thông tin cần thiết'
    });
  }

  let connection;
  try {
    connection = await db.getConnection();
    await connection.beginTransaction();

    // Kiểm tra quyền sở hữu và trạng thái hiện tại
    const [current] = await connection.query(
      `SELECT nhs.*, ttd.MaNhaTuyenDung 
       FROM NOP_HO_SO nhs
       JOIN TIN_TUYEN_DUNG ttd ON nhs.MaTinTuyenDung = ttd.MaTinTuyenDung
       WHERE nhs.MaHoSo = ? AND nhs.MaTinTuyenDung = ?`,
      [maHoSo, maTinTuyenDung]
    );

    if (!current || current.length === 0) {
      await connection.rollback();
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy hồ sơ'
      });
    }

    if (current[0].MaNhaTuyenDung !== session.user.user_code) {
      await connection.rollback();
      return res.status(403).json({
        success: false,
        message: 'Không có quyền cập nhật hồ sơ này'
      });
    }

    // Cập nhật trạng thái
    const trangThai = action === 'approve' ? 'Đã duyệt' : 'Từ chối';
    await connection.query(
      `UPDATE NOP_HO_SO 
       SET TrangThai = ?, 
           NgayDuyet = CURRENT_TIMESTAMP,
           LyDoTuChoi = ?
       WHERE MaHoSo = ? AND MaTinTuyenDung = ?`,
      [trangThai, action === 'reject' ? lyDo : null, maHoSo, maTinTuyenDung]
    );

    await connection.commit();
    return res.status(200).json({
      success: true,
      message: 'Cập nhật trạng thái thành công'
    });

  } catch (error) {
    if (connection) {
      await connection.rollback();
    }
    console.error('Database Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi cập nhật trạng thái',
      error: error.message
    });
  } finally {
    if (connection) {
      connection.release();
    }
  }
}