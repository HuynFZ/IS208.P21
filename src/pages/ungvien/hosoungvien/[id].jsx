import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
import axios from 'axios';
import ThanhdhDN from '@/components/thanhdieuhuong/ThanhdhDN';
import ChanTrang from '@/components/chantrang';
import { useToast } from '@/context/ToastContext';
import XacNhanModal from '@/components/xacnhanmodal';

// Styles cho trạng thái
const STATUS_STYLES = {
  'Đã duyệt': 'bg-green-100 text-green-800',
  'Chưa duyệt': 'bg-yellow-100 text-yellow-800',
  'Từ chối': 'bg-red-100 text-red-800',
  'Hết hạn': 'bg-red-100 text-red-800'
};

// Component nhập lý do từ chối
const NhapLyDoModal = ({ isOpen, onClose, onConfirm }) => {
  const [lyDo, setLyDo] = useState('');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-white bg-opacity-50 z-50 flex items-center justify-center">
      <div className="bg-white rounded-lg p-6 w-96">
        <h3 className="text-xl font-semibold text-black mb-4">Lý do từ chối</h3>
        <textarea
          value={lyDo}
          onChange={(e) => setLyDo(e.target.value)}
          className="bg-white w-full h-32 p-2 border rounded focus:ring-2 focus:ring-teal-500 text-black"
          placeholder="Nhập lý do từ chối..."
          required
        />
        <div className="flex justify-end space-x-2 mt-4">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-red-400 text-white rounded hover:bg-gray-200"
          >
            Hủy
          </button>
          <button
            onClick={() => onConfirm(lyDo)}
            disabled={!lyDo.trim()}
            className={`px-4 py-2 rounded ${
              lyDo.trim() 
                ? 'bg-teal-500 text-white border border-gray-300 hover:bg-gray-50' 
                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
            }`}
          >
            Xác nhận
          </button>
        </div>
      </div>
    </div>
  );
};

// Component hiển thị một trường thông tin
const InfoItem = ({ label, value, fullWidth = false }) => (
  <div className={fullWidth ? "col-span-2" : ""}>
    <p className="text-sm text-gray-700">{label}</p>
    <p className="mt-1 font-medium text-black">{value || "Chưa cập nhật"}</p>
  </div>
);

