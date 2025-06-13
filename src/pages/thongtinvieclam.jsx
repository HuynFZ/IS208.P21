import { useState, useEffect } from "react";
import { useRouter } from 'next/router';
import Thanhdh0DN from "../components/thanhdieuhuong/thanhdh0DN";
import ChanTrang from "../components/chantrang";
import Head from 'next/head';

export default function ChiTietTin() {
  const router = useRouter();
  const { maTinTD } = router.query;
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let isMounted = true; // Để tránh setState khi component đã unmount

    const fetchJobDetail = async () => {
      if (!maTinTD) {
        if (isMounted) setLoading(false); // Thoát nếu không có maTinTD
        return;
      }

      try {
        const response = await fetch(`/api/nhatuyendung/${maTinTD}`, {
          headers: { 'Content-Type': 'application/json' }
        });
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || 'Không thể tải chi tiết tin');
        }

        if (isMounted) {
          setJob(data.data);
        }
      } catch (err) {
        console.error('Lỗi lấy chi tiết tin:', err);
        if (isMounted) {
          setError(err.message || 'Lỗi server khi tải chi tiết tin');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchJobDetail();

    // Cleanup
    return () => {
      isMounted = false;
    };
  }, [maTinTD]); // Thêm maTinTD vào dependency array để chạy lại khi thay đổi

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Đang tải...</p>
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-red-500">{error || 'Tin không tồn tại'}</p>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Chi tiết tin tuyển dụng</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <Thanhdh0DN userType="ungvien" />
      <div className="min-h-screen bg-gray-100">
        <main className="container mx-auto p-6">
          <h1 className="text-3xl font-bold mb-6 text-center">Chi Tiết Tin Tuyển Dụng</h1>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-semibold mb-4">{job.TieuDe}</h2>
            <p><strong>Mã Tin:</strong> {job.MaTinTD}</p>
            <p><strong>Trạng Thái:</strong> 
              {job.TrangThai === 'Đã duyệt' ? 'Đã Đăng' : 
               job.TrangThai === 'Chưa duyệt' ? 'Chờ Duyệt' : 
               job.TrangThai === 'Hết hạn' ? 'Hết Hạn' : 
               job.TrangThai === 'Đã hủy' ? 'Đã Hủy' : 'Không xác định'}
            </p>
            <p><strong>Ngày Tạo:</strong> {job.NgayTao}</p>
            <p><strong>Thời Hạn Nộp:</strong> {job.NgayHetHan}</p>
            <p><strong>Địa Điểm:</strong> {job.DiaDiem}</p>
            <p><strong>Mức Lương:</strong> {job.MucLuong}</p>
            <p><strong>Hình Thức:</strong> {job.HinhThuc}</p>
            <p className="mt-4"><strong>Mô Tả:</strong> {job.MoTa}</p>
            <p className="mt-4"><strong>Yêu Cầu:</strong> {job.YeuCau}</p>
            <p className="mt-4"><strong>Quyền Lợi:</strong> {job.QuyenLoi}</p>
            <p className="mt-4"><strong>Ghi Chú:</strong> {job.GhiChu || 'Không có'}</p>
          </div>
        </main>
      </div>
      <ChanTrang />
    </>
  );
}