import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { useToast } from '@/context/ToastContext';
import ThanhdhDN from '@/components/thanhdieuhuong/thanhdhDN';

// Modal Components
const SelectionModal = ({ isOpen, onClose, title, items, onSelect, type }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div className="bg-white rounded-lg p-6 w-[600px] max-w-lg mx-4">
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
            <span className="sr-only">Đóng</span>
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="max-h-96 overflow-y-auto">
          {items.length === 0 ? (
            <p className="text-center text-gray-500 py-4">
              {type === 'test' ? 'Không có bài test nào' : 'Không có lịch phỏng vấn nào'}
            </p>
          ) : (
            <div className="space-y-4">
              {items.map((item) => (
                <div 
                  key={type === 'test' ? item.MaBaiTest : item.MaLichPhongVan}
                  className="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer"
                  onClick={() => onSelect(item)}
                >
                  <h4 className="font-medium text-gray-900">{item.TieuDe}</h4>
                  <p className="text-sm text-gray-500 mt-1">{item.MoTa}</p>
                  <div className="mt-2 text-sm text-gray-500">
                    <p>Thời gian bắt đầu: {format(new Date(item.ThoiGianBatDau), 'dd/MM/yyyy HH:mm', { locale: vi })}</p>
                    <p>Thời gian kết thúc: {format(new Date(item.ThoiGianKetThuc), 'dd/MM/yyyy HH:mm', { locale: vi })}</p>
                    {type === 'interview' && (
                      <p>Hình thức: {item.HinhThuc}</p>
                    )}
                  </div>
                </div>
              ))}
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

const RejectModal = ({ isOpen, onClose, onConfirm, lyDo, setLyDo }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div className="bg-white rounded-lg p-6 w-[500px] max-w-lg mx-4">
        <div className="flex justify-between items-start">
          <h3 className="text-lg font-semibold text-gray-900">Từ chối hồ sơ</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
            <span className="sr-only">Đóng</span>
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700">
            Lý do từ chối
          </label>
          <textarea
            value={lyDo}
            onChange={(e) => setLyDo(e.target.value)}
            rows={4}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm 
              focus:border-teal-500 focus:ring-teal-500"
            placeholder="Nhập lý do từ chối..."
            required
          />
        </div>

        <div className="mt-6 flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border 
              border-gray-300 rounded-md hover:bg-gray-50"
          >
            Hủy
          </button>
          <button
            onClick={() => onConfirm(lyDo)}
            disabled={!lyDo.trim()}
            className="px-4 py-2 text-sm font-medium text-white bg-red-600 border 
              border-transparent rounded-md hover:bg-red-700 disabled:opacity-50 
              disabled:cursor-not-allowed"
          >
            Xác nhận từ chối
          </button>
        </div>
      </div>
    </div>
  );
};

const EvaluationModal = ({ isOpen, onClose, onConfirm, evalForm, setEvalForm, candidateName }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div className="bg-white rounded-lg p-6 w-[500px] max-w-lg mx-4">
        <div className="flex justify-between items-start">
          <h3 className="text-lg font-semibold text-gray-900">
            Đánh giá ứng viên: {candidateName}
          </h3>
           <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
            <span className="sr-only">Đóng</span>
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="mt-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Trạng thái đánh giá
            </label>
            <select
              value={evalForm.trangThaiDanhGia}
              onChange={(e) => setEvalForm(prev => ({
                ...prev,
                trangThaiDanhGia: e.target.value
              }))}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500"
            >
              <option value="Đang xem xét">Đang xem xét</option>
              <option value="Đạt">Đạt</option>
              <option value="Không đạt">Không đạt</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nội dung đánh giá
            </label>
            <textarea
              value={evalForm.noiDung}
              onChange={(e) => setEvalForm(prev => ({
                ...prev,
                noiDung: e.target.value
              }))}
              rows={4}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500"
              placeholder="Nhập nhận xét đánh giá về ứng viên..."
            />
          </div>
        </div>

        <div className="mt-6 flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
          >
            Hủy
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 text-sm font-medium text-white bg-teal-600 rounded-md hover:bg-teal-700"
          >
            Xác nhận
          </button>
        </div>
      </div>
    </div>
  );
};

// Main Component
export default function DanhSachHoSoDaNop() {
  const router = useRouter();
  const { showToast } = useToast();
  const { id } = router.query;

  // States
  const [loading, setLoading] = useState(true);
  const [hoSos, setHoSos] = useState([]);
  const [selectedHoSo, setSelectedHoSo] = useState(null);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showTestModal, setShowTestModal] = useState(false);
  const [showInterviewModal, setShowInterviewModal] = useState(false);
  const [lyDoTuChoi, setLyDoTuChoi] = useState('');
  const [availableTests, setAvailableTests] = useState([]);
  const [availableInterviews, setAvailableInterviews] = useState([]);
  const [showEvalModal, setShowEvalModal] = useState(false);
  const [evalForm, setEvalForm] = useState({
    noiDung: '',
    trangThaiDanhGia: 'Đang xem xét'
  });
  // Effects
  useEffect(() => {
    if (id) {
      fetchHoSos();
    }
  }, [id]);

  // API Calls
  const fetchHoSos = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`/api/nhatuyendung/${id}/hosodanop`);
      if (res.data.success) {
        setHoSos(res.data.data);
      }
    } catch (error) {
      showToast(error.response?.data?.message || 'Có lỗi xảy ra', { type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableTests = async () => {
    try {
      const res = await axios.get(`/api/nhatuyendung/baitest/available/${id}`);
      if (res.data.success) {
        setAvailableTests(res.data.data);
      }
    } catch (error) {
      showToast(error.response?.data?.message || 'Có lỗi xảy ra', { type: 'error' });
    }
  };

  const fetchAvailableInterviews = async () => {
    try {
      const res = await axios.get(`/api/nhatuyendung/phongvan/available/${id}`);
      if (res.data.success) {
        setAvailableInterviews(res.data.data);
      }
    } catch (error) {
      showToast(error.response?.data?.message || 'Có lỗi xảy ra', { type: 'error' });
    }
  };

  // Event Handlers
  const handleShowEvalModal = (hoSo) => {
    setSelectedHoSo(hoSo);
    // Điền dữ liệu đánh giá cũ nếu có
    setEvalForm({
      noiDung: hoSo.NoiDungDanhGia || '',
      trangThaiDanhGia: hoSo.TrangThaiDanhGia || 'Đang xem xét'
    });
    setShowEvalModal(true);
  };

  const handleEvaluate = async () => {
    if (!selectedHoSo) return;
    try {
      // Dựa trên schema, API cần MaHoSo và MaTinTuyenDung
      const response = await axios.post('/api/nhatuyendung/danhgia', {
        maHoSo: selectedHoSo.MaHoSo,
        maTinTuyenDung: id, // `id` từ router.query là mã tin tuyển dụng
        noiDung: evalForm.noiDung,
        trangThaiDanhGia: evalForm.trangThaiDanhGia
      });

      if (response.data.success) {
        showToast('Đánh giá ứng viên thành công', { type: 'success' });
        setShowEvalModal(false);
        setSelectedHoSo(null);
        setEvalForm({ noiDung: '', trangThaiDanhGia: 'Đang xem xét' }); // Reset form
        fetchHoSos(); // Tải lại danh sách để cập nhật trạng thái
      }
    } catch (error) {
      console.error('Evaluation error:', error);
      showToast(error.response?.data?.message || 'Có lỗi khi đánh giá ứng viên', { type: 'error' });
    }
  };

  const handleAction = async (maHoSo, action) => {
    try {
      if (action === 'reject' && !lyDoTuChoi.trim()) {
        showToast('Vui lòng nhập lý do từ chối', { type: 'error' });
        return;
      }

      const res = await axios.put(`/api/nhatuyendung/${id}/hosodanop`, {
        maHoSo,
        action,
        lyDo: lyDoTuChoi
      });

      if (res.data.success) {
        showToast(
          action === 'approve' ? 'Duyệt hồ sơ thành công' : 'Từ chối hồ sơ thành công', 
          { type: 'success' }
        );
        setShowRejectModal(false);
        setSelectedHoSo(null);
        setLyDoTuChoi('');
        fetchHoSos();
      }
    } catch (error) {
      showToast(error.response?.data?.message || 'Có lỗi xảy ra', { type: 'error' });
    }
  };

  const handleShowTestModal = async (hoSo) => {
    setSelectedHoSo(hoSo);
    await fetchAvailableTests();
    setShowTestModal(true);
  };

  const handleShowInterviewModal = async (hoSo) => {
    setSelectedHoSo(hoSo);
    await fetchAvailableInterviews();
    setShowInterviewModal(true);
  };

  const handleSelectTest = async (test) => {
    try {
      const res = await axios.post('/api/nhatuyendung/baitest/assign', {
        maBaiTest: test.MaBaiTest,
        maUngVien: selectedHoSo.MaUngVien,
        maTinTuyenDung: id
      });

      if (res.data.success) {
        showToast('Đã gửi bài test thành công', { type: 'success' });
        setShowTestModal(false);
        fetchHoSos();
      }
    } catch (error) {
      showToast(error.response?.data?.message || 'Có lỗi xảy ra', { type: 'error' });
    }
  };

  const handleSelectInterview = async (interview) => {
    try {
      const res = await axios.post('/api/nhatuyendung/phongvan/assign', {
        maLichPhongVan: interview.MaLichPhongVan,
        maUngVien: selectedHoSo.MaUngVien,
        maTinTuyenDung: id
      });

      if (res.data.success) {
        showToast('Đã gửi lời mời phỏng vấn thành công', { type: 'success' });
        setShowInterviewModal(false);
        fetchHoSos();
      }
    } catch (error) {
      showToast(error.response?.data?.message || 'Có lỗi xảy ra', { type: 'error' });
    }
  };

  // Loading State
  if (loading) {
    return (
      <>
      <ThanhdhDN userType="nhatuyendung" />
      <div className ="min-h-screen bg-white mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
        </div>
      </div>
      </>
    );
  }

  // Render
  return (
    <>
    <ThanhdhDN />
    <div className="min-h-screen bg-white mx-auto px-4 sm:px-6 lg:px-8 py-8">
      
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow-sm rounded-lg overflow-hidden">
          <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Danh sách hồ sơ đã nộp
            </h3>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ứng viên
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Hồ sơ
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ngày nộp
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
                {hoSos.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-4 text-center text-sm text-gray-500">
                      Chưa có hồ sơ nào được nộp
                    </td>
                  </tr>
                ) : (
                  hoSos.map((hoSo) => (
                    <tr key={hoSo.MaHoSo} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {hoSo.TenUngVien}
                        </div>
                        <div className="text-sm text-gray-500">
                          {hoSo.Email}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{hoSo.TenHoSo}</div>
                        <button
                          onClick={() => router.push(`/ungvien/hosoungvien/${hoSo.MaHoSo}`)}
                          className="text-sm text-blue-600 hover:text-blue-900"
                        >
                          Xem hồ sơ
                        </button>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {format(new Date(hoSo.NgayNop), 'dd/MM/yyyy HH:mm', { locale: vi })}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full
                          ${hoSo.TrangThai === 'Đã duyệt' ? 'bg-green-100 text-green-800' :
                            hoSo.TrangThai === 'Từ chối' ? 'bg-red-100 text-red-800' :
                              'bg-yellow-100 text-yellow-800'}`}
                        >
                          {hoSo.TrangThai}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                        {hoSo.TrangThai === 'Chưa duyệt' && (
                          <>
                            <button
                              onClick={() => handleAction(hoSo.MaHoSo, 'approve')}
                              className="text-green-600 hover:text-green-900"
                            >
                              Duyệt
                            </button>
                            <button
                              onClick={() => {
                                setSelectedHoSo(hoSo);
                                setShowRejectModal(true);
                              }}
                              className="text-red-600 hover:text-red-900"
                            >
                              Từ chối
                            </button>
                          </>
                        )}
                        {hoSo.TrangThai != 'Chưa duyệt' && hoSo.TrangThai != 'Từ chối'  && (
                          <>
                            {!hoSo.DaGuiTest && (
                              <button
                                onClick={() => handleShowTestModal(hoSo)}
                                className="text-blue-600 hover:text-blue-900"
                              >
                                Gửi bài test
                              </button>
                            )}
                            {hoSo.DaGuiPV && (
                              <button
                                onClick={() => handleShowInterviewModal(hoSo)}
                                className="text-teal-600 hover:text-teal-900"
                              >
                                Mời phỏng vấn                        
                              </button>
                              )}    
                              {!hoSo.DaDanhGia  && (
                              <button
                                onClick={() => handleShowEvalModal(hoSo)}
                                className="text-purple-600 hover:text-purple-900"
                              >
                                Đánh giá
                              </button>
                              )}
                          </>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modals */}
      <RejectModal
        isOpen={showRejectModal}
        onClose={() => {
          setShowRejectModal(false);
          setSelectedHoSo(null);
          setLyDoTuChoi('');
        }}
        onConfirm={(lyDo) => handleAction(selectedHoSo.MaHoSo, 'reject')}
        lyDo={lyDoTuChoi}
        setLyDo={setLyDoTuChoi}
      />

      <SelectionModal
        isOpen={showTestModal}
        onClose={() => {
          setShowTestModal(false);
          setSelectedHoSo(null);
        }}
        title="Chọn bài test"
        items={availableTests}
        onSelect={handleSelectTest}
        type="test"
      />

      <SelectionModal
        isOpen={showInterviewModal}
        onClose={() => {
          setShowInterviewModal(false);
          setSelectedHoSo(null);
        }}
        title="Chọn lịch phỏng vấn"
        items={availableInterviews}
        onSelect={handleSelectInterview}
        type="interview"
      />
      <EvaluationModal
          isOpen={showEvalModal}
          onClose={() => {
            setShowEvalModal(false);
            setSelectedHoSo(null);
            setEvalForm({ noiDung: '', trangThaiDanhGia: 'Đang xem xét' });
          }}
          onConfirm={handleEvaluate}
          evalForm={evalForm}
          setEvalForm={setEvalForm}
          candidateName={selectedHoSo?.TenUngVien}
        />
    </div>
    </>
  );
}