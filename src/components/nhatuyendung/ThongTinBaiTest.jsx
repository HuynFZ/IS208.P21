
import { useState, useEffect } from 'react';
import axios from 'axios';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';

export default function ThongTinBaiTest({ maBaiTest }) {
  const [baiTest, setBaiTest] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadBaiTest = async () => {
      try {
        const res = await axios.get(`/api/nhatuyendung/baitest/${maBaiTest}`);
        if (res.data.success) {
          setBaiTest(res.data.data);
        }
      } catch (error) {
        console.error('Lỗi khi tải thông tin bài test:', error);
      } finally {
        setLoading(false);
      }
    };

    if (maBaiTest) {
      loadBaiTest();
    }
  }, [maBaiTest]);

  if (loading) return <div>Đang tải...</div>;
  if (!baiTest) return <div>Không tìm thấy thông tin bài test</div>;

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h2 className="text-2xl text-black font-bold mb-4">{baiTest.TieuDe}</h2>
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-gray-500">Link bài test</h3>
              <a 
                href={baiTest.LinkTest}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-1 text-teal-600 hover:text-teal-800"
              >
                {baiTest.LinkTest}
              </a>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Tin tuyển dụng</h3>
              <p className=" text-black mt-1">{baiTest.TenTinTuyenDung}</p>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-medium text-gray-500">Thời gian bắt đầu</h3>
            <p className="text-black mt-1">
              {format(new Date(baiTest.ThoiGianBatDau), 'HH:mm - dd/MM/yyyy', {locale: vi})}
            </p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500">Thời gian kết thúc</h3>
            <p className="text-black mt-1">
              {format(new Date(baiTest.ThoiGianKetThuc), 'HH:mm - dd/MM/yyyy', {locale: vi})}
            </p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500">Số lượt làm</h3>
            <p className="text-black mt-1">{baiTest.SoLuotLam || 0} lượt</p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500">Điểm trung bình</h3>
            <p className="text-black mt-1">{baiTest.DiemTrungBinh?.toFixed(1) || 'Chưa có'}</p>
          </div>
        </div>
      </div>

      <div className="mt-6">
        <h3 className="text-sm font-medium text-gray-500">Mô tả</h3>
        <p className="text-black mt-1 whitespace-pre-wrap">{baiTest.MoTa}</p>
      </div>
    </div>
  );
}