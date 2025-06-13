import ThanhdhDN from "../../components/thanhdieuhuong/thanhdhDN";
import ChanTrang from "../../components/chantrang";
import Image from "next/image";
import { useState, useRef, useEffect } from "react"; // Add useEffect
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import axios from 'axios'; // Add axios
import { useToast } from "../../context/ToastContext"; // Import useToast for notifications

export default function TaiKhoanUngVien() {
  const { data: session } = useSession();
  const router = useRouter();
  const { showToast } = useToast();
  const fileInputRef = useRef(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    hoTen: "",
    email: "",
    soDienThoai: "",
    ngaySinh: "",
    diaChi: "",
  });

  // Add useEffect to fetch data when component mounts
useEffect(() => {
  console.log('Session status:', !!session); // Log session existence
  if (!session) {
    router.push('/dangnhap_ky/dangnhap');
    return;
  }

  const fetchData = async () => {
  try {
    setLoading(true); 
    const res = await axios.get('/api/ungvien/thongtin');
    console.log('API Response:', res.data);  
      const {data} = res.data;
      // Cập nhật lại tên field cho khớp với API response
      setForm({
        hoTen: data.TenUngVien || "",         
        email: data.Email || "",               
        soDienThoai: data.SDT || "",         
        ngaySinh: data.NgaySinh            
          ? new Date(data.NgaySinh).toLocaleDateString('vi-VN') 
          : "",
        diaChi: data.DiaChi || "",           
      });
  } catch (error) {
    console.error('Fetch error:', error);
    showToast(error.response?.data?.message || 'Có lỗi khi tải thông tin', { type: 'error' });
  } finally {
    setLoading(false);
  }
};

  fetchData();
}, [session, router, showToast]);

  //hàm xử lý chuyển trang chỉnh sửa thông tin
  const handleEditClick = () => {
    router.push('/ungvien/chinhsuathongtin');
  };

   // Xử lý khi upload file
  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Tạo URL để xem file
      const fileUrl = URL.createObjectURL(file);
      setForm(prev => ({
        ...prev,
        cv: file,
        cvName: file.name,
        cvUrl: fileUrl
      }));
    }
  };
  // Xử lý khi xóa CV
  const handleRemoveCV = () => {
    if (form.cvUrl) {
      URL.revokeObjectURL(form.cvUrl); // Giải phóng URL
    }
    setForm(prev => ({
      ...prev,
      cv: null,
      cvName: "",
      cvUrl: null
    }));
  };

  // Xem CV
  const handleViewCV = () => {
    if (form.cvUrl) {
      window.open(form.cvUrl, '_blank');
    }
  };

  return (
    <>
     <ThanhdhDN userType="ungvien"/>
    {console.log('Current form state:', form)}
    <div className="w-full bg-teal-100 py-10 text-black text-center">
      <h1 className="text-black text-4xl font-bold">Tài khoản của tôi</h1>
    </div>

      <div className="min-h-screen bg-gray-50 px-6 py-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Thông tin cá nhân */}
            <div className="bg-white shadow-md rounded-2xl p-6 flex flex-col md:flex-row gap-4 items-center">
              <div className="flex-shrink-0">
                <Image src="/icons/avatar.jpg" alt="Avatar" width={100} height={100} className="rounded-full" />
              </div>
            <div className="flex-1 text-sm space-y-2">
              <p className="font-semibold text-black">
                Họ tên: <span className="font-normal">{form.hoTen}</span>
              </p>
              <p className="font-semibold text-black">
                Email: <span className="font-normal">{form.email}</span>
              </p>
              <p className="font-semibold text-black">
                Số điện thoại: {form.soDienThoai ? 
                  <span className="font-normal">{form.soDienThoai}</span> : 
                  <a onClick={handleEditClick} className="text-blue-600 hover:underline cursor-pointer">
                    Thêm số điện thoại
                  </a>
                }
                </p>
                <p className="font-semibold text-black">
                  Ngày sinh: {form.ngaySinh ?
                  <span className="font-normal">{form.ngaySinh}</span> :
                  <a onClick={handleEditClick} className="text-blue-600 hover:underline cursor-pointer">
                    Thêm ngày sinh
                  </a>
                }
                </p>
                <p className="font-semibold text-black">
                  Địa chỉ: {form.diaChi ?
                  <span className="font-normal">{form.diaChi}</span> :
                  <a onClick={handleEditClick} className="text-blue-600 hover:underline cursor-pointer">
                    Thêm địa chỉ
                  </a>
                }
                </p>
              </div>
              <button 
                onClick={handleEditClick}
                className="p-2 hover:bg-gray-100 rounded-lg self-start"
              >
                <Image src="/icons/edit_2.png" alt="Edit" width={25} height={25} />
              </button>
            </div>

           {/* CV của tôi */}
            <div className="bg-teal-50 shadow-md rounded-2xl p-6">
              <h2 className="text-2xl font-bold text-black mb-4">CV của tôi</h2>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                accept=".pdf,.doc,.docx"
                className="hidden"
              />
              
              {!form.cv ? (
                // Hiển thị nút upload khi chưa có CV
                <>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full bg-teal-600 text-white py-4 rounded-xl font-bold text-xl hover:bg-teal-700 transition mb-3"
                  >
                    Tải lên CV có sẵn
                  </button>
                  <p className="text-center text-gray-600">Hỗ trợ định dạng doc, pdf</p>
                </>
              ) : (
                // Hiển thị CV đã upload
                <div className="relative mt-4 p-4 bg-white rounded-lg border border-teal-200 hover:border-teal-400 transition">
                  {/* Nút xóa CV */}
                  <button
                    onClick={handleRemoveCV}
                    className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition"
                    title="Xóa CV"
                  >
                    ×
                  </button>
                  
                  {/* CV có thể click để xem */}
                  <div 
                    onClick={handleViewCV}
                    className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 p-2 rounded"
                  >
                    <Image 
                      src="/icons/pdf.png" 
                      alt="PDF icon" 
                      width={40} 
                      height={40}
                    />
                    <div className="flex-1">
                      <p className="text-black font-medium truncate">
                        {form.cvName}
                      </p>
                      <p className="text-sm text-gray-500">
                        Click để xem CV
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Hồ sơ của tôi */}
            <div className="bg-teal-50 shadow-md rounded-2xl p-6 md:col-span-2">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-black">Hồ sơ của tôi</h2>
                <button 
                  onClick={handleEditClick}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                  title="Chỉnh sửa hồ sơ"
                >
                  <Image src="/icons/edit_2.png" alt="Edit" width={25} height={25} />
                </button>
              </div>
              <p className="text-center text-gray-700 italic">
                Tạo hồ sơ, kết nối hàng ngàn công việc phù hợp với bạn.
              </p>
            </div>

          </div>
        </div>
      </div>
      <ChanTrang />
    </>
  );
}