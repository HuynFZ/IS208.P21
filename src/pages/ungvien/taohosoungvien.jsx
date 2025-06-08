import { useState, useRef, useEffect } from "react";
import { useRouter } from 'next/router';
import { useSession } from "next-auth/react";
import axios from "axios";
import Image from "next/image";
import ThanhdhDN from "../../components/thanhdieuhuong/thanhdhDN";
import { useToast } from "../../context/ToastContext";

// Component xác nhận
const ConfirmModal = ({ isOpen, onClose, onConfirm, isSubmitting }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">
          Xác nhận tạo hồ sơ
        </h3>
        <p className="text-gray-600 mb-6">
          Bạn có chắc chắn muốn tạo hồ sơ này không?
        </p>
        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg 
              hover:bg-gray-200 font-medium"
          >
            Hủy
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isSubmitting}
            className={`px-4 py-2 rounded-lg font-medium text-white
              ${isSubmitting ? 'bg-gray-400 cursor-not-allowed' : 'bg-teal-600 hover:bg-teal-700'}`}
          >
            {isSubmitting ? 'Đang xử lý...' : 'Xác nhận'}
          </button>
        </div>
      </div>
    </div>
  );
};

// Component upload file
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
      accept=".pdf,.doc,.docx"
      className="hidden"
    />
    
    {!file && !fileName ? (
      <>
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="w-full bg-teal-600 text-white py-4 rounded-xl font-bold text-xl 
            hover:bg-teal-700 transition mb-3"
        >
          Tải lên {title}
        </button>
        <p className="text-center text-gray-600">
          Hỗ trợ định dạng doc, pdf
        </p>
      </>
    ) : (
      <div className="relative mt-4 p-4 bg-white rounded-lg border border-teal-200 
        hover:border-teal-400 transition"
      >
        <button
          type="button"
          onClick={onRemove}
          className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full 
            flex items-center justify-center hover:bg-red-600 transition"
          title={`Xóa ${title}`}
        >
          ×
        </button>
        
        <div 
          onClick={onView}
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
              {fileName || file?.name}
            </p>
            <p className="text-sm text-gray-500">
              Click để xem file
            </p>
          </div>
        </div>
      </div>
    )}
  </div>
);

// Component chính
export default function TaoHoSoUngVien() {
  const { data: session } = useSession();
  const router = useRouter();
  const { showToast } = useToast();
  
  // States
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  
  // Refs
  const cvInputRef = useRef(null);
  const letterInputRef = useRef(null);

  // Check session
  useEffect(() => {
    if (!session) {
      router.push('/login');
    }
  }, [session, router]);

  // Form state
  const [form, setForm] = useState({
    tenHoSo: "",
    cv: null,
    cvName: "",
    thuGioiThieu: null
  });

  // File preview URLs
  const [fileUrls, setFileUrls] = useState({
    cv: null,
    thuGioiThieu: null
  });

  // Handlers
  const handleTenHoSoChange = (e) => {
    setForm(prev => ({
      ...prev,
      tenHoSo: e.target.value
    }));
  };

  const handleFileUpload = (e, type) => {
    const file = e.target.files[0];
    if (file) {
      const fileUrl = URL.createObjectURL(file);
      setFileUrls(prev => ({ ...prev, [type]: fileUrl }));
      setForm(prev => ({
        ...prev,
        [type]: file,
        ...(type === 'cv' ? { cvName: file.name } : {})
      }));
    }
  };

  const handleRemoveFile = (type) => {
    if (fileUrls[type]) {
      URL.revokeObjectURL(fileUrls[type]);
    }
    setFileUrls(prev => ({ ...prev, [type]: null }));
    setForm(prev => ({
      ...prev,
      [type]: null,
      ...(type === 'cv' ? { cvName: '' } : {})
    }));
    if (type === 'cv') cvInputRef.current.value = '';
    if (type === 'thuGioiThieu') letterInputRef.current.value = '';
  };

  const handleViewFile = (type) => {
    if (fileUrls[type]) {
      window.open(fileUrls[type], '_blank');
    }
  };

  // Form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!form.tenHoSo.trim()) {
      showToast("Vui lòng nhập tên hồ sơ!", "error");
      return;
    }

    if (!form.cv) {
      showToast("Vui lòng tải lên CV!", "error");
      return;
    }

    setShowConfirmModal(true);
  };

  const handleConfirm = async () => {
    setShowConfirmModal(false);
    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append("tenHoSo", form.tenHoSo.trim());
      formData.append("cv", form.cv);
      
      if (form.thuGioiThieu) {
        formData.append("thuGioiThieu", form.thuGioiThieu);
      }

      const response = await axios.post("/api/ungvien/taohosoungvien", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      if (response.data.success) {
        showToast("Tạo hồ sơ thành công!");
        router.push("/ungvien/tranghosoungvien");
      }
    } catch (error) {
      console.error("Lỗi:", error);
      showToast(
        error.response?.data?.message || "Lỗi khi tạo hồ sơ", 
        "error"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Loading state
  if (!session) {
    return (
      <>
        <ThanhdhDN userType="ungvien" />
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-xl">Đang chuyển hướng...</div>
        </div>
      </>
    );
  }

  return (
    <>
      <ThanhdhDN userType="ungvien" />
      <div className="min-h-screen bg-gray-50 py-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-4xl font-bold text-black mb-8">Tạo hồ sơ mới</h1>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Tên hồ sơ */}
            <div className="bg-white shadow-lg rounded-2xl p-6 md:p-8">
              <h2 className="text-2xl font-bold text-black mb-6">
                Thông tin hồ sơ <span className="text-red-500">*</span>
              </h2>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tên hồ sơ
                </label>
                <input
                  type="text"
                  value={form.tenHoSo}
                  onChange={handleTenHoSoChange}
                  placeholder="VD: Hồ sơ IT - Java Developer"
                  maxLength={50}
                  required
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 
                    focus:ring-2 focus:ring-teal-500 focus:border-transparent 
                    text-black bg-white placeholder-gray-500"
                />
                <p className="mt-1 text-sm text-gray-500">
                  Đặt tên để dễ dàng phân biệt các hồ sơ của bạn
                </p>
              </div>
            </div>

            {/* CV */}
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

            {/* Thư giới thiệu */}
            <FileUploadSection
              title="Thư giới thiệu"
              type="thuGioiThieu"
              file={form.thuGioiThieu}
              fileName={form.thuGioiThieu?.name}
              fileUrl={fileUrls.thuGioiThieu}
              inputRef={letterInputRef}
              onUpload={(e) => handleFileUpload(e, 'thuGioiThieu')}
              onRemove={() => handleRemoveFile('thuGioiThieu')}
              onView={() => handleViewFile('thuGioiThieu')}
            />

            {/* Buttons */}
            <div className="flex justify-end space-x-4">
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
                {isSubmitting ? 'Đang xử lý...' : 'Tạo hồ sơ'}
              </button>
            </div>
          </form>
        </div>
      </div>

      <ConfirmModal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        onConfirm={handleConfirm}
        isSubmitting={isSubmitting}
      />
    </>
  );
}