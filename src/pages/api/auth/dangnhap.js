import db from '../../../../lib/db';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const SECRET_KEY = process.env.JWT_SECRET ;

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { username, password } = req.body;

  try {
    const [users] = await db.query('SELECT id, username, email, password, role, user_code FROM users WHERE email = ?', [username]);

    if (users.length === 0)
      return res.status(401).json({ message: 'Tài khoản chưa được đăng ký!' });

    const user = users[0];
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(401).json({ message: 'Sai mật khẩu! Vui lòng thử lại.' });

    const token = jwt.sign(
      {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        user_code: user.user_code
      },
      SECRET_KEY,
      { expiresIn: '1h' }
    );

    res.status(200).json({
      message: 'Đăng nhập thành công',
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Lỗi máy chủ' });
  }
}