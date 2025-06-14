import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import ThanhdhDN from "../../components/thanhdieuhuong/thanhdhDN";
import ChanTrang from "../../components/chantrang";
import axios from "axios";
import Thanhdh0DN from "../thanhdieuhuong/thanhdh0DN";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";

export default function JobInformation() {
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const searchParams = useSearchParams();
  const router = useRouter();
  const { data: session } = useSession();
  const role = session?.user?.role ;

  const id = router.query.id;
  useEffect(() => {
    if (!id) return;
    setLoading(true);
    const fetchJob = async () => {
      try {
        const res = await axios.get(`/api/nhatuyendung/thongtinvieclam?id=${id}`);
        if (res.data.success) setJob(res.data.data);
        else setError(res.data.message || "Không tìm thấy thông tin việc làm.");
      } catch (err) {
        setError("Bạn không có quyền xem tin này hoặc đã xảy ra lỗi.");
      } finally {
        setLoading(false);
      }
    };
    fetchJob();
  }, [id]);

 
  const handleEdit = () => {
    router.push(`/nhatuyendung/chinhsuatin?id=${job.MaTinTuyenDung}`);
  };
  const handleApprove = async () => {
    try {
    const token = localStorage.getItem("token");
    const res = await axios.post(
      "/api/nhanvienTTD/duyet_tin",
      { id: job.MaTinTuyenDung, action: "approve" },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    alert(res.data.message || "Duyệt tin thành công!");
    router.back();
  } catch (err) {
    alert("Lỗi khi duyệt tin!");
  }
  };
  const handleReject = async() => {
    try {
    const token = localStorage.getItem("token");
    const res = await axios.post(
      "/api/nhanvienTTD/duyet_tin",
      { id: job.MaTinTuyenDung, action: "reject" },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    alert(res.data.message || "Hủy tin thành công!");
    router.back();
  } catch (err) {
    alert("Lỗi khi hủy tin!");
  }
  };

  return (
    <>
      {session ? (
        <ThanhdhDN userType={role === "nhatuyendung" ? "nhatuyendung" : "ungvien"} />
      ) : (
        <Thanhdh0DN />
      )}
      <div className="w-full bg-teal-600 py-24 flex justify-center items-center shadow">
        <h1 className="text-5xl font-bold text-black">Thông tin việc làm</h1>
      </div>
      <div className="bg-white flex justify-center p-4">
        <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-4xl text-black">
          {loading ? (
            <div>Đang tải...</div>
          ) : error ? (
            <div className="text-red-500">{error}</div>
          ) : job ? (
            <>
              <h2 className="text-2xl font-bold mb-4">{job.TieuDe || "Chưa cập nhật"}</h2>
              <div className="flex flex-wrap gap-2 mb-4 items-center justify-between">
                <div className="flex flex-wrap gap-2">
                  <span className="text-teal-600 border border-teal-600 rounded-full px-3 py-1 text-sm">
                    {job.TenNganhNghe || "Chưa cập nhật"}
                  </span>
                  <span className="text-teal-600 border border-teal-600 rounded-full px-3 py-1 text-sm">
                    {job.HinhThuc || "Chưa cập nhật"}
                  </span>
                  <span className="text-teal-600 border border-teal-600 rounded-full px-3 py-1 text-sm">
                    {job.MucLuong || "Chưa cập nhật"}
                  </span>
                  <span className="text-teal-600 border border-teal-600 rounded-full px-3 py-1 text-sm">
                    {job.DiaDiem || "Chưa cập nhật"}
                  </span>
                </div>
                {/* Nút theo role */}
                {role === "qltintd" && job.TrangThai !== "Đã duyệt" && job.TrangThai !== "Đã hủy" && (
                  <div className="flex gap-2 mt-2 md:mt-0">
                    <button
                      className="bg-green-600 text-white px-4 py-2 rounded"
                      onClick={handleApprove}
                    >
                      Duyệt tin
                    </button>
                    <button
                      className="bg-red-600 text-white px-4 py-2 rounded"
                      onClick={handleReject}
                    >
                      Hủy tin
                    </button>
                  </div>
                )}
              </div>
              <h3 className="text-lg font-semibold mt-4">Thông tin chung</h3>
              <div className="mt-2">
                <div className="bg-gray-50 border border-gray-200 rounded-lg shadow-sm p-4 mb-4">
                  <div className="flex flex-wrap gap-4">
                    <div className="w-full md:w-1/2">
                      <p className="mb-3"><strong>Ngày đăng:</strong> {job.NgayDangTin && new Date(job.NgayDangTin).toLocaleDateString("vi-VN")}</p>
                      <p className="mb-3"><strong>Ngày hết hạn:</strong> {job.NgayHetHan && new Date(job.NgayHetHan).toLocaleDateString("vi-VN")}</p>
                      <p className="mb-3"><strong>Cấp bậc:</strong> {job.TenLevel || "Chưa cập nhật"}</p>
                      <p className="mb-3"><strong>Số lượng tuyển:</strong> {job.SoLuongYeuCau || "Chưa cập nhật"}</p>
                    </div>
                  </div>
                </div>
              </div>
              <h3 className="text-lg font-semibold mt-4">Mô tả công việc</h3>
              <div className="mt-2 whitespace-pre-line">
                {job.MoTa
                  ? job.MoTa.split('\n').map((line, idx) => <div key={idx}>- {line}</div>)
                  : "Chưa cập nhật"}
              </div>
              <h3 className="text-lg font-semibold mt-4">Yêu cầu công việc</h3>
              <div className="mt-2 whitespace-pre-line">
                {job.YeuCau
                  ? job.YeuCau.split('\n').map((line, idx) => <div key={idx}>- {line}</div>)
                  : "Chưa cập nhật"}
              </div>
              <h3 className="text-lg font-semibold mt-4">Quyền lợi công việc</h3>
              <div className="mt-2 whitespace-pre-line">
                {job.QuyenLoi
                  ? job.QuyenLoi.split('\n').map((line, idx) => <div key={idx}>- {line}</div>)
                  : "Chưa cập nhật"}
              </div>
              <h3 className="text-lg font-semibold mt-4">Công ty</h3>
              <div className="mt-2">
                <p><strong>Tên công ty:</strong> {job.CongTy || "Chưa cập nhật"}</p>
                <p><strong>Địa chỉ:</strong> {job.DiaDiem || "Chưa cập nhật"}</p>
              </div>
            </>
          ) : null}
        </div>
      </div>
      <ChanTrang />
    </>
  );
}