// Component hiển thị file đính kèm
const FileItem = ({ type, title, required, color, maHoSo }) => {
  const handleViewFile = async () => {
    try {
      const response = await axios({
        url: `/api/ungvien/${maHoSo}/xemfile`,
        method: 'GET',
        params: { type },
        responseType: 'blob'
      });

      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      window.open(url, '_blank', 'noopener,noreferrer');
      setTimeout(() => window.URL.revokeObjectURL(url), 100);
    } catch (error) {
      console.error('Lỗi khi tải file:', error);
      alert('Không thể tải file. Vui lòng thử lại sau.');
    }
  };

  return (
    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
      <div className="flex items-center space-x-4">
        <div className={`p-2 bg-${color}-100 rounded`}>
          <svg className={`w-6 h-6 text-${color}-600`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <div>
          <p className="text-sm font-medium text-black">{title}</p>
          <p className="text-sm text-gray-700">{required ? 'Bắt buộc' : 'Tùy chọn'}</p>
        </div>
      </div>
    </div>
  );
};

// Component chính
export default function ChiTietHoSoUngVien() {
  const router = useRouter();
  const { id } = router.query;
  const { data: session } = useSession();
  const toast = useToast();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [hoso, setHoSo] = useState(null);
  const [error, setError] = useState(null);
  const [showLyDoModal, setShowLyDoModal] = useState(false);
  const [showXacNhanModal, setShowXacNhanModal] = useState(false);
  const [modalConfig, setModalConfig] = useState({});

  // Kiểm tra session và fetch dữ liệu
  useEffect(() => {
    console.log('Role:', session?.user?.role);
    console.log('MaHoSo:', id);

    if (!session) {
      router.push('/auth/signin');
      return;
    }

    if (!id) return;

    const fetchHoSo = async () => {
      try {
        const res = await axios.get(`/api/ungvien/${id}`);
        if (res.data.success) {
          setHoSo(res.data.data);
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Có lỗi xảy ra');
      } finally {
        setLoading(false);
      }
    };

    fetchHoSo();
  }, [id, session, router]);

  // Handlers cho các action
  const handleDuyet = () => {
    setModalConfig({
      title: 'Xác nhận duyệt hồ sơ',
      message: 'Bạn có chắc chắn muốn duyệt hồ sơ này?',
      action: 'approve'
    });
    setShowXacNhanModal(true);
  };

  const handleTuChoi = () => {
    setShowLyDoModal(true);
  };

  const handleXacNhanTuChoi = (lyDo) => {
    setShowLyDoModal(false);
    setModalConfig({
      title: 'Xác nhận từ chối hồ sơ',
      message: 'Bạn có chắc chắn muốn từ chối hồ sơ này?',
      action: 'reject',
      lyDo
    });
    setShowXacNhanModal(true);
  };

    const handleXacNhan = async () => {
    try {
      const res = await axios.post('/api/nhanvienHS/duyeths', {
        maHoSos: [hoso.MaHoSo],
        action: modalConfig.action,
        ...(modalConfig.action === 'reject' && { lyDo: modalConfig.lyDo })
      });

      if (res.data.success) {
        showToast(
          modalConfig.action === 'approve' 
            ? 'Duyệt hồ sơ thành công!' 
            : 'Từ chối hồ sơ thành công!',
          { type: 'success' }
        );
        router.back();
      }
    } catch (error) {
      showToast('Có lỗi xảy ra. Vui lòng thử lại sau.', { type: 'error' });
    } finally {
      setShowXacNhanModal(false);
    }
  };

  // Loading state
  if (loading) return <div className="text-center p-8">Đang tải...</div>;
  if (error) return <div className="text-red-600 text-center p-8">{error}</div>;
  if (!hoso) return <div className="text-center p-8">Không tìm thấy hồ sơ</div>;

  return (
    <>
      <ThanhdhDN />
      <div className="min-h-screen bg-gray-50 py-10">
        <div className="max-w-4xl mx-auto px-4">
          {/* Header với buttons */}
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-black">Chi tiết hồ sơ</h1>
            <div className="flex space-x-4">
              <button
                onClick={() => router.back()}
                className="px-4 py-2 bg-gray-100 text-black rounded hover:bg-gray-200"
              >
                Quay lại
              </button>
              
              {/* Chỉ hiển thị nút duyệt/từ chối cho QLHS và hồ sơ chưa duyệt */}
              {session?.user?.role === 'qlhoso' && hoso.TrangThai === 'Chưa duyệt' && (
                <>
                  <button
                    onClick={handleTuChoi}
                    className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                  >
                    Từ chối
                  </button>
                  <button
                    onClick={handleDuyet}
                    className="px-4 py-2 bg-teal-600 text-white rounded hover:bg-teal-700"
                  >
                    Duyệt hồ sơ
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Content */}
          <div className="space-y-6">
            {/* Thông tin ứng viên */}
            <div className="bg-white shadow rounded-lg">
              <div className="px-6 py-4 border-b">
                <h2 className="text-xl font-semibold text-black">Thông tin ứng viên</h2>
              </div>
              <div className="p-6 grid grid-cols-2 gap-6">
                <InfoItem label="Họ và tên" value={hoso.TenUngVien} />
                <InfoItem label="Email" value={hoso.Email} />
                <InfoItem label="Số điện thoại" value={hoso.SDT} />
                <InfoItem 
                  label="Ngày sinh" 
                  value={hoso.NgaySinh ? new Date(hoso.NgaySinh).toLocaleDateString('vi-VN') : null} 
                />
                <InfoItem label="Địa chỉ" value={hoso.DiaChi} fullWidth />
              </div>
            </div>

            {/* Thông tin hồ sơ */}
            <div className="bg-white shadow rounded-lg">
              <div className="px-6 py-4 border-b">
                <h2 className="text-xl font-semibold text-black">Thông tin hồ sơ</h2>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-2 gap-6 mb-6">
                  <InfoItem label="Tên hồ sơ" value={hoso.TenHoSo} />
                  <InfoItem 
                    label="Ngày tạo" 
                    value={new Date(hoso.NgayTao).toLocaleDateString('vi-VN')} 
                  />
                  <div>
                    <p className="text-sm text-gray-700">Trạng thái</p>
                    <span className={`inline-block mt-1 px-2 py-1 text-xs font-semibold rounded-full ${
                      STATUS_STYLES[hoso.TrangThai] || STATUS_STYLES['Chưa duyệt']
                    }`}>
                      {hoso.TrangThai || 'Chưa duyệt'}
                    </span>
                  </div>
                  {hoso.NgayDuyet && (
                    <InfoItem 
                      label="Ngày duyệt" 
                      value={new Date(hoso.NgayDuyet).toLocaleDateString('vi-VN')} 
                    />
                  )}
                  {hoso.NguoiDuyet && (
                    <InfoItem label="Người duyệt" value={hoso.NguoiDuyet} />
                  )}
                  {hoso.LyDo && (
                    <InfoItem label="Lý do từ chối" value={hoso.LyDo} fullWidth />
                  )}
                </div>

                {/* Tài liệu đính kèm */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-black">Tài liệu đính kèm</h3>
                  <FileItem 
                    type="cv"
                    title="CV"
                    required={true}
                    color="teal"
                    maHoSo={hoso.MaHoSo}
                  />
                  <FileItem 
                    type="letter"
                    title="Thư giới thiệu"
                    required={false}
                    color="blue"
                    maHoSo={hoso.MaHoSo}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <NhapLyDoModal
        isOpen={showLyDoModal}
        onClose={() => setShowLyDoModal(false)}
        onConfirm={handleXacNhanTuChoi}
      />

      <XacNhanModal
        isOpen={showXacNhanModal}
        onClose={() => setShowXacNhanModal(false)}
        onConfirm={handleXacNhan}
        title={modalConfig.title}
        message={modalConfig.message}
      />

      <ChanTrang />
    </>
  );
}