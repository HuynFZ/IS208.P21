import { useState } from 'react';
import { useRouter } from 'next/router';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { useToast } from '@/context/ToastContext';
import axios from 'axios';
import TaoBaiTestModal from './TaoBaiTestModal'; 
import XacNhanModal from '../../components/xacnhanmodal';

export default function BaiTestList({ tests, onReload, loading }) {
  const router = useRouter();
  const { showToast } = useToast();
  const [selectedTest, setSelectedTest] = useState(null);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedDeleteId, setSelectedDeleteId] = useState(null);

  const getStatusColor = (status) => {
    switch (status) {
      case 'Chưa diễn ra': return 'bg-yellow-100 text-yellow-800';
      case 'Đang diễn ra': return 'bg-blue-100 text-blue-800';
      case 'Đã kết thúc': return 'bg-green-100 text-green-800';
      case 'Đã hủy': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };
  const handleDeleteClick = (maBaiTest) => {
    setSelectedDeleteId(maBaiTest);
    setIsDeleteModalOpen(true);
  };

  const handleDelete = async () => {
    if (!selectedDeleteId) return;

    setIsDeleting(true);
    try {
      const res = await axios.delete(`/api/nhatuyendung/baitest/${selectedDeleteId}`);
      if (res.data.success) {
        showToast('Xóa bài test thành công', { type: 'success' });
        onReload();
      }
    } catch (error) {
      showToast(error.response?.data?.message || 'Có lỗi xảy ra khi xóa', { type: 'error' });
    } finally {
      setIsDeleting(false);
      setIsDeleteModalOpen(false);
      setSelectedDeleteId(null);
    }
  };

  const handleUpdate = (test) => {
    setSelectedTest(test);
    setIsUpdateModalOpen(true);
  };

  if (loading) {
    return <div className="text-center py-8">Đang tải...</div>;
  }

  return (
    <>
      <div className="bg-white shadow-sm rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tiêu đề</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tin tuyển dụng</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Thời gian</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Số lượt làm</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trạng thái</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Thao tác</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {tests.map((test) => (
              <tr key={test.MaBaiTest}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{test.TieuDe}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{test.TenTinTuyenDung}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {format(new Date(test.ThoiGianBatDau), 'HH:mm - dd/MM/yyyy', { locale: vi })}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <div>{test.SoLuotLam || 0} lượt làm</div>
                  <div className="text-xs">ĐTB: {test.DiemTrungBinh?.toFixed(1) || 'Chưa có'}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(test.TrangThai)}`}>
                    {test.TrangThai}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                  <button
                    onClick={() => router.push(`/nhatuyendung/PhongVanvaBaiTest/BaiTest/${test.MaBaiTest}`)}
                    className="text-teal-600 hover:text-teal-900"
                  >
                    Chi tiết
                  </button>
                  <button
                    onClick={() => handleUpdate(test)}
                    className="text-blue-600 hover:text-blue-900"
                    disabled={isDeleting || test.TrangThai === 'Đã kết thúc' || test.TrangThai === 'Đã hủy'}
                  >
                    Cập nhật
                  </button>
                  <button
                    onClick={() => handleDeleteClick(test.MaBaiTest)}
                    className="text-red-600 hover:text-red-900 ml-2"
                    disabled={isDeleting || test.TrangThai === 'Đã kết thúc' || test.TrangThai === 'Đã hủy'}
                  >
                    Xóa
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>


    {isUpdateModalOpen && selectedTest && (
      <TaoBaiTestModal
        isOpen={isUpdateModalOpen}
        onClose={() => {
          setIsUpdateModalOpen(false);
          setSelectedTest(null);
        }}
        onSuccess={() => {
          setIsUpdateModalOpen(false);
          setSelectedTest(null);
          onReload();
          showToast('Cập nhật bài test thành công', { type: 'success' });
        }}
        initialData={{
          tieuDe: selectedTest.TieuDe,
          maTinTuyenDung: selectedTest.MaTinTuyenDung,
          moTa: selectedTest.MoTa,
          linkTest: selectedTest.LinkTest,
          thoiGianBatDau: format(new Date(selectedTest.ThoiGianBatDau), "yyyy-MM-dd'T'HH:mm"),
          thoiGianKetThuc: format(new Date(selectedTest.ThoiGianKetThuc), "yyyy-MM-dd'T'HH:mm"),
          hanXacNhan: format(new Date(selectedTest.HanXacNhan), "yyyy-MM-dd'T'HH:mm"),
        }}
        isUpdate={true}
        maBaiTest={selectedTest.MaBaiTest}
        disabledFields={['tieuDe']}
      />
    )}

      {isDeleteModalOpen && (
        <XacNhanModal
          isOpen={isDeleteModalOpen}
          onClose={() => {
            setIsDeleteModalOpen(false);
            setSelectedDeleteId(null);
          }}
          onConfirm={handleDelete}
          title="Xác nhận xóa"
          message="Bạn có chắc chắn muốn xóa bài test này? Hành động này không thể hoàn tác."
        />
      )}
    </>
  );
}
