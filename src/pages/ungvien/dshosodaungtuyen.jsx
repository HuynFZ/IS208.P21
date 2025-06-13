import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import axios from 'axios';
import { useToast } from '@/context/ToastContext';
import ThanhdhDN from '@/components/thanhdieuhuong/thanhdhDN';
import ChanTrang from '@/components/chantrang';
import XacNhanModal from '@/components/xacnhanmodal';

export default function CongViecDaUngTuyen() {
  const router = useRouter();
  const { data: session } = useSession();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [jobs, setJobs] = useState([]);
  const [showXacNhanModal, setShowXacNhanModal] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);

  useEffect(() => {
    if (!session) {
      router.push('/dangnhap_ky/dangnhap');
      return;
    }

    if (session.user.role !== 'ungvien') {
      router.push('/');
      return;
    }

    fetchAppliedJobs();
  }, [session, router]);

  const fetchAppliedJobs = async () => {
    try {
      const res = await axios.get('/api/ungvien/ds/dshosodaungtuyen');
      setJobs(res.data.data);
    } catch (error) {
      showToast(error.response?.data?.message || 'Có lỗi xảy ra', { type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (job) => {
    setSelectedJob(job);
    setShowXacNhanModal(true);
  };

  const handleConfirmDelete = async () => {
  try {
    if (!selectedJob) {
      showToast('Không có thông tin công việc được chọn', { type: 'error' });
      return;
    }

    console.log('Deleting job application:', selectedJob);
    
    const res = await axios.delete(`/api/ungvien/ThaoTac/xoayeucauungtuyen`, {
      params: {
        maHoSo: selectedJob.MaHoSo,
        maTinTuyenDung: selectedJob.MaTinTuyenDung
      }
    });

    console.log('Delete response:', res.data);
    
    if (res.data.success) {
      showToast('Đã hủy yêu cầu ứng tuyển thành công', { type: 'success' });
      await fetchAppliedJobs();
      setShowXacNhanModal(false);
    }
  } catch (error) {
    console.error('Delete error:', error);
    showToast(error.response?.data?.message || 'Có lỗi xảy ra', { type: 'error' });
  }
};

  const getStatusStyle = (status) => {
    const styles = {
      'Chưa duyệt': 'bg-yellow-100 text-yellow-800',
      'Đã duyệt': 'bg-green-100 text-green-800',
      'Từ chối': 'bg-red-100 text-red-800'
    };
    return styles[status] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return <div className="text-center p-8">Đang tải...</div>;
  }

  return (
    <>
      <ThanhdhDN />
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">
            Công việc đã ứng tuyển
          </h1>

          <div className="bg-white shadow-sm rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tên công việc
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Công ty
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tên hồ sơ
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ngày nộp
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Trạng thái
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Thao tác
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {jobs.map((job) => (
                    <tr key={`${job.MaHoSo}-${job.MaTinTuyenDung}`}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {job.TieuDe}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{job.CongTy}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{job.TenHoSo}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {new Date(job.NgayNop).toLocaleDateString('vi-VN')}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusStyle(job.TrangThai)}`}>
                          {job.TrangThai}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                        <button
                            onClick={() => router.push({
                            pathname: '/nhatuyendung/thongtinvieclam',
                            query: { id: job.MaTinTuyenDung }
                            })}
                            className="text-teal-600 hover:text-teal-900"
                        >
                            Xem tin
                        </button>
                        <button
                            onClick={() => router.push({
                            pathname: '/ungvien/chitiethosoungvien',
                            query: { id: job.MaHoSo }
                            })}
                            className="text-blue-600 hover:text-blue-900"
                        >
                            Xem hồ sơ
                        </button>
                        <button
                          onClick={() => router.push(`/ungvien/theodoi/${job.MaTinTuyenDung}`)}
                          className="text-indigo-600 hover:text-indigo-900"
                        >
                          Theo dõi ứng tuyển
                        </button>
                        {job.TrangThai === 'Chưa duyệt' && (
                          <button
                            onClick={() => handleDelete(job)}
                            className="text-red-600 hover:text-red-900"
                          >
                            Hủy
                          </button>
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

      <XacNhanModal
        isOpen={showXacNhanModal}
        onClose={() => setShowXacNhanModal(false)}
        onConfirm={handleConfirmDelete}
        title="Xác nhận hủy ứng tuyển"
        message="Bạn có chắc chắn muốn hủy yêu cầu ứng tuyển này?"
      />

      <ChanTrang />
    </>
  );
}