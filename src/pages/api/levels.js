// pages/api/levels.js
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
    const [levels] = await connection.execute(
      `SELECT MaLevel, TenLevel, MoTa
       FROM LEVEL
       ORDER BY MaLevel ASC`
    );
    await connection.end();
    res.status(200).json({
      success: true,
      data: levels,
      total: levels.length
    });
  } catch (error) {
    console.error('Lỗi cơ sở dữ liệu trong /api/levels:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy danh sách cấp độ',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}