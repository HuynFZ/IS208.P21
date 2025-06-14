import db from '../../../../../lib/db';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../auth/[...nextauth]';

export default async function handler(req, res) {
  const { method } = req;

  try {
    const session = await getServerSession(req, res, authOptions);
    if (!session || session.user.role !== 'nhatuyendung') {
      return res.status(401).json({ success: false, message: 'Không có quyền truy cập' });
    }

    switch (method) {
      case 'GET':
        return handleGet(req, res, session);
      case 'DELETE':
        return handleDelete(req, res, session);
      default:
        return res.status(405).json({ success: false, message: 'Phương thức không được hỗ trợ' });
    }
  } catch (error) {
    console.error('Lỗi API:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Lỗi hệ thống' 
    });
  }
}

async function handleGet(req, res, session) {
  const { id } = req.query;
  
  // Truy vấn thông tin chi tiết bài test
  const [tests] = await db.query(`
    SELECT 
      bt.*,
      ttd.TieuDe as TenTinTuyenDung,
      COUNT(DISTINCT lbt.MaUngVien) as SoLuotLam,
      COUNT(DISTINCT CASE WHEN lbt.TrangThai = 'Đã làm' THEN lbt.MaUngVien END) as SoLuotDaLam,
      COUNT(DISTINCT CASE WHEN lbt.TrangThai = 'Đã chấm điểm' THEN lbt.MaUngVien END) as SoLuotDaCham,
      AVG(CASE WHEN lbt.TrangThai = 'Đã chấm điểm' THEN lbt.KetQua END) as DiemTrungBinh
    FROM BAI_TEST bt
    LEFT JOIN TIN_TUYEN_DUNG ttd ON bt.MaTinTuyenDung = ttd.MaTinTuyenDung
    LEFT JOIN LAM_BAI_TEST lbt ON bt.MaBaiTest = lbt.MaBaiTest
    WHERE bt.MaBaiTest = ? AND bt.MaNhaTuyenDung = ?
    GROUP BY bt.MaBaiTest
  `, [id, session.user.user_code]);

  if (!tests.length) {
    return res.status(404).json({ 
      success: false, 
      message: 'Không tìm thấy thông tin bài test' 
    });
  }

  // Lấy danh sách ứng viên làm bài
  const [ketQuas] = await db.query(`
    SELECT 
      lbt.*,
      uv.TenUngVien,
      uv.Email
    FROM LAM_BAI_TEST lbt
    JOIN UNG_VIEN uv ON lbt.MaUngVien = uv.MaUngVien
    WHERE lbt.MaBaiTest = ?
    ORDER BY lbt.NgayLam DESC
  `, [id]);

  return res.status(200).json({
    success: true,
    data: {
      ...tests[0],
      danhSachLamBai: ketQuas
    }
  });
}

async function handleDelete(req, res, session) {
  const { id } = req.query;
  let connection;

  try {
    connection = await db.getConnection();
    await connection.beginTransaction();

    // Kiểm tra bài test tồn tại và thuộc về nhà tuyển dụng
    const [tests] = await connection.query(
      'SELECT * FROM BAI_TEST WHERE MaBaiTest = ? AND MaNhaTuyenDung = ?',
      [id, session.user.user_code]
    );

    if (!tests.length) {
      await connection.rollback();
      return res.status(404).json({ 
        success: false, 
        message: 'Không tìm thấy bài test' 
      });
    }

    // Kiểm tra điều kiện xóa
    const test = tests[0];
    if (test.TrangThai === 'Đã kết thúc' || test.TrangThai === 'Đã hủy') {
      await connection.rollback();
      return res.status(400).json({ 
        success: false, 
        message: 'Không thể xóa bài test đã kết thúc hoặc đã hủy' 
      });
    }

    // Cập nhật trạng thái thành 'Đã hủy'
    await connection.query(
      'UPDATE BAI_TEST SET TrangThai = ? WHERE MaBaiTest = ?',
      ['Đã hủy', id]
    );

    // Cập nhật trạng thái của các bản ghi làm bài
    await connection.query(
      'UPDATE LAM_BAI_TEST SET TrangThai = ? WHERE MaBaiTest = ? AND TrangThai = ?',
      ['Đã từ chối', id, 'Chưa làm']
    );

    await connection.commit();
    return res.status(200).json({
      success: true,
      message: 'Xóa bài test thành công'
    });

  } catch (error) {
    if (connection) await connection.rollback();
    throw error;
  } finally {
    if (connection) connection.release();
  }
}