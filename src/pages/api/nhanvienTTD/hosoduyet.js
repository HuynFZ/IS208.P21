import db from '../../../../lib/db';

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).end();

  try {
    //Lấy các tin có trạng thái "Đang Chờ Duyệt", "Đã Duyệt", "Đã Từ Chối"
    const [rows] = await db.query(`
      SELECT 
            t.MaTinTuyenDung as id,
            t.TieuDe as name,
            n.CongTy as company,
            DATE_FORMAT(t.NgayDangTin, '%d/%m/%Y') as date,
            t.TrangThai as status
        FROM TIN_TUYEN_DUNG t
        JOIN nha_tuyen_dung n ON t.MaNhaTuyenDung = n.MaNhaTuyenDung
        WHERE t.TrangThai IN ('Chưa Duyệt', 'Đã Duyệt', 'Đã Từ Chối')
        ORDER BY t.NgayDangTin DESC;
    `);

    res.status(200).json({ jobs: rows });
  } catch (err) {
    console.error('Lỗi lấy danh sách hồ sơ duyệt:', err);
    res.status(500).json({ jobs: [], message: 'Lỗi server' });
  }
}