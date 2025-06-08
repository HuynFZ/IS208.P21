require('dotenv').config({ path: require('path').resolve(__dirname, '../.env.local') });

const { default: db } = require('../lib/db');
const bcrypt = require('bcrypt');

console.log({
  DB_HOST: process.env.DB_HOST,
  DB_USER: process.env.DB_USER,
  DB_PASSWORD: process.env.DB_PASSWORD,
  DB_NAME: process.env.DB_NAME,
  JWT_SECRET: process.env.JWT_SECRET,
});

async function createUniqueAdmin() {
  try {
    const username = 'Admin';
    const email = 'admin@talenthub.com';
    const role = 'admin';
    const password = 'Admin1234!';
    const userCode = 'AD00000000';
    const hashedPassword = await bcrypt.hash(password, 10);

    const [existing] = await db.query('SELECT id FROM users WHERE user_code = ?', [userCode]);
    if (existing.length > 0) {
      console.log('Tài khoản admin đã tồn tại!');
      return;
    }

    await db.query(
      'INSERT INTO users (username, email, password, role, user_code) VALUES (?, ?, ?, ?, ?)',
      [username, email, hashedPassword, role, userCode]
    );

    console.log(`Tạo tài khoản admin thành công: ${email} với user_code ${userCode}`);
  } catch (err) {
    console.error('Lỗi khi tạo tài khoản admin:', err);
  } finally {
    await db.end().catch((err) => console.error('Lỗi khi đóng pool:', err));
    process.exit();
  }
}

createUniqueAdmin();