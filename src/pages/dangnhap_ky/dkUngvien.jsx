import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';

export default function DKUngVien() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      alert('Mật khẩu xác nhận không khớp');
      return;
    }

    try {
      const res = await fetch('/api/auth/dangky', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          ...formData, 
          role: 'ungvien',
          fullName: formData.username,
        }),
      });

      const result = await res.json();
      if (res.ok) {
        alert('Đăng ký thành công');
        router.push('/dangnhap_ky/dangnhap');
      } else {
        alert(result.message || 'Đăng ký thất bại');
      }
    } catch (err) {
      console.error(err);
      alert('Lỗi kết nối server');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h1 className="text-3xl font-bold text-center text-black mb-6">ĐĂNG KÝ</h1>

        <form onSubmit={handleSubmit} className="flex flex-col space-y-4">
          <input
            name="username"
            value={formData.username}
            onChange={handleChange}
            required
            className="input"
            placeholder="Tên đăng nhập"
          />
          <input
            name="email"
            value={formData.email}
            onChange={handleChange}
            type="email"
            required
            className="input"
            placeholder="Email"
          />

          <div className="relative">
            <input
              name="password"
              type={showPassword ? 'text' : 'password'}
              value={formData.password}
              onChange={handleChange}
              required
              className="input"
              placeholder="Mật khẩu"
            />
            <button
              type="button"
              className="absolute top-2 right-3 text-gray-600"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? '🙈' : '👁️'}
            </button>
          </div>

          <input
            name="confirmPassword"
            type="password"
            value={formData.confirmPassword}
            onChange={handleChange}
            required
            className="input"
            placeholder="Xác nhận mật khẩu"
          />

          <button type="submit" className="btn-primary">Đăng ký</button>
        </form>

        <p className="text-center mt-4 text-sm">
          <span className="font-semibold text-gray-400">Bạn đã có tài khoản?</span>{' '}
          <Link href="/dangnhap_ky/dangnhap" className="font-semibold text-black hover:underline">Đăng nhập</Link>
        </p>
      </div>
    </div>
  );
}
