import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import axios from "axios";
import { useRouter } from "next/router";    
import { PencilIcon, TrashIcon, PlusIcon } from '@heroicons/react/24/outline';
import { useToast } from "@/context/ToastContext";
import XacNhanModal from "@/components/xacnhanmodal";
import ThanhdhDN from "@/components/thanhdieuhuong/thanhdhDN";
import ChanTrang from "@/components/chantrang";

// Constants
const STATUS_COLORS = {
  "Đã duyệt": "text-green-600 bg-green-100",
  "Bị từ chối": "text-red-600 bg-red-100",
  "Chờ duyệt": "text-yellow-600 bg-yellow-100",
  "Chưa duyệt": "text-gray-600 bg-gray-100"
};

export default function TrangHoSoUngVien() {
  // Hooks
  const { data: session } = useSession();
  const router = useRouter();
  const { showToast } = useToast();

  // States
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProfile, setSelectedProfile] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [profileToDelete, setProfileToDelete] = useState(null);

  // Effects
  useEffect(() => {
    if (!session) {
      router.push('/dangnhap_ky/dangnhap');
      return;
    }
    loadProfiles();
  }, [session]);

  // Data fetching
  const loadProfiles = async () => {
    try {
      const response = await axios.get('/api/ungvien/ds/dshoso');
      if (response.data.success) {
        setProfiles(response.data.data);
      } else {
        showToast('Không thể tải danh sách hồ sơ', { type: 'error' });
      }
    } catch (error) {
      console.error('Load profiles error:', error);
      showToast(error.response?.data?.message || 'Có lỗi xảy ra', { type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  // Event Handlers
  const handleCreate = () => {
    router.push("/ungvien/taohosoungvien");
  };

  const handleEdit = async (e, profileId) => {
    e.stopPropagation();
    try {
      const response = await axios.get(`/api/ungvien/${profileId}`);
      if (response.data.success) {
        router.push({
          pathname: '/ungvien/taohosoungvien',
          query: { id: profileId }
        });
      }
    } catch (error) {
      console.error('Edit error:', error);
      showToast('Không thể chỉnh sửa hồ sơ', { type: 'error' });
    }
  };

  const handleDelete = (e, profileId) => {
    e.stopPropagation();
    setProfileToDelete(profileId);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    try {
      const response = await axios.delete(`/api/ungvien/${profileToDelete}`);
      if (response.data.success) {
        showToast('Xóa hồ sơ thành công', { type: 'success' });
        await loadProfiles();
        setSelectedProfile(null);
      }
    } catch (error) {
      console.error('Delete error:', error);
      showToast(error.response?.data?.message || 'Không thể xóa hồ sơ', { type: 'error' });
    } finally {
      setShowDeleteModal(false);
      setProfileToDelete(null);
    }
  };

  const handleViewDetail = (e, profileId) => {
    e.stopPropagation();
    router.push(`/ungvien/hosoungvien/${profileId}`);
  };

  const handleRowClick = (profileId) => {
    setSelectedProfile(currentSelected => 
      currentSelected === profileId ? null : profileId
    );
  };

  // Render loading state
  if (loading) {
    return (
      <>
        <ThanhdhDN />
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-xl text-gray-600">Đang tải...</div>
        </div>
        <ChanTrang />
      </>
    );
  }

  // Main render
  return (
    <>
      <ThanhdhDN />
      <div className="min-h-screen bg-gray-50 py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow">
            {/* Header */}
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    Hồ sơ ứng tuyển của tôi
                  </h1>
                  <p className="mt-1 text-sm text-gray-500">
                    {profiles.length} hồ sơ
                  </p>
                </div>
                <div className="flex gap-4">
                  {selectedProfile ? (
                    <>
                      <button
                        onClick={(e) => handleEdit(e, selectedProfile)}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg
                          flex items-center gap-2 transition-colors"
                      >
                        <PencilIcon className="w-5 h-5" />
                        Chỉnh sửa
                      </button>
                      <button
                        onClick={(e) => handleDelete(e, selectedProfile)}
                        className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg
                          flex items-center gap-2 transition-colors"
                      >
                        <TrashIcon className="w-5 h-5" />
                        Xóa
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={handleCreate}
                      className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg
                        flex items-center gap-2 transition-colors"
                    >
                      <PlusIcon className="w-5 h-5" />
                      Thêm hồ sơ mới
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tên hồ sơ
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ngày tạo
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
                  {profiles.length > 0 ? (
                    profiles.map((profile) => (
                      <tr 
                        key={profile.MaHoSo}
                        onClick={() => handleRowClick(profile.MaHoSo)}
                        className={`cursor-pointer hover:bg-gray-50 ${
                          selectedProfile === profile.MaHoSo ? 'bg-blue-50' : ''
                        }`}
                      >
                        <td className="px-6 py-4">
                          <div className="text-sm font-medium text-gray-900">
                            {profile.TenHoSo}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-500">
                            {new Date(profile.NgayTao).toLocaleDateString('vi-VN')}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                            ${STATUS_COLORS[profile.TrangThai] || STATUS_COLORS['Chưa duyệt']}`}>
                            {profile.TrangThai || 'Chưa duyệt'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right text-sm font-medium">
                          <button
                            onClick={(e) => handleViewDetail(e, profile.MaHoSo)}
                            className="text-teal-600 hover:text-teal-900"
                          >
                            Xem chi tiết
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="4" className="px-6 py-4 text-center text-gray-500">
                        Bạn chưa có hồ sơ nào. Hãy tạo hồ sơ mới để bắt đầu ứng tuyển!
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <XacNhanModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setProfileToDelete(null);
        }}
        onConfirm={handleConfirmDelete}
        title="Xác nhận xóa hồ sơ"
        message="Bạn có chắc muốn xóa hồ sơ này không? Hành động này không thể hoàn tác."
      />

      <ChanTrang />
    </>
  );
}