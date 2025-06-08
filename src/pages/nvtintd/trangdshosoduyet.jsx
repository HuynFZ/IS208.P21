import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import ThanhdhDN from "../../components/thanhdieuhuong/thanhdhDN";

export default function TrangDSHoSoDuyet() {
  const [jobPostings, setJobPostings] = useState([]);
  const [selectedJobs, setSelectedJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const res = await fetch("/api/nhanvienTTD/hosoduyet");
        const data = await res.json();
        setJobPostings(data.jobs || []);
      } catch (err) {
        setJobPostings([]);
      } finally {
        setLoading(false);
      }
    };
    fetchJobs();
  }, []);

  const handleCheckboxChange = (id) => {
    if (selectedJobs.includes(id)) {
      setSelectedJobs(selectedJobs.filter(jobId => jobId !== id));
    } else {
      setSelectedJobs([...selectedJobs, id]);
    }
  };

  const handleDelete = () => {
    alert(`Xóa ${selectedJobs.length} tin tuyển dụng đã chọn`);
    // TODO: Gọi API xóa ở đây 
  };

  const handleSendEmail = () => {
    alert(`Gửi email cho ${selectedJobs.length} tin tuyển dụng đã chọn`);
    // TODO: Gọi API gửi email ở đây 
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Đang Chờ Duyệt":
        return "text-yellow-600";
      case "Đã Duyệt":
        return "text-green-600";
      case "Đã Từ Chối":
        return "text-red-600";
      default:
        return "text-gray-600";
    }
  };

  const handleViewDetail = (id) => {
    router.push(`/nhatuyendung/thongtinvieclam?id=${id}`);
  };

  return (
    <>
      <ThanhdhDN />
      <div className="min-h-screen flex flex-col gap-2 items-center text-center bg-gray-100 pt-10">
        <div className="p-8 w-full max-w-7xl mx-auto bg-white rounded-lg shadow">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-black mb-2">Danh sách tin tuyển dụng</h1>
              <p className="text-gray-500 text-lg">{jobPostings.filter(job => job.status === "Đang Chờ Duyệt")} tin tuyển dụng chờ duyệt</p>
            </div>
            <div className="space-x-2">
              <button
                onClick={handleDelete}
                className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                disabled={selectedJobs.length === 0}
              >
                Xóa
              </button>
              <button
                onClick={handleSendEmail}
                className="bg-teal-500 text-white px-4 py-2 rounded hover:bg-teal-600"
                disabled={selectedJobs.length === 0}
              >
                Gửi Email
              </button>
            </div>
          </div>

          {/* Danh sách tin */}
          <div className="border rounded-lg overflow-hidden bg-white">
            <div className="grid grid-cols-5 bg-gray-100 p-4 font-semibold text-gray-700 text-lg">
              <div className="col-span-1 flex items-center">
                <input type="checkbox" disabled className="mr-2" />
                Tên tin đăng
              </div>
              <div className="col-span-1">Công ty</div>
              <div className="col-span-1">Ngày tạo</div>
              <div className="col-span-1 text-center">Trạng thái</div>
              <div className="col-span-1 text-center">Thao tác</div>
            </div>

            {loading ? (
              <div className="p-4 text-center text-black">Đang tải...</div>
            ) : jobPostings.length === 0 ? (
              <div className="p-4 text-center text-black">Không có tin tuyển dụng nào.</div>
            ) : (
              jobPostings.map((job) => (
                <div
                  key={job.id}
                  className="grid grid-cols-5 p-4 border-t items-center hover:bg-gray-50 text-base"
                >
                  <div className="col-span-1 flex items-center">
                    <input
                      type="checkbox"
                      checked={selectedJobs.includes(job.id)}
                      onChange={() => handleCheckboxChange(job.id)}
                      className="mr-2"
                    />
                    <span className="text-black">{job.name}</span>
                  </div>
                  <div className="col-span-1 text-black">{job.company}</div>
                  <div className="col-span-1 text-black">{job.date}</div>
                  <div className="col-span-1 text-center">
                    <span className={getStatusColor(job.status)}>{job.status}</span>
                  </div>
                  <div className="col-span-1 flex justify-center">
                    <button
                      className="bg-teal-500 text-white px-3 py-1 rounded hover:bg-teal-600"
                      onClick={() => handleViewDetail(job.id)}
                    >
                      Xem Chi Tiết
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </>
  );
}