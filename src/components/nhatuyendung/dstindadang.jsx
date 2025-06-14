'use client';
import ThanhdhDN from "../../components/thanhdieuhuong/thanhdhDN";
import ChanTrang from "../../components/chantrang";
import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import axios from 'axios';
import { useRouter } from "next/router";


function getStatusColor(status) {
  switch (status) {
    case 'Chờ xử lý':
      return 'bg-yellow-100 text-yellow-800';
    case 'Tất cả':
      return 'bg-blue-100 text-blue-800';
    case 'Đã duyệt':
      return 'bg-green-100 text-green-800';
    case 'Đã hủy' || 'Hết hạn':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
}

export default function DSTin() {
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const filterRef = useRef(null);
  const [jobPostings, setJobPostings] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const [filterStatus, setFilterStatus] = useState("Tất cả");

  // Đóng dropdown nếu click ra ngoài
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (filterRef.current && !filterRef.current.contains(event.target)) {
        setShowFilterMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleFilterClick = () => {
    setShowFilterMenu(prev => !prev);
  };

  const filteredJobPostings = filterStatus === "Tất cả"
  ? jobPostings
  : jobPostings.filter(job => job.TrangThai === filterStatus);

  // Fetch danh sách tin đã đăng
  useEffect(() => {
    const fetchJobPostings = async () => {
      try {
        const response = await axios.get('/api/nhatuyendung/list');
        if (response.data.success) {
          setJobPostings(response.data.data);
        } else {
          setError(response.data.message || 'Không thể lấy danh sách tin tuyển dụng');
        }
      } catch (err) {
        setError('Lỗi server khi lấy danh sách tin');
      } finally {
        setLoading(false);
      }
    };
    fetchJobPostings();
  }, []);

  // Hàm định dạng ngày theo dd/mm/yyyy
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN');
  };

  return (
    <div className="bg-white min-h-screen">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-semibold text-gray-900">Danh sách tin đã đăng</h1>
            <div className="relative" ref={filterRef}>
              <button
                onClick={handleFilterClick}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                <span className="mr-2">Trạng thái: {filterStatus}</span>
                <Image src="/icons/filter.png" alt="Lọc" width={16} height={16} />
              </button>
              {showFilterMenu && (
                <div className="origin-top-right absolute right-0 mt-2 w-40 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5">
                  <div className="py-1">
                    {["Tất cả", "Đã duyệt", "Chờ xử lý", "Hết hạn", "Đã hủy"].map(status => (
                      <button
                        key={status}
                        className={`block px-4 py-2 text-sm w-full text-left ${
                          filterStatus === status 
                            ? "bg-gray-100 text-gray-900" 
                            : "text-gray-700 hover:bg-gray-50"
                        }`}
                        onClick={() => {
                          setFilterStatus(status);
                          setShowFilterMenu(false);
                        }}
                      >
                        {status}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="bg-white shadow-sm rounded-lg overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tin tuyển dụng
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ngày đăng
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Thời gian nộp
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Trạng thái
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Thao tác
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredJobPostings.map((job) => (
                  <tr key={job.MaTinTuyenDung} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {job.TieuDe}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(job.NgayDangTin)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(job.NgayHetHan)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(job.TrangThai)}`}>
                        {job.TrangThai}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                      <button
                        onClick={() => router.push(`/nhatuyendung/thongtinvieclam?id=${job.MaTinTuyenDung}`)}
                        className="text-teal-600 hover:text-teal-900"
                      >
                        Chi tiết
                      </button>
                      {job.TrangThai === "Đã duyệt" && (
                        <>
                        <button
                          onClick={() => router.push(`/nhatuyendung/${job.MaTinTuyenDung}/hosodanop`)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          Danh sách hồ sơ
                        </button>
                         <button
                        onClick={() => router.push(`/nhatuyendung/quanlytin/${job.MaTinTuyenDung}/danhsachungvien`)}
                        className="text-indigo-600 hover:text-indigo-900"
                      >
                        Quản lý test/PV
                      </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}