import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import axios from "axios";
import ThanhdhDN from "../../components/thanhdieuhuong/thanhdhDN";
import ChanTrang from "../../components/chantrang";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { parseISO } from "date-fns";
import XacNhanModal from "../../components/XacNhanModal";
import { useToast } from "../../context/ToastContext";

export default function ChinhSuaThongTin() {
  const { data: session } = useSession();
  const router = useRouter();
  const { showToast } = useToast();
   const { id } = router.query;
   
  // State quản lý form
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [pendingFormData, setPendingFormData] = useState(null);
  const [form, setForm] = useState({
    hoTen: "",
    email: "",
    soDienThoai: "",
    ngaySinh: null,
    diaChi: ""
  });

  // Cấu hình các trường form
  const danhSachTruong = [
    {
      label: "Email",
      name: "email",
      type: "email",
      disabled: true,
      required: false,
      helpText: "Email không thể thay đổi"
    },
    {
      label: "Họ và tên",
      name: "hoTen",
      type: "text",
      required: true,
      maxLength: 50
    },
    {
      label: "Số điện thoại",
      name: "soDienThoai",
      type: "tel",
      required: true,
      pattern: "[0-9]{10}",
      title: "Số điện thoại phải có 10 chữ số"
    },
    {
      label: "Địa chỉ",
      name: "diaChi",
      type: "text",
      required: true,
      maxLength: 100
    }
  ];

  // Lấy thông tin ứng viên
  useEffect(() => {
    const layThongTinUngVien = async () => {
      if (!session) {
        router.push('/dangky_nhap/dangnhap');
        return;
      }

      try {
        const res = await axios.get("/api/ungvien/thongtin");
        const { data } = res.data;

        let ngaySinh = null;
        if (data.NgaySinh) {
          try {
            ngaySinh = parseISO(data.NgaySinh);
          } catch (e) {
            console.error("Lỗi định dạng ngày:", e);
          }
        }

        setForm({
          hoTen: data.TenUngVien || "",
          email: data.Email || "",
          soDienThoai: data.SDT || "",
          ngaySinh: ngaySinh,
          diaChi: data.DiaChi || ""
        });
      } catch (error) {
        console.error("Lỗi khi lấy thông tin:", error);
        showToast("Không thể lấy thông tin. Vui lòng thử lại sau!", "error");
      } finally {
        setIsLoading(false);
      }
    };

    layThongTinUngVien();
  }, [session, router, showToast]);

  // Xử lý thay đổi input
  const xuLyThayDoi = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Xử lý thay đổi ngày sinh
  const xuLyThayDoiNgay = (date) => {
    setForm(prev => ({
      ...prev,
      ngaySinh: date
    }));
  };

  // Xử lý gửi form
  const xuLyGuiForm = async (e) => {
    e.preventDefault();

    if (!form.hoTen || !form.soDienThoai || !form.ngaySinh || !form.diaChi) {
      showToast("Vui lòng điền đầy đủ thông tin", "error");
      return;
    }

    const ngayDinhDang = form.ngaySinh.toISOString().split('T')[0];
    
    setPendingFormData({
      tenUngVien: form.hoTen.trim(),
      sdt: form.soDienThoai,
      ngaySinh: ngayDinhDang,
      diaChi: form.diaChi.trim()
    });

    setShowModal(true);
  };

  // Xử lý xác nhận cập nhật
  const xacNhanCapNhat = async () => {
    setIsSubmitting(true);
    
    try {
      const res = await axios.put("/api/ungvien/ThaoTac/capnhatthongtin", pendingFormData);

      if (res.data.success) {
        showToast("Cập nhật thông tin thành công!");
        router.push('/ungvien/taikhoanUngVien');
      }
    } catch (error) {
      console.error("Lỗi cập nhật:", error);
      showToast(
        error.response?.data?.message || "Lỗi khi cập nhật thông tin!", 
        "error"
      );
    } finally {
      setIsSubmitting(false);
      setShowModal(false);
    }
  };

  if (isLoading) {
    return (
      <>
        <ThanhdhDN userType="ungvien"/>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-xl">Đang tải thông tin...</div>
        </div>
      </>
    );
  }

  return (
    <>
      <ThanhdhDN userType="ungvien"/>
      <div className="min-h-screen bg-gray-50 py-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white shadow-lg rounded-2xl p-6 md:p-8">
            <h1 className="text-3xl font-bold text-black mb-8">
              Chỉnh sửa thông tin cá nhân
            </h1>

            <form onSubmit={xuLyGuiForm} className="space-y-6">
              {danhSachTruong.map((truong) => (
                <div key={truong.name}>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {truong.label} {truong.required && <span className="text-red-500">*</span>}
                  </label>
                  <input
                    type={truong.type}
                    name={truong.name}
                    value={form[truong.name]}
                    onChange={xuLyThayDoi}
                    disabled={truong.disabled}
                    required={truong.required}
                    pattern={truong.pattern}
                    maxLength={truong.maxLength}
                    title={truong.title}
                    className={`w-full px-4 py-3 rounded-lg border border-gray-300 
                      ${truong.disabled ? 'bg-gray-100 text-gray-600' : 'bg-white text-black'}
                      focus:ring-2 focus:ring-teal-500 focus:border-transparent`}
                  />
                  {truong.helpText && (
                    <p className="mt-1 text-sm text-gray-500">{truong.helpText}</p>
                  )}
                </div>
              ))}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ngày sinh <span className="text-red-500">*</span>
                </label>
                <DatePicker
                  selected={form.ngaySinh}
                  onChange={xuLyThayDoiNgay}
                  dateFormat="dd/MM/yyyy"
                  showMonthDropdown
                  showYearDropdown
                  dropdownMode="select"
                  required
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 
                    focus:ring-teal-500 focus:border-transparent bg-white text-black"
                  placeholderText="Chọn ngày sinh"
                  maxDate={new Date()}
                  yearDropdownItemNumber={100}
                  scrollableYearDropdown
                />
              </div>

              <XacNhanModal
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                onConfirm={xacNhanCapNhat}
                title="Xác nhận cập nhật"
                content="Bạn có chắc chắn muốn cập nhật thông tin cá nhân không?"
              />

              <div className="flex justify-end space-x-4 pt-6">
                <button
                  type="button"
                  onClick={() => router.back()}
                  className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg 
                    hover:bg-gray-200 font-medium"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`px-6 py-3 rounded-lg font-medium text-white
                    ${isSubmitting ? 'bg-gray-400 cursor-not-allowed' : 'bg-teal-600 hover:bg-teal-700'}`}
                >
                  {isSubmitting ? 'Đang xử lý...' : 'Lưu thay đổi'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
      <ChanTrang />
    </>
  );
}