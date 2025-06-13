import Head from "next/head";
import Image from "next/image";
import { useState, useEffect, useRef } from "react";
import Thanhdh0DN from "../components/thanhdieuhuong/thanhdh0DN";
import ChanTrang from "../components/chantrang";
import ThanhdhDN from "../components/thanhdieuhuong/thanhdhDN";
import { useSession } from "next-auth/react";
import { useToast } from '@/context/ToastContext';
import XacNhanModal from '@/components/xacnhanmodal';
import dynamic from "next/dynamic";
import { useRouter } from 'next/router';

const Select = dynamic(() => import("react-select"), { ssr: false });

// Component modal chọn hồ sơ
const ChonHoSoModal = ({ isOpen, onClose, onConfirm, hoSos }) => {
  const [selectedHoSo, setSelectedHoSo] = useState('');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div className="bg-white rounded-lg p-6 w-[500px] max-h-[80vh] overflow-y-auto">
        <h3 className="text-xl font-semibold text-black mb-4">Chọn hồ sơ để ứng tuyển</h3>
        
        {hoSos.length === 0 ? (
          <p className="text-gray-600">Bạn chưa có hồ sơ nào được duyệt</p>
        ) : (
          <div className="space-y-4">
            {hoSos.map(hoSo => (
              <div 
                key={hoSo.MaHoSo}
                className={`p-4 border rounded cursor-pointer transition-all ${
                  selectedHoSo === hoSo.MaHoSo 
                    ? 'border-teal-500 bg-teal-50' 
                    : 'border-gray-200 hover:border-teal-500'
                }`}
                onClick={() => setSelectedHoSo(hoSo.MaHoSo)}
              >
                <h4 className="font-medium text-black">{hoSo.TenHoSo}</h4>
                <p className="text-sm text-gray-600">
                  Ngày tạo: {new Date(hoSo.NgayTao).toLocaleDateString('vi-VN')}
                </p>
              </div>
            ))}
          </div>
        )}

        <div className="flex justify-end space-x-2 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-100 text-black rounded hover:bg-gray-200"
          >
            Hủy
          </button>
          <button
            onClick={() => onConfirm(selectedHoSo)}
            disabled={!selectedHoSo}
            className={`px-4 py-2 rounded text-white ${
              selectedHoSo 
                ? 'bg-teal-600 hover:bg-teal-700' 
                : 'bg-gray-400 cursor-not-allowed'
            }`}
          >
            Ứng tuyển
          </button>
        </div>
      </div>
    </div>
  );
};

