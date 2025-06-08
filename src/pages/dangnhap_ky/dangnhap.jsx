import Link from 'next/link';
import Head from 'next/head';
import { useState } from 'react';
import { useRouter } from 'next/router';
import { signIn } from "next-auth/react";
import Thanhdh0DN from '../../components/thanhdieuhuong/thanhdh0DN';

export default function DangNhap() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Đăng nhập qua NextAuth Credentials
    const res = await signIn("credentials", {
      redirect: false,
      username: email,
      password,
      callbackUrl: "/"
    });

    if (res.error) {
      setError("Sai tài khoản hoặc mật khẩu!");
      return;
    }

    // Lấy session mới nhất và chuyển hướng theo role
    setTimeout(async () => {
      const sessionRes = await fetch("/api/auth/session");
      const sessionData = await sessionRes.json();
      const role = sessionData?.user?.role;

      if (role === 'admin') {
        router.push('/admin/create-employee');
      } else if (role === 'qltintd') {
        router.push('/nvtintd/trangdshosoduyet');
      } else if (role === 'ungvien') {
        router.push('/');
      } else if (role === 'nhatuyendung') {
        router.push('/nhatuyendung/trangchuNTD');
      } else {
        setError('Không xác định được vai trò người dùng');
      }
    }, 300);
  };

  return (
    <>
      <Head>
        <title>Đăng nhập</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <Thanhdh0DN />

      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
          <h1 className="text-3xl font-bold text-center text-black mb-6">ĐĂNG NHẬP</h1>

          <form onSubmit={handleSubmit} className="flex flex-col space-y-4">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Nhập email của bạn"
              className="input"
              required
              autoComplete="email"
            />

            <div className="relative w-full">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Nhập mật khẩu"
                className="input pr-10"
                required
                autoComplete="current-password"
              />
              <button
                type="button"
                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500"
                onClick={() => setShowPassword((v) => !v)}
                tabIndex={-1}
              >
                {showPassword ? '🙈' : '👁️'}
              </button>
            </div>

            {error && <p className="text-red-500 text-sm">{error}</p>}

            <p className="text-right text-sm text-gray-600 mt-1 mb-1 cursor-pointer hover:underline">
              Quên mật khẩu?
            </p>

            <button type="submit" className="btn-primary">ĐĂNG NHẬP</button>
          </form>

          <p className="text-center mt-4 text-sm">
            <span className="font-semibold text-gray-400 hover:underline">Bạn chưa có tài khoản?</span>{' '}
            <Link href="/dangnhap_ky/dkVaitro" className="font-semibold text-black hover:underline">
              Đăng ký
            </Link>
          </p>
        </div>
      </div>
    </>
  );
}