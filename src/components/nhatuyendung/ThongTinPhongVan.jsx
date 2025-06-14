// filepath: c:\Users\thanh\job-recruitment-site\src\components\nhatuyendung\ThongTinPhongVan.jsx
import { useState, useEffect } from 'react';
import axios from 'axios';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';

export default function ThongTinPhongVan({ maLichPhongVan }) {
  const [phongVan, setPhongVan] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadPhongVan = async () => {
      try {
        const res = await axios.get(`/api/nhatuyendung/phongvan/${maLichPhongVan}`);
        if (res.data.success) {
          setPhongVan(res.data.data);
        }
      } catch (error) {
        console.error('Lỗi khi tải thông tin phỏng vấn:', error);
      } finally {
        setLoading(false);
      }
    };

    if (maLichPhongVan) {
      loadPhongVan();
    }
  }, [maLichPhongVan]);

  if (loading) return <div>Đang tải...</div>;
  if (!phongVan) return <div>Không tìm thấy thông tin phỏng vấn</div>;

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h2 className="text-2xl text-gray-800 font-bold mb-4">{phongVan.TieuDe}</h2>
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-gray-800">Trạng thái</h3>
              <p className={`mt-1 px-2 py-1 rounded-full text-sm inline-flex
                ${getStatusColor(phongVan.TrangThai)}`}>
                {phongVan.TrangThai}
              </p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-800">Địa điểm</h3>
              <p className="text-black mt-1">{phongVan.DiaChi}</p>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-medium text-gray-800">Thời gian bắt đầu</h3>
            <p className="text-black mt-1">{format(new Date(phongVan.ThoiGianBatDau), 'HH:mm - dd/MM/yyyy', {locale: vi})}</p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-800">Thời gian kết thúc</h3>
            <p className="text-black mt-1">{format(new Date(phongVan.ThoiGianKetThuc), 'HH:mm - dd/MM/yyyy', {locale: vi})}</p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-800">Hạn xác nhận</h3>
            <p className="text-black mt-1">{format(new Date(phongVan.HanXacNhan), 'HH:mm - dd/MM/yyyy', {locale: vi})}</p>
          </div>
        </div>
      </div>

      <div className="mt-6">
        <h3 className="text-sm font-medium text-gray-800">Mô tả</h3>
        <p className="mt-1 text-black whitespace-pre-wrap">{phongVan.MoTa}</p>
      </div>
    </div>
  );
}

function getStatusColor(status) {
  switch (status) {
    case 'Chưa diễn ra': return 'bg-yellow-100 text-yellow-800';
    case 'Đang diễn ra': return 'bg-blue-100 text-blue-800';
    case 'Đã kết thúc': return 'bg-green-100 text-green-800';
    case 'Đã hủy': return 'bg-red-100 text-red-800';
    default: return 'bg-gray-100 text-gray-800';
  }
}