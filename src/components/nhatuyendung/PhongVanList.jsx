import { useState } from 'react';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { useRouter } from 'next/router';
import axios from 'axios';
import { useToast } from '@/context/ToastContext';
import TaoPhongVanModal from './TaoPhongVanModal';
import XacNhanModal from '../../components/xacnhanmodal';

function getStatusColor(status) {
  switch (status) {
    case 'Chưa diễn ra':
      return 'bg-yellow-100 text-yellow-800';
    case 'Đang diễn ra':
      return 'bg-blue-100 text-blue-800';
    case 'Đã kết thúc':
      return 'bg-green-100 text-green-800';
    case 'Đã hủy':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
}

export default function InterviewList({ interviews, onReload, loading }) {
  const router = useRouter();
  const { showToast } = useToast();
  const [selectedInterview, setSelectedInterview] = useState(null);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedDeleteId, setSelectedDeleteId] = useState(null);

  const handleDeleteClick = (maLichPhongVan) => {
    setSelectedDeleteId(maLichPhongVan);
    setIsDeleteModalOpen(true);
  };

  const handleDelete = async () => {
    if (!selectedDeleteId) return;

    setIsDeleting(true);
    try {
      const res = await axios.delete(`/api/nhatuyendung/phongvan/${selectedDeleteId}`);
      if (res.data.success) {
        showToast('Xóa phỏng vấn thành công', { type: 'success' });
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

  const handleUpdate = (interview) => {
    setSelectedInterview(interview);
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
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Tiêu đề
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Tin tuyển dụng
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Thời gian
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Số ứng viên
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
            {interviews.map((interview) => (
              <tr key={interview.MaLichPhongVan}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    {interview.TieuDe}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-500">
                    {interview.TenTinTuyenDung}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-500">
                    {format(new Date(interview.ThoiGianBatDau), 'HH:mm - dd/MM/yyyy', {locale: vi})}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-500">
                    <div>{interview.SoUngVien || 0} ứng viên</div>
                    <div className="text-xs">
                      Đã xác nhận: {interview.SoXacNhan || 0}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full
                    ${getStatusColor(interview.TrangThai)}`}>
                    {interview.TrangThai}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                  <button
                    onClick={() => router.push(`/nhatuyendung/PhongVanvaBaiTest/PhongVan/${interview.MaLichPhongVan}`)}
                    className="text-teal-600 hover:text-teal-900"
                  >
                    Chi tiết
                  </button>
                  <button
                    onClick={() => handleUpdate(interview)}
                    className="text-blue-600 hover:text-blue-900"
                    disabled={isDeleting || interview.TrangThai === 'Đã kết thúc' || interview.TrangThai === 'Đã hủy'}
                  >
                    Cập nhật
                  </button>
                  <button
                    onClick={() => handleDeleteClick(interview.MaLichPhongVan)}
                    className="text-red-600 hover:text-red-900 ml-2"
                    disabled={isDeleting || interview.TrangThai === 'Đã kết thúc' || interview.TrangThai === 'Đã hủy'}
                  >
                    Xóa
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isUpdateModalOpen && selectedInterview && (
        <TaoPhongVanModal
          isOpen={isUpdateModalOpen}
          onClose={() => {
            setIsUpdateModalOpen(false);
            setSelectedInterview(null);
          }}
          onSuccess={() => {
            setIsUpdateModalOpen(false);
            setSelectedInterview(null);
            onReload();
            showToast('Cập nhật phỏng vấn thành công', { type: 'success' });
          }}
          initialData={{
            tieuDe: selectedInterview.TieuDe,
            maTinTuyenDung: selectedInterview.MaTinTuyenDung,
            moTa: selectedInterview.MoTa,
            diaChi: selectedInterview.DiaChi,
            thoiGianBatDau: format(new Date(selectedInterview.ThoiGianBatDau), "yyyy-MM-dd'T'HH:mm"),
            thoiGianKetThuc: format(new Date(selectedInterview.ThoiGianKetThuc), "yyyy-MM-dd'T'HH:mm"),
            hanXacNhan: format(new Date(selectedInterview.HanXacNhan), "yyyy-MM-dd'T'HH:mm"),
          }}
          isUpdate={true}
          maPhongVan={selectedInterview.MaLichPhongVan}
          disabledFields={['tieuDe']}
        />
      )}
    </>
  );
}