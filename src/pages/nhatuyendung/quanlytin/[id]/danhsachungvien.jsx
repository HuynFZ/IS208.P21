import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
import axios from 'axios';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { useToast } from '@/context/ToastContext';
import ThanhdhDN from '@/components/thanhdieuhuong/thanhdhDN';
import ChanTrang from '@/components/chantrang';

// Modal hiển thị danh sách ứng viên
const DanhSachModal = ({ isOpen, onClose, data = [], type, maPhongVan, onUpdateStatus }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div className="bg-white rounded-lg p-6 w-[1000px] max-w-4xl mx-4">
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            Danh sách ứng viên {type === 'test' ? 'làm bài test' : 'tham gia phỏng vấn'}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
            <span className="sr-only">Đóng</span>
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="mt-4 overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Ứng viên
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Trạng thái
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Xác nhận
                </th>
                {type === 'test' && (
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Kết quả
                  </th>
                )}
                {type === 'phongvan' && (
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Thao tác
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {Array.isArray(data) && data.map((item) => (
                <tr key={item.ID}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {item.TenUngVien}
                    </div>
                    <div className="text-sm text-gray-500">{item.Email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full 
                      ${item.TrangThai === 'Đã tham gia' 
                        ? 'bg-green-100 text-green-800'
                        : item.TrangThai === 'Không tham gia'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-yellow-100 text-yellow-800'}`}
                    >
                      {item.TrangThai}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full
                      ${item.TrangThaiXacNhan === 'Xác nhận'
                        ? 'bg-green-100 text-green-800'
                        : item.TrangThaiXacNhan === 'Từ chối'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-gray-100 text-gray-800'}`}
                    >
                      {item.TrangThaiXacNhan || 'Chưa xác nhận'}
                    </span>
                  </td>
                  {type === 'test' && (
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {item.KetQua || '-'}
                    </td>
                  )}
                  {type === 'phongvan' && item.TrangThai === 'Chưa diễn ra' && (
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => onUpdateStatus(maPhongVan, item.MaUngVien, 'Đã tham gia')}
                          className="px-3 py-1 text-xs font-medium text-green-700 bg-green-100 rounded-full hover:bg-green-200"
                        >
                          Đã tham gia
                        </button>
                        <button
                          onClick={() => onUpdateStatus(maPhongVan, item.MaUngVien, 'Không tham gia')}
                          className="px-3 py-1 text-xs font-medium text-red-700 bg-red-100 rounded-full hover:bg-red-200"
                        >
                          Không tham gia
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};

export default function QuanLyUngVien() {
  const router = useRouter();
  const { id } = router.query;
  const { data: session } = useSession();
  const { showToast } = useToast();

  const [loading, setLoading] = useState(true);
  const [tinTuyenDung, setTinTuyenDung] = useState(null);
  const [danhSachTest, setDanhSachTest] = useState([]);
  const [danhSachPhongVan, setDanhSachPhongVan] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedData, setSelectedData] = useState([]);
  const [modalType, setModalType] = useState(null);
  const [selectedPhongVanId, setSelectedPhongVanId] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  // Di chuyển hàm handleUpdateStatus vào trong component
  const handleUpdateStatus = async (maPhongVan, ungVienId, trangThai) => {
    try {
      console.log('Debug params:', { ungVienId, maPhongVan, trangThai });
      const res = await axios.put(`/api/nhatuyendung/phongvan/capnhattrangthai/${maPhongVan}`, {
        ungVienId,
        trangThai
      });
      
      if (res.data.success) {
        showToast('Cập nhật trạng thái thành công', { type: 'success' });
        // Refresh data
        setRefreshKey(prev => prev + 1);
        // Refresh danh sách trong modal
        handleShowDanhSachPhongVan(maPhongVan);
      }
    } catch (error) {
      console.error('Error updating status:', error);
      showToast(error.response?.data?.message || 'Có lỗi xảy ra khi cập nhật', { type: 'error' });
    }
  };

  useEffect(() => {
    if (!session) {
      router.push('/dangnhap_ky/dangnhap');
      return;
    }

    if (id) {
      fetchData();
    }
  }, [id, session, refreshKey]); // Thêm refreshKey vào dependency

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`/api/nhatuyendung/${id}`);
      if (res.data.success) {
        setTinTuyenDung(res.data.tinTuyenDung);
        setDanhSachTest(res.data.danhSachTest || []);
        setDanhSachPhongVan(res.data.danhSachPhongVan || []);
      }
    } catch (error) {
      showToast(error.response?.data?.message || 'Có lỗi xảy ra', { type: 'error' });
      setDanhSachTest([]); 
      setDanhSachPhongVan([]);
    } finally {
      setLoading(false);
    }
  };

  const handleShowDanhSachTest = async (maBaiTest) => {
    try {
      const res = await axios.get(`/api/nhatuyendung/quanlytin/test/${maBaiTest}`);
      if (res.data.success) {
        setSelectedData(res.data.danhSach);
        setModalType('test');
        setShowModal(true);
      }
    } catch (error) {
      showToast(error.response?.data?.message || 'Có lỗi xảy ra', { type: 'error' });
    }
  };

  const handleShowDanhSachPhongVan = async (maPhongVan) => {
    try {
      setSelectedPhongVanId(maPhongVan);
      const res = await axios.get(`/api/nhatuyendung/phongvan/${maPhongVan}/danhsach`);
      if (res.data.success) {
        setSelectedData(res.data.danhSach || []);
        setModalType('phongvan');
        setShowModal(true);
      }
    } catch (error) {
      console.error('Error fetching interview data:', error);
      showToast(error.response?.data?.message || 'Có lỗi khi lấy danh sách ứng viên', { type: 'error' });
    }
  };

  if (loading) {
    return (
      <>
        <ThanhdhDN />
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
        </div>
      </>
    );
  }

  return (
    <>
      <ThanhdhDN />
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4">
          <div className="mb-8">
            <button
              onClick={() => router.back()}
              className="mb-4 text-gray-600 hover:text-gray-900"
            >
              ← Quay lại
            </button>
            <h1 className="text-2xl font-bold text-gray-900">Quản lý ứng viên</h1>
            <p className="mt-2 text-gray-600">{tinTuyenDung?.TieuDe}</p>
          </div>

          {/* Danh sách bài test */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Danh sách bài test</h2>
            {danhSachTest.length === 0 ? (
              <p className="text-gray-500">Chưa có bài test nào</p>
            ) : (
              <div className="bg-white shadow overflow-hidden rounded-lg divide-y divide-gray-200">
                {danhSachTest.map((test) => (
                  <div key={test.MaBaiTest} className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-medium text-gray-900">{test.TieuDe}</h3>
                        <p className="mt-1 text-sm text-gray-500">{test.MoTa}</p>
                        <div className="mt-2 space-y-1">
                          <p className="text-sm text-gray-600">
                            Thời gian: {format(new Date(test.ThoiGianBatDau), 'dd/MM/yyyy HH:mm', { locale: vi })}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleShowDanhSachTest(test.MaBaiTest)}
                        className="px-4 py-2 text-sm font-medium text-teal-600 hover:text-teal-900"
                      >
                        Xem danh sách ứng viên
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Danh sách phỏng vấn */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Danh sách phỏng vấn</h2>
            {danhSachPhongVan.length === 0 ? (
              <p className="text-gray-500">Chưa có lịch phỏng vấn nào</p>
            ) : (
              <div className="bg-white shadow overflow-hidden rounded-lg divide-y divide-gray-200">
                {danhSachPhongVan.map((phongvan) => (
                  <div key={phongvan.MaLichPhongVan} className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-medium text-gray-900">{phongvan.TieuDe}</h3>
                        <p className="mt-1 text-sm text-gray-500">{phongvan.MoTa}</p>
                        <div className="mt-2 space-y-1">
                          <p className="text-sm text-gray-600">
                            Thời gian: {
                              phongvan.ThoiGian 
                                ? format(new Date(phongvan.ThoiGianBatDau), 'dd/MM/yyyy HH:mm', { locale: vi })
                                : 'Chưa có thời gian'
                            }
                          </p>
                          <p className="text-sm text-gray-600">
                            Hình thức: {phongvan.HinhThuc}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleShowDanhSachPhongVan(phongvan.MaLichPhongVan)}
                        className="px-4 py-2 text-sm font-medium text-teal-600 hover:text-teal-900"
                      >
                        Xem danh sách ứng viên
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <DanhSachModal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setSelectedData([]);
          setModalType(null);
        }}
        data={selectedData}
        type={modalType}
        maPhongVan={selectedPhongVanId}
        onUpdateStatus={handleUpdateStatus}
      />

      <ChanTrang />
    </>
  );
}