export default function Home({initialJobs}) {
  const router = useRouter();
  const { showToast } = useToast();
  const { data: session } = useSession();
  const [loading, setLoading] = useState(false);
  const [jobs, setJobs] = useState(initialJobs);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [selectedJobId, setSelectedJobId] = useState(null);
  const listRef = useRef(null);
  
  // States cho chức năng ứng tuyển
  const [showHoSoModal, setShowHoSoModal] = useState(false);
  const [showXacNhanModal, setShowXacNhanModal] = useState(false);
  const [hoSos, setHoSos] = useState([]);
  const [selectedJob, setSelectedJob] = useState(null);
  const [modalConfig, setModalConfig] = useState({});

  // States cho filter
  const [formFilters, setFormFilters] = useState({
    diaDiem: "",
    nganhNghe: "",
    tieuDe: ""
  });
  const [filters, setFilters] = useState({
    diaDiem: "",
    nganhNghe: "",
    tieuDe: ""
  });
  const [isFiltering, setIsFiltering] = useState(false);

  // Handler cho việc ứng tuyển
  const handleApply = async (job) => {
    if (!session) {
      showToast('Vui lòng đăng nhập để ứng tuyển', { type: 'error' });
      router.push('/auth/signIn');
      return;
    }

    if (session.user.role !== 'ungvien') {
      showToast('Chỉ ứng viên mới có thể ứng tuyển', { type: 'error' });
      return;
    }

    try {
      const res = await fetch('/api/ungvien/ds/dshosodaduyet');
      const data = await res.json();
      
      if (data.success) {
        setHoSos(data.data);
        setSelectedJob(job);
        setShowHoSoModal(true);
      } else {
        showToast(data.message || 'Không thể tải danh sách hồ sơ', { type: 'error' });
      }
    } catch (error) {
      showToast('Có lỗi xảy ra', { type: 'error' });
    }
  };

  const handleConfirmApply = async (maHoSo) => {
    if (!maHoSo) {
    showToast('Vui lòng chọn hồ sơ để ứng tuyển', { type: 'error' });
    return;
  }

    setShowHoSoModal(false);
    setModalConfig({
      title: 'Xác nhận ứng tuyển',
      message: 'Bạn có chắc chắn muốn ứng tuyển vào vị trí này?',
      data: { maHoSo } 
    });
    setShowXacNhanModal(true);
  };

  const handleXacNhanUngTuyen = async () => {
    try {
      const res = await fetch('/api/ungvien/ThaoTac/ungtuyen', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          maHoSo: modalConfig.data.maHoSo,
          maTinTuyenDung: selectedJob.MaTinTuyenDung,
        }),
      });

      const data = await res.json();

      if (data.success) {
        showToast('Ứng tuyển thành công!', { type: 'success' });
        setShowXacNhanModal(false);
      } else {
        showToast(data.message || 'Có lỗi xảy ra', { type: 'error' });
      }
    } catch (error) {
      showToast('Có lỗi xảy ra', { type: 'error' });
    }
  };

  const handleViewDetail = (job) => {
    // Chuyển sang trang chi tiết công việc
    window.location.href = `/nhatuyendung/thongtinvieclam?id=${job.MaTinTuyenDung}`;
  };

  // Chỉ fetch khi filters thay đổi (không phải formFilters)
  useEffect(() => {
    if (!filters.diaDiem && !filters.nganhNghe && !filters.tieuDe) {
      setIsFiltering(false);
      setPage(1);
      setJobs(initialJobs); // reset về jobs ban đầu
      return;
    }
    setIsFiltering(true);
    setLoading(true);
    const params = new URLSearchParams();
    if (filters.diaDiem) params.append("diaDiem", filters.diaDiem);
    if (filters.nganhNghe) params.append("nganhNghe", filters.nganhNghe);
    if (filters.tieuDe) params.append("tieuDe", filters.tieuDe);
    params.append("status", "approved");
    params.append("limit", "50");
    fetch(`/api/job/jobs?${params.toString()}`)
      .then(res => res.json())
      .then(data => {
        setJobs(data.jobs || []);
        setHasMore(false);
      })
      .catch(() => setJobs([]))
      .finally(() => setLoading(false));
  }, [filters, initialJobs]);
  
   // Xử lý thay đổi trên form (không fetch ngay)
  const handleFormFilterChange = (name, value) => {
    setFormFilters({ ...formFilters, [name]: value });
  };

  // Chỉ fetch khi submit
  const handleSearch = (e) => {
    e.preventDefault();
    setFilters(formFilters);
    setPage(1);
  };

  // Infinite scroll
  useEffect(() => {
    if (isFiltering) return;
    const handleScroll = () => {
      if (
        listRef.current &&
        window.innerHeight + window.scrollY >= listRef.current.offsetTop + listRef.current.offsetHeight - 200 &&
        hasMore &&
        !loading
      ) {
        setPage(prev => prev + 1);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [hasMore, loading, isFiltering]);


  // Danh sách dữ liệu cho select
  const [diaDiemOptions, setDiaDiemOptions] = useState([]);
const [nganhNgheOptions, setNganhNgheOptions] = useState([]);
const [tieuDeOptions, setTieuDeOptions] = useState([]);

useEffect(() => {
  setDiaDiemOptions(
    Array.from(new Set(jobs.map(job => job.DiaDiem)))
      .filter(Boolean)
      .map(d => ({ value: d, label: d }))
  );
  setNganhNgheOptions(
    Array.from(new Set(jobs.map(job => job.TenNganhNghe)))
      .filter(Boolean)
      .map(n => ({ value: n, label: n }))
  );
  setTieuDeOptions(
    Array.from(new Set(jobs.map(job => job.TieuDe)))
      .filter(Boolean)
      .map(t => ({ value: t, label: t }))
  );
}, [jobs]);

  return (
    <>
      <Head>
        <title>TalentHub - Tìm kiếm việc làm</title>
        <meta name="description" content="Tìm công việc mơ ước của bạn tại TalentHub!" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      {/* Đổi thanh điều hướng theo trạng thái đăng nhập */}

      {session ? <ThanhdhDN /> : <Thanhdh0DN />}

      <div className="min-h-screen flex flex-col gap-2 items-center text-center bg-gray-100 pt-10">
        <h1 className="text-5xl font-bold text-black">Chào mừng đến TalentHub</h1>
        <p className="text-2xl text-black mt-4">Nơi tìm kiếm công việc mơ ước của bạn</p>
        <p className="text-lg mt-2 font-thin text-gray-600">Your dream job is just a click away</p>

        {/* Job Search Form */}
        <form className="flex mt-6" onSubmit={handleSearch}>
        <Select
          className="w-40" 
          classNamePrefix="location"
          options={diaDiemOptions}
          isClearable
          placeholder="Địa điểm"
          value={diaDiemOptions.find(opt => opt.value === formFilters.diaDiem) || null}
          onChange={option => handleFormFilterChange("diaDiem", option ? option.value : "")}
          styles={{
            control: (base, state) => ({
              ...base,
              backgroundColor: "#f0fdfa",
              borderColor: state.isFocused ? "#14b8a6" : "#d1d5db",
              boxShadow: state.isFocused ? "0 0 0 1.5px #14b8a6" : undefined,
              minHeight: "40px",
              fontSize: "1rem",
              borderRadius: 0,
            }),
            option: (base, state) => ({
              ...base,
              color: "#0f172a",
              backgroundColor: state.isSelected
                ? "#99f6e4"
                : state.isFocused
                ? "#ccfbf1"
                : "#fff",
            }),
            menu: (base) => ({
              ...base,
              zIndex: 20,
            }),
            placeholder: (base) => ({
              ...base,
              color: "#64748b",
            }),
            singleValue: (base) => ({
              ...base,
              color: "#0f172a",
            }),
          }}
        />
        <Select
          className="w-40"
          classNamePrefix="industry"
          options={nganhNgheOptions}
          isClearable
          placeholder="Ngành nghề"
          value={nganhNgheOptions.find(opt => opt.value === formFilters.nganhNghe) || null}
          onChange={option => handleFormFilterChange("nganhNghe", option ? option.value : "")}
          styles={{
            control: (base, state) => ({
              ...base,
              backgroundColor: "#f0fdfa",
              borderColor: state.isFocused ? "#14b8a6" : "#d1d5db",
              boxShadow: state.isFocused ? "0 0 0 1.5px #14b8a6" : undefined,
              minHeight: "40px",
              fontSize: "1rem",
              borderRadius: 0,
            }),
            option: (base, state) => ({
              ...base,
              color: "#0f172a",
              backgroundColor: state.isSelected
                ? "#99f6e4"
                : state.isFocused
                ? "#ccfbf1"
                : "#fff",
            }),
            menu: (base) => ({
              ...base,
              zIndex: 20,
            }),
            placeholder: (base) => ({
              ...base,
              color: "#64748b",
            }),
            singleValue: (base) => ({
              ...base,
              color: "#0f172a",
            }),
          }}
        />
        <Select
          className="w-40"
          classNamePrefix="job-title"
          options={tieuDeOptions}
          isClearable
          placeholder="Tên công việc"
          value={tieuDeOptions.find(opt => opt.value === formFilters.tieuDe) || null}
          onChange={option => handleFormFilterChange("tieuDe", option ? option.value : "")}
          styles={{
            control: (base, state) => ({
              ...base,
              backgroundColor: "#f0fdfa",
              borderColor: state.isFocused ? "#14b8a6" : "#d1d5db",
              boxShadow: state.isFocused ? "0 0 0 1.5px #14b8a6" : undefined,
              minHeight: "40px",
              fontSize: "1rem",
              borderRadius: 0,
            }),
            option: (base, state) => ({
              ...base,
              color: "#0f172a",
              backgroundColor: state.isSelected
                ? "#99f6e4"
                : state.isFocused
                ? "#ccfbf1"
                : "#fff",
            }),
            menu: (base) => ({
              ...base,
              zIndex: 20,
            }),
            placeholder: (base) => ({
              ...base,
              color: "#64748b",
            }),
            singleValue: (base) => ({
              ...base,
              color: "#0f172a",
            }),
          }}
        />
        <button
          type="submit"
          className="flex items-center gap-2 p-2 rounded-tr-md rounded-br-md bg-teal-600 text-black font-semibold"
        >
          <Image src="/icons/search.png" alt="search" width={16} height={16} />
          Tìm kiếm
        </button>
          {(formFilters.diaDiem || formFilters.nganhNghe || formFilters.tieuDe) && (
            <button 
              type="button"
              onClick={() => {
                setFormFilters({ diaDiem: "", nganhNghe: "", tieuDe: "" });
                setFilters({ diaDiem: "", nganhNghe: "", tieuDe: "" });
                setPage(1);
              }}
              className="flex items-center gap-2 p-2 rounded-md bg-red-500 text-black font-semibold ml-2"
            >
              Xóa bộ lọc
            </button>
          )}
      </form>

        {/* Thống kê nhanh */}
        <div className="flex mt-10 space-x-10">
          <div className="flex items-center space-x-4">
            <Image src="/icons/job.png" alt="Jobs Icon" width={50} height={50} />
            <div className="flex flex-col text-lg font-bold">
              <span className="text-2xl text-gray-700">{jobs.length}</span>
              <span className="text-gray-700">Việc làm</span>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <Image src="/icons/connguoi.png" alt="Candidates Icon" width={50} height={50} />
            <div className="flex flex-col text-lg font-bold">
              <span className="text-2xl text-gray-700">5000</span>
              <span className="text-gray-700">Ứng viên</span>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <Image src="/icons/congty.png" alt="Company Icon" width={50} height={50} />
            <div className="flex flex-col text-lg font-bold">
              <span className="text-2xl text-gray-700">500</span>
              <span className="text-gray-700">Công ty</span>
            </div>
          </div>
        </div>

        {/* Danh sách việc làm */}
        <div className="w-full max-w-4xl mt-10" ref={listRef}>
          {loading && page === 1 ? (
            <div>Đang tải việc làm...</div>
          ) : jobs.length === 0 ? (
            <div>Không có việc làm phù hợp.</div>
          ) : (
            <ul className="space-y-4">
              {Array.isArray(jobs) && jobs.map((job) => {
                const isSelected = selectedJobId === job.MaTinTuyenDung;
                return (
                  <div key={job.MaTinTuyenDung} className="flex items-center">
                    <li
                      className={`bg-white border rounded-lg p-4 shadow text-left transition-all duration-300 cursor-pointer
                        ${isSelected ? "-translate-x-16 bg-teal-50" : ""}
                      `}
                      style={{ minWidth: 0, flex: "1 1 0%" }}
                      onClick={() =>
                        setSelectedJobId(isSelected ? null : job.MaTinTuyenDung)
                      }
                    >
                      <h3 className="text-xl font-bold text-teal-700 mb-2">{job.TieuDe}</h3>
                      <div className="flex flex-nowrap gap-8 text-gray-700 mb-2 items-center">
                        <span><strong>📍Địa điểm:</strong> {job.DiaDiem || "Chưa cập nhật"}</span>
                        <span><strong>💻Ngành nghề:</strong> {job.TenNganhNghe || "Chưa cập nhật"}</span>
                        <span><strong>⏳Hình thức làm việc:</strong> {job.HinhThuc || "Chưa cập nhật"}</span>
                        <span><strong>💰Mức lương:</strong> {job.MucLuong || "Chưa cập nhật"}</span>
                        <span><strong>🏢Công ty:</strong> {job.CongTy || "Chưa cập nhật"}</span>
                      </div>
                      <div className="mt-2 text-gray-600">{job.MoTa?.slice(0, 100) || "Chưa cập nhật"}...</div>
                    </li>
                    {isSelected && (
                      <div className="flex flex-col gap-2 ml-2">
                        {session && (
                          <button
                            className="px-4 py-2 bg-teal-600 text-white rounded hover:bg-teal-700"
                            onClick={e => { e.stopPropagation(); handleApply(job); }}
                          >
                            Ứng tuyển
                          </button>
                        )}
                        <button
                          className="px-4 py-2 bg-gray-300 text-black rounded hover:bg-gray-400"
                          onClick={e => { e.stopPropagation(); handleViewDetail(job); }}
                        >
                          Xem chi tiết
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </ul>
          )}
          {loading && page > 1 && <div className="text-center my-4">Đang tải thêm...</div>}
        </div>

        {/* Quy trình tìm việc */}
        <div>
          <h2 className="text-5xl font-bold text-black text-center mt-20">Quy trình tìm việc</h2>
          <p className="text-gray-600 text-center mt-5">🌟 Thao tác nhanh gọn với TalentHub để tìm được công việc mơ ước 🌟</p>
          <div className="grid grid-cols-4 gap-6 mt-6 mb-20">
            <div className="flex flex-col items-center bg-gray-100 p-4 rounded-lg shadow-md">
              <Image src="/icons/quytrinhtimviec/avatar.png" alt="Tạo tài khoản" width={50} height={50} />
              <p className="text-lg font-bold text-teal-700 mt-2">Tạo tài khoản</p>
              <p className="text-gray-600 text-sm text-center mt-8 mb-8">Đăng ký để bắt đầu sử dụng TalentHub.</p>
            </div>
            <div className="flex flex-col items-center bg-gray-100 p-4 rounded-lg shadow-md">
              <Image src="/icons/quytrinhtimviec/hoso.png" alt="Tạo hồ sơ" width={50} height={50} />
              <p className="text-lg font-bold text-teal-700 mt-2">Tạo hồ sơ</p>
              <p className="text-gray-600 text-sm text-center mt-8 mb-8">Đánh dấu điểm mạnh và kinh nghiệm nổi bật.</p>
            </div>
            <div className="flex flex-col items-center bg-gray-100 p-4 rounded-lg shadow-md">
              <Image src="/icons/quytrinhtimviec/job1.png" alt="Tìm kiếm việc làm" width={50} height={50} />
              <p className="text-lg font-bold text-teal-700 mt-2">Tìm kiếm việc làm</p>
              <p className="text-gray-600 text-sm text-center mt-8 mb-8">Lọc dữ liệu để tìm vị trí phù hợp.</p>
            </div>
            <div className="flex flex-col items-center bg-gray-100 p-4 rounded-lg shadow-md">
              <Image src="/icons/quytrinhtimviec/tick.png" alt="Ứng tuyển công việc" width={50} height={50} />
              <p className="text-lg font-bold text-teal-700 mt-2">Ứng tuyển công việc</p>
              <p className="text-gray-600 text-sm text-center mt-8 mb-8">Gửi hồ sơ và bắt đầu hành trình mới.</p>
            </div>
          </div>
        </div>
          <ChonHoSoModal
        isOpen={showHoSoModal}
        onClose={() => setShowHoSoModal(false)}
        onConfirm={handleConfirmApply}
        hoSos={hoSos}
      />

      <XacNhanModal
        isOpen={showXacNhanModal}
        onClose={() => setShowXacNhanModal(false)}
        onConfirm={handleXacNhanUngTuyen}
        title={modalConfig.title}
        message={modalConfig.message}
      />
        <ChanTrang />
      </div>
    </>
  );
}
export async function getServerSideProps() {
  const res = await fetch("http://localhost:3000/api/job/jobs?status=approved&limit=10&page=1");
  const data = await res.json();
  return {
    props: {
      initialJobs: data.jobs || [],
    },
  };
}