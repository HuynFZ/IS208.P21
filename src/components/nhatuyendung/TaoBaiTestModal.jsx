import { useState, useEffect } from 'react';
import axios from 'axios';
import { useToast } from '@/context/ToastContext';
import Image from 'next/image';

export default function TaoBaiTestModal({ isOpen, onClose, onSuccess,isUpdate,initialData, 
  maBaiTest,
  disabledFields = []  }) {

  const { showToast } = useToast();
  const [form, setForm] = useState({
    tieuDe: '',
    maTinTuyenDung: '',
    moTa: '',
    linkTest: '',
    thoiGianBatDau: '',
    thoiGianKetThuc: '',
    hanXacNhan: ''
  });
  const [tinTuyenDungs, setTinTuyenDungs] = useState([]);
  const [loading, setLoading] = useState(false);

  // Reset form when modal closes
 useEffect(() => {
  if (isOpen && initialData && isUpdate) {
    setForm({
      tieuDe: initialData.tieuDe || '',
      maTinTuyenDung: initialData.maTinTuyenDung || '',
      moTa: initialData.moTa || '',
      linkTest: initialData.linkTest || '',
      thoiGianBatDau: initialData.thoiGianBatDau || '',
      thoiGianKetThuc: initialData.thoiGianKetThuc || '',
      hanXacNhan: initialData.hanXacNhan || '',
    });
  }
}, [isOpen, initialData, isUpdate]);

  // Load tin tuyển dụng when modal opens
  useEffect(() => {
    if (isOpen) {
      loadTinTuyenDungs();
    }
  }, [isOpen]);

  const loadTinTuyenDungs = async () => {
    try {
      const res = await axios.get('/api/nhatuyendung/list');
      if (res.data.success) {
        setTinTuyenDungs(res.data.data);
      }
    } catch (error) {
      showToast(error.response?.data?.message || 'Có lỗi xảy ra', { type: 'error' });
    }
  };

   const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const url = isUpdate 
        ? `/api/nhatuyendung/baitest/${initialData.MaBaiTest}`
        : '/api/nhatuyendung/baitest/taobaitest';
      
      const method = isUpdate ? 'PUT' : 'POST';
      const res = await axios[method.toLowerCase()](url, form);

      if (res.data.success) {
        showToast(`${isUpdate ? 'Cập nhật' : 'Tạo'} bài test thành công`, { type: 'success' });
        onSuccess();
        onClose();
      }
    } catch (error) {
      showToast(error.response?.data?.message || 'Có lỗi xảy ra', { type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div className="bg-white rounded-lg p-6 w-[500px] max-h-[80vh] overflow-y-auto">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          {isUpdate ? 'Cập nhật bài test' : 'Tạo bài test mới'}
        </h3>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Tiêu đề
              </label>
              <input
                type="text"
                value={form.tieuDe}
                onChange={(e) => setForm({ ...form, tieuDe: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm 
                  focus:border-teal-500 focus:ring-teal-500"
                disabled={disabledFields?.includes('tieuDe')}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Tin tuyển dụng
              </label>
              <select
                value={form.maTinTuyenDung}
                onChange={(e) => setForm({ ...form, maTinTuyenDung: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm 
                  focus:border-teal-500 focus:ring-teal-500 bg-white text-gray-900"
                required
              >
                <option value="">Chọn tin tuyển dụng</option>
                {tinTuyenDungs.map((tin) => (
                  <option key={tin.MaTinTuyenDung} value={tin.MaTinTuyenDung}>
                    {tin.TieuDe}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Link bài test
              </label>
              <input
                type="url"
                value={form.linkTest}
                onChange={(e) => setForm({ ...form, linkTest: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm 
                  focus:border-teal-500 focus:ring-teal-500 bg-white text-gray-900"
                placeholder="https://example.com/test"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Thời gian bắt đầu
              </label>
              <div className="relative">
                <input
                  id="thoiGianBatDau"
                  type="datetime-local"
                  value={form.thoiGianBatDau}
                  onChange={(e) => setForm({ ...form, thoiGianBatDau: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm 
                    focus:border-teal-500 focus:ring-teal-500 bg-white text-gray-900"
                  required
                />
                <button
                  type="button"
                  className="absolute right-2 top-1/2 -translate-y-1/2"
                  onClick={() => document.getElementById('thoiGianBatDau').showPicker()}
                >
                  <Image src="/icons/calendar.jpg" alt="calendar" width={20} height={20} />
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Thời gian kết thúc
              </label>
              <div className="relative">
                <input
                  id="thoiGianKetThuc"
                  type="datetime-local"
                  value={form.thoiGianKetThuc}
                  onChange={(e) => setForm({ ...form, thoiGianKetThuc: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm 
                    focus:border-teal-500 focus:ring-teal-500 bg-white text-gray-900"
                  required
                />
                <button
                  type="button"
                  className="absolute right-2 top-1/2 -translate-y-1/2"
                  onClick={() => document.getElementById('thoiGianKetThuc').showPicker()}
                >
                  <Image src="/icons/calendar.jpg" alt="calendar" width={20} height={20} />
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Hạn xác nhận
              </label>
              <div className="relative">
                <input
                  id="hanXacNhan"
                  type="datetime-local"
                  value={form.hanXacNhan}
                  onChange={(e) => setForm({ ...form, hanXacNhan: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm 
                    focus:border-teal-500 focus:ring-teal-500 bg-white text-gray-900"
                  required
                />
                <button
                  type="button"
                  className="absolute right-2 top-1/2 -translate-y-1/2"
                  onClick={() => document.getElementById('hanXacNhan').showPicker()}
                >
                  <Image src="/icons/calendar.jpg" alt="calendar" width={20} height={20} />
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Mô tả
              </label>
              <textarea
                value={form.moTa}
                onChange={(e) => setForm({ ...form, moTa: e.target.value })}
                rows={4}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm 
                  focus:border-teal-500 focus:ring-teal-500 bg-white text-gray-900"
                placeholder="Mô tả nội dung bài test..."
              />
            </div>
          </div>

          <div className="mt-6 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 
                rounded-md hover:bg-gray-50"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-white bg-teal-600 border border-transparent 
                rounded-md hover:bg-teal-700"
            >
              {loading ? 'Đang xử lý...' : 'Tạo bài test'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}