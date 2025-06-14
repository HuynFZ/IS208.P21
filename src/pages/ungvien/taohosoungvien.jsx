import { useState, useRef, useEffect } from "react";
import { useRouter } from 'next/router';
import { useSession } from "next-auth/react";
import axios from "axios";
import Image from "next/image";
import ThanhdhDN from "../../components/thanhdieuhuong/thanhdhDN";
import { useToast } from "../../context/ToastContext";

// Các hằng số
const ALLOWED_FILE_TYPES = ".pdf,.doc,.docx";
const INITIAL_FORM_STATE = {
  tenHoSo: "",
  cv: null,
  cvName: "",
  thuGioiThieu: null,
  thongTinChung: {
    hoTen: "",
    ngaySinh: "",
    gioiTinh: "Nam",
    soDienThoai: "",
    email: "",
    diaChi: "",
  }
};

// Component tải lên tập tin
const FileUploadSection = ({
  title,
  type,
  file,
  fileName,
  fileUrl,
  inputRef,
  onUpload,
  onRemove,
  onView,
  required = false
}) => (
  <div className="bg-white shadow-lg rounded-2xl p-6 md:p-8">
    <h2 className="text-2xl font-bold text-black mb-6">
      {title} {required && <span className="text-red-500">*</span>}
    </h2>
    <input
      type="file"
      ref={inputRef}
      onChange={onUpload}
      accept={ALLOWED_FILE_TYPES}
      className="hidden"
    />
    
    {!file && !fileName ? (
      <div className="text-center">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="w-full bg-teal-600 text-white py-4 rounded-xl font-bold text-xl 
            hover:bg-teal-700 transition mb-3"
        >
          Tải lên {title}
        </button>
        <p className="text-black">Hỗ trợ định dạng doc, pdf</p>
      </div>
    ) : (
      <div className="relative p-4 bg-white rounded-lg border border-teal-200 hover:border-teal-400">
        <button
          type="button"
          onClick={onRemove}
          className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full 
            flex items-center justify-center hover:bg-red-600"
        >
        </button>
        <div 
          onClick={onView}
          className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 p-2 rounded"
        >
          <Image src="/icons/pdf.png" alt="Biểu tượng PDF" width={40} height={40} />
          <div className="flex-1">
            <p className="text-black font-medium truncate">{fileName || file?.name}</p>
            <p className="text-sm text-black">Nhấp để xem tập tin</p>
          </div>
        </div>
      </div>
    )}
  </div>
);

// Component xác nhận
const ConfirmModal = ({ isOpen, onClose, onConfirm, isSubmitting }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <h3 className="text-xl font-semibold text-black mb-4">
          {isSubmitting ? 'Đang xử lý...' : 'Xác nhận tạo hồ sơ'}
        </h3>
        <p className="text-black mb-6">
          Bạn có chắc chắn muốn {isSubmitting ? 'cập nhật' : 'tạo'} hồ sơ này không?
        </p>
        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="px-4 py-2 bg-gray-100 text-black rounded-lg hover:bg-gray-200"
          >
            Hủy
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isSubmitting}
            className={`px-4 py-2 rounded-lg text-white
              ${isSubmitting ? 'bg-gray-400' : 'bg-teal-600 hover:bg-teal-700'}`}
          >
            Xác nhận
          </button>
        </div>
      </div>
    </div>
  );
};

