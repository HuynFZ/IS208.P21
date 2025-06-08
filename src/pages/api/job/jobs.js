import db from "../../../../lib/db";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { diaDiem, nganhNghe, tieuDe, status } = req.query;

   let sql = `
    SELECT jobs.*, NGANH_NGHE.TenNganhNghe, nhaTuyenDung.CongTy
    FROM TIN_TUYEN_DUNG AS jobs
    LEFT JOIN NHA_TUYEN_DUNG AS nhaTuyenDung ON jobs.MaNhaTuyenDung = nhaTuyenDung.MaNhaTuyenDung
    LEFT JOIN NGANH_NGHE ON jobs.MaNganhNghe = NGANH_NGHE.MaNganhNghe
    WHERE 1=1
  `;
  const params = [];

  // Lọc trạng thái (đã duyệt)
  if (status) {
    sql += " AND jobs.TrangThai = ?";
    params.push(status === "approved" ? "Đã duyệt" : status);
  }

  // Lọc địa điểm
  if (diaDiem) {
    sql += " AND jobs.DiaDiem LIKE ?";
    params.push(`%${diaDiem}%`);
  }

  // Lọc ngành nghề
  if (nganhNghe) {
    sql += " AND NGANH_NGHE.TenNganhNghe LIKE ?";
    params.push(`%${nganhNghe}%`);
  }

  // Lọc tiêu đề
  if (tieuDe) {
    sql += " AND jobs.TieuDe LIKE ?";
    params.push(`%${tieuDe}%`);
  }

  sql += " ORDER BY jobs.NgayDangTin DESC";
  sql += " LIMIT ? OFFSET ?";
    const page = req.query.page || 1; 
  const limit = req.query.limit || 10; // Số lượng bản ghi mỗi trang
  params.push(Number(limit));
  params.push((Number(page) - 1) * Number(limit));
  try {
    const [rows] = await db.query(sql, params);
    res.status(200).json({ jobs: rows });
  } catch (err) {
    res.status(500).json({ message: "Lỗi server", error: err.message });
  }
}