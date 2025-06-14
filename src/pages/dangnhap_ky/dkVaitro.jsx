import Image from 'next/image';
import { useRouter } from 'next/router';
import Link from 'next/link' ;
import Thanhdh0DN from "../../components/thanhdieuhuong/thanhdh0DN";
import DKNhaTuyenDung from './dkNhatuyendung';

export default function DangKyVaiTro() {
  const router = useRouter();

  const handleSubmit = (event) => {
    event.preventDefault();
    const role = event.target.role.value;

    if (!role) return alert('Vui lòng chọn vai trò!');
    
    router.push(`/dangnhap_ky/${role}`);
  };

  return (
    <>
    <Thanhdh0DN/>
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md text-center">
        <h1 className="text-3xl font-bold text-black mb-2">ĐĂNG KÝ</h1>
        <p className="text-gray-600 mb-6">Bạn tham gia với vai trò là?</p>

        <form onSubmit={handleSubmit} className="space-y-4 mb-6 text-left">
          <label className="flex items-center border rounded-md px-4 py-2 cursor-pointer hover:bg-gray-100">
            <input type="radio" name="role" value="dkUngvien" className="mr-4" />
            <Image src="/icons/candidate.png" alt="Ứng viên" width={30} height={30} className="mr-3" />
            <span className="text-gray-600">Ứng viên</span>
          </label>

          <label className="flex items-center border rounded-md px-4 py-2 cursor-pointer hover:bg-gray-100">
            <input type="radio" name="role" value="dkNhatuyendung" className="mr-4" />
            <Image src="/icons/employer.jpg" alt="Nhà tuyển dụng" width={30} height={30} className="mr-3" />
            <span className="text-gray-600">Nhà tuyển dụng</span>
          </label>

          <button type="submit" className="bg-teal-500 hover:bg-teal-600 text-black font-semibold py-2 px-4 rounded-md w-full">
            Đăng ký 
          </button>
        </form>

        <p className="text-center mt-4 text-sm">
            <span className="font-semibold text-gray-400">Bạn đã có tài khoản?</span>
            <Link href="/dangnhap_ky/dangnhap" className="font-semibold text-black hover:underline">
              Đăng nhập
            </Link>
          </p>
      </div>
    </div>
    </>
  );
}