// Component chính
export default function TaoHoSoUngVien() {
  const { data: session } = useSession();
  const router = useRouter();
  const { id } = router.query;
  const {showToast} = useToast();
  
  // Các state
  const [form, setForm] = useState(INITIAL_FORM_STATE);
  const [fileUrls, setFileUrls] = useState({ cv: null, thuGioiThieu: null });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [loading, setLoading] = useState(true);
  
  // Refs
  const cvInputRef = useRef(null);
  const letterInputRef = useRef(null);

  // Tải dữ liệu khi chỉnh sửa
  useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }
    loadHoSoData();
  }, [id]);

  // Hàm tải dữ liệu
  const loadHoSoData = async () => {
    try {
      const [hosoRes, ungvienRes] = await Promise.all([
        axios.get(`/api/ungvien/${id}`),
        axios.get('/api/ungvien/thongtin')
      ]);

      const hosoData = hosoRes.data.data;
      const ungvienData = ungvienRes.data.data;

      setForm({
        tenHoSo: hosoData.TenHoSo,
        cvName: hosoData.CV,
        thuGioiThieu: hosoData.ThuGioiThieu,
        thongTinChung: {
          hoTen: ungvienData.TenUngVien,
          ngaySinh: ungvienData.NgaySinh,
          gioiTinh: ungvienData.GioiTinh,
          soDienThoai: ungvienData.SDT,
          email: ungvienData.Email,
          diaChi: ungvienData.DiaChi,
        }
      });

      setFileUrls({
        cv: hosoData.CVUrl,
        thuGioiThieu: hosoData.ThuGioiThieuUrl
      });
    } catch (error) {
      console.error("Lỗi khi tải dữ liệu:", error);
      showToast("Không thể tải thông tin hồ sơ", { type: "error" });
    } finally {
      setLoading(false);
    }
  };

  // Xử lý thay đổi input
  const handleInputChange = (e, section = null) => {
    const { name, value } = e.target;
    
    if (section === 'thongTinChung') {
      setForm(prev => ({
        ...prev,
        thongTinChung: {
          ...prev.thongTinChung,
          [name]: value
        }
      }));
    } else {
      setForm(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  // Xử lý tải lên tập tin
  const handleFileUpload = (e, type) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!ALLOWED_FILE_TYPES.includes(file.name.substring(file.name.lastIndexOf('.')))) {
      showToast("Chỉ chấp nhận file PDF hoặc DOC", { type: "error" });
      return;
    }
    
    setForm(prev => ({
      ...prev,
      [type]: file,
      [`${type}Name`]: file.name
    }));
  };

  // Xử lý xóa tập tin
  const handleRemoveFile = (type) => {
    setForm(prev => ({
      ...prev,
      [type]: null,
      [`${type}Name`]: ''
    }));
    setFileUrls(prev => ({
      ...prev,
      [type]: null
    }));
  };

  // Xử lý xem tập tin
  const handleViewFile = (type) => {
    const fileUrl = fileUrls[type];
    if (fileUrl) {
      window.open(fileUrl, '_blank');
    }
  };

  // Xử lý gửi form
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!form.tenHoSo.trim() || (!form.cv && !form.cvName)) {
      showToast("Vui lòng điền đầy đủ thông tin bắt buộc", { type: "error" });
      return;
    }

    setShowConfirmModal(true);
  };

  // Xử lý xác nhận
  const handleConfirm = async () => {
  setShowConfirmModal(false);
  setIsSubmitting(true);

  try {
    const formData = new FormData();
    formData.append("tenHoSo", form.tenHoSo.trim());
    if (form.cv) formData.append("cv", form.cv);
    if (form.thuGioiThieu) formData.append("thuGioiThieu", form.thuGioiThieu);
    formData.append("thongTinChung", JSON.stringify(form.thongTinChung));
    
    // Use PUT for updates, POST for new profiles
    const config = {
      headers: { "Content-Type": "multipart/form-data" }
    };

    let response;
    if (id) {
      // Update existing profile
      response = await axios.put(`/api/ungvien/${id}`, formData, config);
    } else {
      // Create new profile
      response = await axios.post("/api/ungvien/ThaoTac/taohosoungvien", formData, config);
    }

    if (response.data.success) {
      showToast(id ? "Cập nhật hồ sơ thành công!" : "Tạo hồ sơ thành công!", { type: "success" });
      router.push("/ungvien/tranghosoungvien");
    }
  } catch (error) {
    console.error("Lỗi:", error);
    showToast(error.response?.data?.message || "Có lỗi xảy ra", { type: "error" });
  } finally {
    setIsSubmitting(false);
  }
};

  // Loading state
  if (loading) {
    return (
      <>
        <ThanhdhDN />
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-xl text-black">Đang tải...</div>
        </div>
      </>
    );
  }

  // Render chính
  return (
    <>
      <ThanhdhDN />
      <div className="min-h-screen bg-gray-50 py-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-4xl font-bold text-black mb-8">
            {id ? 'Chỉnh sửa hồ sơ' : 'Tạo hồ sơ mới'}
          </h1>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Phần thông tin chung - Chỉ hiện khi chỉnh sửa */}
            {id && (
              <div className="bg-white shadow-lg rounded-2xl p-6 md:p-8">
                <h2 className="text-2xl font-bold text-black mb-6">
                  Thông tin chung <span className="text-red-500">*</span>
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-black mb-2">
                      Họ và tên
                    </label>
                    <input
                      type="text"
                      name="hoTen"
                      value={form.thongTinChung.hoTen}
                      onChange={(e) => handleInputChange(e, 'thongTinChung')}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 
                        focus:ring-2 focus:ring-teal-500 focus:border-transparent bg-white text-black"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-black mb-2">
                      Giới tính
                    </label>
                    <select
                      name="gioiTinh"
                      value={form.thongTinChung.gioiTinh}
                      onChange={(e) => handleInputChange(e, 'thongTinChung')}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 
                        focus:ring-2 focus:ring-teal-500 focus:border-transparent bg-white text-black"
                    >
                      <option value="Nam">Nam</option>
                      <option value="Nữ">Nữ</option>
                      <option value="Khác">Khác</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-black mb-2">
                      Số điện thoại
                    </label>
                    <input
                      type="tel"
                      name="soDienThoai"
                      value={form.thongTinChung.soDienThoai}
                      onChange={(e) => handleInputChange(e, 'thongTinChung')}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 
                        focus:ring-2 focus:ring-teal-500 focus:border-transparent bg-white text-black"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-black mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={form.thongTinChung.email}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 
                        bg-gray-50 cursor-not-allowed text-gray-700"
                      disabled
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-black mb-2">
                      Địa chỉ
                    </label>
                    <input
                      type="text"
                      name="diaChi"
                      value={form.thongTinChung.diaChi}
                      onChange={(e) => handleInputChange(e, 'thongTinChung')}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 
                        focus:ring-2 focus:ring-teal-500 focus:border-transparent bg-white text-black"
                      required
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Phần thông tin hồ sơ */}
            <div className="bg-white shadow-lg rounded-2xl p-6 md:p-8">
              <h2 className="text-2xl font-bold text-black mb-6">
                Thông tin hồ sơ <span className="text-red-500">*</span>
              </h2>
              <div>
                <label className="block text-sm font-medium text-black mb-2">
                  Tên hồ sơ
                </label>
                <input
                  type="text"
                  name="tenHoSo"
                  value={form.tenHoSo}
                  onChange={(e) => handleInputChange(e)}
                  placeholder="VD: Hồ sơ IT - Java Developer"
                  maxLength={50}
                  required
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 
                    focus:ring-2 focus:ring-teal-500 focus:border-transparent bg-white text-black"
                />
              </div>
            </div>

            {/* Phần tải lên CV */}
            <FileUploadSection
              title="CV của tôi"
              type="cv"
              file={form.cv}
              fileName={form.cvName}
              fileUrl={fileUrls.cv}
              inputRef={cvInputRef}
              onUpload={(e) => handleFileUpload(e, 'cv')}
              onRemove={() => handleRemoveFile('cv')}
              onView={() => handleViewFile('cv')}
              required
            />

            {/* Phần tải lên thư giới thiệu */}
            <FileUploadSection
              title="Thư giới thiệu"
              type="thuGioiThieu"
              file={form.thuGioiThieu}
              fileUrl={fileUrls.thuGioiThieu}
              inputRef={letterInputRef}
              onUpload={(e) => handleFileUpload(e, 'thuGioiThieu')}
              onRemove={() => handleRemoveFile('thuGioiThieu')}
              onView={() => handleViewFile('thuGioiThieu')}
            />

            {/* Các nút thao tác */}
            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={() => router.back()}
                className="px-6 py-3 bg-gray-100 text-black rounded-lg hover:bg-gray-200"
              >
                Hủy
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className={`px-6 py-3 rounded-lg text-white
                  ${isSubmitting ? 'bg-gray-400' : 'bg-teal-600 hover:bg-teal-700'}`}
              >
                {isSubmitting ? 'Đang xử lý...' : (id ? 'Cập nhật' : 'Tạo hồ sơ')}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Modal xác nhận */}
      <ConfirmModal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        onConfirm={handleConfirm}
        isSubmitting={isSubmitting}
      />
    </>
  );
}