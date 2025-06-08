import { useEffect, useState } from "react";
import Image from "next/image";
import { useSession } from "next-auth/react";
import axios from "axios";
import ThanhdhDN from "@/components/thanhdieuhuong/thanhdhDN";
import { useRouter } from "next/router";    
import ChanTrang from "@/components/chantrang";
const STATUS_COLOR = {
  "Đã duyệt": "text-green-600",
  "Bị khóa": "text-red-600",
  "Chờ duyệt": "text-yellow-600",
  "Đã Duyệt": "text-green-600",
  "Bị Khóa": "text-red-600",
  "Chưa duyệt": "text-yellow-600"
};



export default function HoSoUngVien() {
  const { data: session } = useSession();
  const [hoso, setHoso] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter(); 
  useEffect(() => {
    if (!session) return;
    axios.get("/api/ungvien/dshoso").then(res => {
      setHoso(res.data.data);
      setLoading(false);
    });
  }, [session]);

  const handleCreate = async () => {
    router.push("/ungvien/taohosoungvien");
  };

  if (loading) return <div>Đang tải...</div>;

   return (
    <>
      <ThanhdhDN />
      <div className="min-h-screen bg-white">
        {/* Header with title and create button */}
        <div className="pt-16 pb-12 px-8">
          <div className="flex justify-between items-center">
            <h1 className="text-5xl font-bold text-black">
              Hồ sơ ứng tuyển của tôi
            </h1>
            <button
              onClick={handleCreate}
              className="bg-teal-600 hover:bg-teal-700 text-white font-medium px-6 py-3 rounded-lg
                flex items-center gap-2 transition-colors"
            >
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                fill="none" 
                viewBox="0 0 24 24" 
                strokeWidth={2} 
                stroke="currentColor" 
                className="w-5 h-5"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              Thêm hồ sơ mới
            </button>
          </div>
        </div>

        {/* List of profiles */}
        <div className="flex flex-row gap-16 justify-start items-start px-8">
          {hoso.length > 0 ? (
            <>
              {hoso.map((item, idx) => (
                <div key={item.MaHoSo || idx} className="flex flex-col items-center">
                  <Image src="/icons/hoso.png" width={180} height={180} alt="hoso" />
                  <div className="font-bold text-2xl mt-4 text-black">Hồ sơ {idx + 1}</div>
                  <div className={`mt-2 font-bold text-2xl ${STATUS_COLOR[item.TrangThai] || "text-gray-600"}`}>
                    {item.TrangThai === "Đã duyệt" || item.TrangThai === "Đã Duyệt"
                      ? "Đã Duyệt"
                      : item.TrangThai === "Bị khóa" || item.TrangThai === "Bị Khóa"
                      ? "Bị Khóa"
                      : "Chờ duyệt"}
                  </div>
                </div>
              ))}
            </>
          ) : (
            <div className="w-full text-center py-8 text-gray-500">
              Bạn chưa có hồ sơ nào. Hãy tạo hồ sơ mới để bắt đầu ứng tuyển!
            </div>
          )}
        </div>
      </div>
      <ChanTrang />
    </>
  );
}