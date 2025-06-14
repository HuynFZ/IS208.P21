import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
import axios from 'axios';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { useToast } from '@/context/ToastContext';
import ThanhdhDN from '@/components/thanhdieuhuong/thanhdhDN';
import ChanTrang from '@/components/chantrang';

// Chi tiết Modal Component
const ChiTietModal = ({ isOpen, onClose, item, type }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div className="bg-white rounded-lg p-6 w-[600px] max-w-lg mx-4">
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            {type === 'test' ? 'Chi tiết bài test' : 'Chi tiết buổi phỏng vấn'}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
            <span className="sr-only">Đóng</span>
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <h4 className="text-sm font-medium text-gray-500">Tiêu đề</h4>
            <p className="mt-1 text-gray-900">{item.TieuDe}</p>
          </div>

          <div>
            <h4 className="text-sm font-medium text-gray-500">Mô tả</h4>
            <p className="mt-1 text-gray-900">{item.MoTa}</p>
          </div>

          {type === 'test' ? (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Thời gian bắt đầu</h4>
                  <p className="mt-1 text-gray-900">
                    {format(new Date(item.ThoiGianBatDau), 'dd/MM/yyyy HH:mm', { locale: vi })}
                  </p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Thời gian kết thúc</h4>
                  <p className="mt-1 text-gray-900">
                    {format(new Date(item.ThoiGianKetThuc), 'dd/MM/yyyy HH:mm', { locale: vi })}
                  </p>
                </div>
              </div>
              
              {item.LinkTest && (
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Link làm bài</h4>
                  <a 
                    href={item.LinkTest}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-1 text-blue-600 hover:text-blue-800"
                  >
                    Truy cập bài test
                  </a>
                </div>
              )}

              {item.KetQua && (
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Kết quả</h4>
                  <p className="mt-1 text-gray-900">{item.KetQua} điểm</p>
                </div>
              )}
            </>
          ) : (
            <>
              <div>
                <h4 className="text-sm font-medium text-gray-500">Thời gian</h4>
                <p className="mt-1 text-gray-900">
                  {format(new Date(item.ThoiGian), 'dd/MM/yyyy HH:mm', { locale: vi })}
                </p>
              </div>

              <div>
                <h4 className="text-sm font-medium text-gray-500">Hình thức</h4>
                <p className="mt-1 text-gray-900">{item.HinhThuc}</p>
              </div>

              <div>
                <h4 className="text-sm font-medium text-gray-500">Địa điểm</h4>
                <p className="mt-1 text-gray-900">{item.DiaChi}</p>
              </div>

              {item.LinkMeet && (
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Link phỏng vấn</h4>
                  <a 
                    href={item.LinkMeet}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-1 text-blue-600 hover:text-blue-800"
                  >
                    Tham gia phỏng vấn
                  </a>
                </div>
              )}
            </>
          )}

          <div>
            <h4 className="text-sm font-medium text-gray-500">Trạng thái</h4>
            <p className="mt-1 text-gray-900">{item.TrangThai}</p>
          </div>

          {item.GhiChu && (
            <div>
              <h4 className="text-sm font-medium text-gray-500">Ghi chú</h4>
              <p className="mt-1 text-gray-900">{item.GhiChu}</p>
            </div>
          )}
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border 
              border-gray-300 rounded-md hover:bg-gray-50"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};

// Main Component
export default function TheoDoiUngTuyen() {
  const router = useRouter();
  const { id } = router.query;
  const { data: session } = useSession();
  const { showToast } = useToast();

  // States
  const [loading, setLoading] = useState(true);
  const [tinTuyenDung, setTinTuyenDung] = useState(null);
  const [danhSachTest, setDanhSachTest] = useState([]);
  const [danhSachPhongVan, setDanhSachPhongVan] = useState([]);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [selectedType, setSelectedType] = useState(null);

  // Effects
  useEffect(() => {
    if (!session) {
      router.push('/dangnhap_ky/dangnhap');
      return;
    }

    if (id) {
      fetchData();
    }
  }, [id, session]);

  // Functions
  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`/api/ungvien/theodoi/${id}`);
      if (res.data.success) {
        setTinTuyenDung(res.data.tinTuyenDung);
        setDanhSachTest(res.data.danhSachTest);
        setDanhSachPhongVan(res.data.danhSachPhongVan);
      }
    } catch (error) {
      showToast(error.response?.data?.message || 'Có lỗi xảy ra', { type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (type, itemId, action) => {
    try {
      const res = await axios.put(`/api/ungvien/theodoi/capnhat/${type}/${itemId}`, {
        action
      });

      if (res.data.success) {
        showToast('Cập nhật thành công', { type: 'success' });
        fetchData();
      }
    } catch (error) {
      showToast(error.response?.data?.message || 'Có lỗi xảy ra', { type: 'error' });
    }
  };

  const handleShowDetail = (item, type) => {
    setSelectedItem(item);
    setSelectedType(type);
    setShowDetailModal(true);
  };

  // Loading state
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

  // Render
  return (
    <>
      <ThanhdhDN />
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4">
          {/* Header */}
          <div className="mb-8">
            <button
              onClick={() => router.back()}
              className="mb-4 text-gray-600 hover:text-gray-900"
            >
              ← Quay lại
            </button>
            <h1 className="text-2xl font-bold text-gray-900">Theo dõi ứng tuyển</h1>
            <p className="mt-2 text-gray-600">{tinTuyenDung?.TieuDe}</p>
          </div>

          {/* Test List */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Bài test</h2>
            {danhSachTest.length === 0 ? (
              <p className="text-gray-500">Chưa có bài test nào</p>
            ) : (
              <div className="bg-white shadow overflow-hidden rounded-lg divide-y divide-gray-200">
                {danhSachTest.map((test) => (
                  <div key={test.ID} className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-medium text-gray-900">{test.TieuDe}</h3>
                        <p className="mt-1 text-sm text-gray-500">{test.MoTa}</p>
                        <div className="mt-2 space-y-1">
                          <p className="text-sm text-gray-600">
                            Thời gian bắt đầu: {format(new Date(test.ThoiGianBatDau), 'dd/MM/yyyy HH:mm', { locale: vi })}
                          </p>
                          <p className="text-sm text-gray-600">
                            Trạng thái: <span className="font-medium">{test.TrangThai}</span>
                          </p>
                        </div>
                      </div>
                      <div className="space-x-2">
                        <button
                          onClick={() => handleShowDetail(test, 'test')}
                          className="px-4 py-2 text-sm text-blue-600 hover:text-blue-900"
                        >
                          Chi tiết
                        </button>
                        {!test.TrangThaiXacNhan && (
                          <>
                            <button
                              onClick={() => handleAction('test', test.ID, 'Xác nhận')}
                              className="px-4 py-2 text-sm text-white bg-teal-600 rounded-md hover:bg-teal-700"
                            >
                              Xác nhận
                            </button>
                            <button
                              onClick={() => handleAction('test', test.ID, 'Từ chối')}
                              className="px-4 py-2 text-sm text-white bg-red-600 rounded-md hover:bg-red-700"
                            >
                              Từ chối
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Interview List */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Lịch phỏng vấn</h2>
            {danhSachPhongVan.length === 0 ? (
              <p className="text-gray-500">Chưa có lịch phỏng vấn nào</p>
            ) : (
              <div className="bg-white shadow overflow-hidden rounded-lg divide-y divide-gray-200">
                {danhSachPhongVan.map((phongvan) => (
                  <div key={phongvan.ID} className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-medium text-gray-900">{phongvan.TieuDe}</h3>
                        <p className="mt-1 text-sm text-gray-500">{phongvan.MoTa}</p>
                        <div className="mt-2 space-y-1">
                          <p className="text-sm text-gray-600">
                            Thời gian: {format(new Date(phongvan.ThoiGian), 'dd/MM/yyyy HH:mm', { locale: vi })}
                          </p>
                          <p className="text-sm text-gray-600">
                            Trạng thái: <span className="font-medium">{phongvan.TrangThai}</span>
                          </p>
                        </div>
                      </div>
                      <div className="space-x-2">
                        <button
                          onClick={() => handleShowDetail(phongvan, 'phongvan')}
                          className="px-4 py-2 text-sm text-blue-600 hover:text-blue-900"
                        >
                          Chi tiết
                        </button>
                        {!phongvan.TrangThaiXacNhan && (
                          <>
                            <button
                              onClick={() => handleAction('phongvan', phongvan.ID, 'Xác nhận')}
                              className="px-4 py-2 text-sm text-white bg-teal-600 rounded-md hover:bg-teal-700"
                            >
                              Xác nhận
                            </button>
                            <button
                              onClick={() => handleAction('phongvan', phongvan.ID, 'Từ chối')}
                              className="px-4 py-2 text-sm text-white bg-red-600 rounded-md hover:bg-red-700"
                            >
                              Từ chối
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal */}
      <ChiTietModal
        isOpen={showDetailModal}
        onClose={() => {
          setShowDetailModal(false);
          setSelectedItem(null);
          setSelectedType(null);
        }}
        item={selectedItem}
        type={selectedType}
      />

      <ChanTrang />
    </>
  );
}