import Image from "next/image";
import { useRouter } from "next/router";
import ThanhdhDN from "../../components/thanhdieuhuong/thanhdhDN";
import ChanTrang from "../../components/chantrang";
import { useSession, signIn } from "next-auth/react";

export default function Home2() {
  const router = useRouter(); // Khởi tạo router
  const { data: session } = useSession(); // Lấy session từ NextAuth
  const handleCreateJob = () => {
     if (!session) {
        signIn();
      } else {
        router.push("/nhatuyendung/taotintuyendung");
      }
  };

  return (
    <>
      <ThanhdhDN userType="nhatuyendung" />
      <div className="h-screen bg-white justify-evenly px-6 py-4 flex flex-col">
        {/* Tiêu đề lớn */}
        <h1 className="text-5xl font-bold text-left text-black leading-tight">
          Đăng tin tuyển dụng<br />
          <span className="pl-20 block">Tìm kiếm ứng viên hiệu quả</span>
        </h1>
        <p className="italic text-2xl text-gray-800 mb-6">
          Tuyển đúng người, đúng thời điểm – cùng TalentHub
        </p>
        {/* Khối nội dung gồm văn bản và ảnh */}
        <div className="max-w-7xl w-full grid grid-cols-1 md:grid-cols-2 gap-10 items-center mt-2">
          {/* Cột trái: mô tả + danh sách */}
          <div className="flex flex-col items-center">
            <ul className="space-y-3 text-black">
              <li className="flex items-start gap-2">
                <span className="text-green-600 mt-1">✓</span>
                <span>Đăng tin tuyển dụng nhanh chóng, đơn giản</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600 mt-1">✓</span>
                <span>Nguồn ứng viên to lớn từ nhiều lĩnh vực ngành nghề khác nhau</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600 mt-1">✓</span>
                <span>AI đề xuất ứng viên tiềm năng, phù hợp với công ty của bạn</span>
              </li>
            </ul>
            <button
              onClick={handleCreateJob} // Gán sự kiện điều hướng
              className="mt-10 bg-teal-600 font-bold text-white px-6 py-3 rounded hover:bg-teal-700 transition"
            >
              Đăng tin ngay!
            </button>
          </div>

          {/* Cột phải: ảnh */}
          <div className="flex justify-center">
            <img
              src="/icons/anhnen2.webp"
              alt="TalentHub Recruitment"
              className="w-full max-w-md h-auto"
            />
          </div>
        </div>
      </div>
      <ChanTrang />
    </>
  );
}