// pages/api/categories.js
import mysql from 'mysql2/promise';

const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  charset: 'utf8mb4'
};

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Phương thức không được phép' });
  }

  try {
    const connection = await mysql.createConnection(dbConfig);
    const [categories] = await connection.execute(
      `SELECT MaNganhNghe, TenNganhNghe
       FROM NGANH_NGHE 
       WHERE TrangThai = ?
       ORDER BY MaNganhNghe ASC`,
      ['Hoạt động']
    );
    await connection.end();
    res.status(200).json({
      success: true,
      data: categories,
      total: categories.length
    });
  } catch (error) {
    console.error('Lỗi cơ sở dữ liệu trong /api/categories:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy danh sách ngành nghề',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}