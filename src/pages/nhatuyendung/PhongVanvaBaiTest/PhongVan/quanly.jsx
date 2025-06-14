import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
import axios from 'axios';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { useToast } from '@/context/ToastContext';
import ThanhdhDN from '@/components/thanhdieuhuong/thanhdhDN';
import ChanTrang from '@/components/chantrang';

export default function QuanLyPhongVan() {
  const router = useRouter();
  const { data: session } = useSession();
  const { showToast } = useToast();

  const [loading, setLoading] = useState(true);
  const [danhSachPhongVan, setDanhSachPhongVan] = useState([]);

  useEffect(() => {
    if (!session) {
      router.push('/dangnhap_ky/dangnhap');
      return;
    }

    fetchDanhSachPhongVan();
  }, [session]);

  const fetchDanhSachPhongVan = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/api/nhatuyendung/phongvan/danhsach');
      if (res.data.success) {
        setDanhSachPhongVan(res.data.danhSach);
      }
    } catch (error) {
      showToast(error.response?.data?.message || 'Có lỗi xảy ra', { type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateTrangThai = async (id, trangThai) => {
    try {
      const res = await axios.put(`/api/nhatuyendung/phongvan/capnhat/${id}`, {
        trangThai
      });

      if (res.data.success) {
        showToast('Cập nhật trạng thái thành công', { type: 'success' });
        fetchDanhSachPhongVan();
      }
    } catch (error) {
      showToast(error.response?.data?.message || 'Có lỗi xảy ra', { type: 'error' });
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
          <h1 className="text-2xl font-bold text-gray-900 mb-8">
            Quản lý phỏng vấn
          </h1>

          {danhSachPhongVan.length === 0 ? (
            <p className="text-gray-500">Chưa có phỏng vấn nào đang diễn ra hoặc đã kết thúc</p>
          ) : (
            <div className="bg-white shadow overflow-hidden rounded-lg divide-y divide-gray-200">
              {danhSachPhongVan.map((phongvan) => (
                <div key={phongvan.MaLichPhongVan} className="p-6">
                  <div className="mb-4">
                    <h3 className="text-lg font-medium text-gray-900">{phongvan.TieuDe}</h3>
                    <p className="mt-1 text-sm text-gray-500">{phongvan.MoTa}</p>
                    <div className="mt-2 space-y-1">
                      <p className="text-sm text-gray-600">
                        Thời gian: {format(new Date(phongvan.ThoiGian), 'dd/MM/yyyy HH:mm', { locale: vi })}
                      </p>
                      <p className="text-sm text-gray-600">
                        Hình thức: {phongvan.HinhThuc}
                      </p>
                    </div>
                  </div>

                  <div className="mt-6">
                    <h4 className="text-md font-medium text-gray-900 mb-4">Danh sách ứng viên</h4>
                    <div className="overflow-x-auto">
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
                              Thao tác
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {phongvan.DanhSachUngVien.map((ungvien) => (
                            <tr key={ungvien.ID}>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm font-medium text-gray-900">
                                  {ungvien.TenUngVien}
                                </div>
                                <div className="text-sm text-gray-500">{ungvien.Email}</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`px-2 py-1 text-xs font-medium rounded-full
                                  ${ungvien.TrangThai === 'Đã tham gia'
                                    ? 'bg-green-100 text-green-800'
                                    : ungvien.TrangThai === 'Không tham gia'
                                    ? 'bg-red-100 text-red-800'
                                    : 'bg-yellow-100 text-yellow-800'
                                  }`}
                                >
                                  {ungvien.TrangThai}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                                <button
                                  onClick={() => handleUpdateTrangThai(ungvien.ID, 'Đã tham gia')}
                                  className="text-green-600 hover:text-green-900"
                                  disabled={ungvien.TrangThai !== 'Chưa diễn ra'}
                                >
                                  Xác nhận đã tham gia
                                </button>
                                <button
                                  onClick={() => handleUpdateTrangThai(ungvien.ID, 'Không tham gia')}
                                  className="text-red-600 hover:text-red-900"
                                  disabled={ungvien.TrangThai !== 'Chưa diễn ra'}
                                >
                                  Không tham gia
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      <ChanTrang />
    </>
  );
}