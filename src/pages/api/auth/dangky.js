import db from '../../../../lib/db';
import bcrypt from 'bcrypt';

function padNumber(number) {
  return number.toString().padStart(8, '0');
}

async function generateUserCode(role) {
  const prefix = role === 'ungvien' ? 'UV' : 'TD';
  const [rows] = await db.query(
    'SELECT user_code FROM users WHERE role = ? ORDER BY id DESC LIMIT 1',
    [role]
  );

  if (rows.length > 0) {
    const lastCode = rows[0].user_code;
    const lastNum = parseInt(lastCode.slice(2), 10); // bỏ tiền tố 'UV' hoặc 'TD'
    return prefix + padNumber(lastNum + 1);
  } else {
    return prefix + '00000001';
  }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { username, email, password, role, companyName, companyAddress } = req.body;

  if (!username || !email || !password || !role) {
    return res.status(400).json({ message: 'Thiếu thông tin cần thiết.' });
  }

  try {
    const [existing] = await db.query('SELECT id FROM users WHERE email = ?', [email]);
    if (existing.length > 0) {
      return res.status(409).json({ message: 'Email đã tồn tại.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const userCode = await generateUserCode(role);

    // Thêm vào bảng users (KHÔNG chạm vào cột id INT)
    const [result] = await db.query(
      'INSERT INTO users (username, email, password, role, user_code) VALUES (?, ?, ?, ?, ?)',
      [username, email, hashedPassword, role, userCode]
    );

    if (role === 'ungvien') {
      await db.query(
        `INSERT INTO UNG_VIEN (MaUngVien, TenUngVien, Email, SDT, DiaChi)
         VALUES (?, ?, ?, ?, ?)`,
        [userCode, username, email, '', '']
      );
    } else if (role === 'nhatuyendung') {
      await db.query(
        `INSERT INTO NHA_TUYEN_DUNG (MaNhaTuyenDung, TenNhaTuyenDung, Email, CongTy, DiaChiCongTy, SDT)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [userCode, username, email, companyName, companyAddress, '']
      );
    }

    return res.status(201).json({ message: 'Đăng ký thành công!' });
  } catch (err) {
    console.error('Đăng ký lỗi:', err);
    return res.status(500).json({ message: 'Lỗi server khi đăng ký.' });
  }
}
