import db from '../../../../lib/db';
import bcrypt from 'bcrypt';

async function generateEmployeeCode(role, connection) {
  const prefix = 'NV';
  const [rows] = await connection.query(
   "SELECT user_code FROM users WHERE user_code LIKE 'NV%'"
  );

  if (rows.length > 0) {
    const lastCode = rows[0].user_code;
    const lastNum = parseInt(lastCode.slice(2), 10);
    return prefix + (lastNum + 1).toString().padStart(8, '0');
  } else {
    return prefix + '00000001';
  }
}

function getVaiTro(role) {
  if (role === 'qlhoso') return 'Nhân viên quản lý hồ sơ ứng viên';
  if (role === 'qltintd') return 'Nhân viên quản lý hồ sơ tuyển dụng';
  return '';
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { username, email, role } = req.body;
  if (!username || !email || !role) {
    return res.status(400).json({ message: 'Thiếu thông tin cần thiết.' });
  }

  const validRoles = ['qlhoso', 'qltintd'];
  if (!validRoles.includes(role)) {
    return res.status(400).json({ message: 'Vai trò không hợp lệ.' });
  }

  let connection;
  try {
    connection = await db.getConnection();
    await connection.beginTransaction();

    const [existing] = await connection.query('SELECT id FROM users WHERE email = ?', [email]);
    if (existing.length > 0) {
      await connection.rollback();
      return res.status(409).json({ message: 'Email đã tồn tại.' });
    }

    const hashedPassword = await bcrypt.hash('123!', 10);
    const userCode = await generateEmployeeCode(role, connection);

    await connection.query(
      'INSERT INTO users (username, email, password, role, user_code) VALUES (?, ?, ?, ?, ?)',
      [username, email, hashedPassword, role, userCode]
    );

    // Chuyển role sang đúng tên vai trò tiếng Việt
    const vaiTro = getVaiTro(role);

    await connection.query(
      'INSERT INTO NHAN_VIEN (MaNhanVien, TenNhanVien, Email, SDT, KhuVuc, VaiTro) VALUES (?, ?, ?, ?, ?, ?)',
      [userCode, username, email, '', '', vaiTro]
    );

    await connection.commit();
    return res.status(201).json({
      message: 'Tạo tài khoản nhân viên thành công!',
      user: { userCode, email, role },
    });
  } catch (err) {
    if (connection) await connection.rollback();
    console.error('Lỗi khi tạo tài khoản:', err);
    return res.status(500).json({ message: 'Lỗi server.', error: err.message });
  } finally {
    if (connection) connection.release();
  }
}