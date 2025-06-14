import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import axios from "axios";
import Select from "react-select";
import { useSession, signIn } from "next-auth/react";
import ThanhdhDN from "../../components/thanhdieuhuong/thanhdhDN";
import ChanTrang from "../../components/chantrang";

export default function CreateJobPosting() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showMoTa, setShowMoTa] = useState(false);
  const [showYeuCau, setShowYeuCau] = useState(false);
  const [showQuyenLoi, setShowQuyenLoi] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // State cho categories và levels
  const [categories, setCategories] = useState([]);
  const [levels, setLevels] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [levelsLoading, setLevelsLoading] = useState(true);
  const [categoriesError, setCategoriesError] = useState("");
  const [levelsError, setLevelsError] = useState("");
  const getCurrentDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  const getDefaultEndDate = () => {
    const date = new Date();
    date.setDate(date.getDate() + 30); // Default end date is 30 days from now
    return date.toISOString().split('T')[0];
  };

  

// Fetch categories
  useEffect(() => {
    axios.get("/api/categories")
      .then(res => {
        setCategories(res.data.data || []);
        setCategoriesLoading(false);
      })
      .catch(err => {
        setCategoriesError("Lỗi tải ngành nghề");
        setCategoriesLoading(false);
      });
  }, []);

  // Fetch levels
  useEffect(() => {
    axios.get("/api/levels")
      .then(res => {
        setLevels(res.data.data || []);
        setLevelsLoading(false);
      })
      .catch(err => {
        setLevelsError("Lỗi tải cấp bậc");
        setLevelsLoading(false);
      });
  }, []);

  // Kiểm tra đăng nhập
  if (status === "loading") return <div>Đang kiểm tra đăng nhập...</div>;
  if (!session) {
    signIn();
    return null;
  }

  // Chuyển đổi dữ liệu cho react-select
  const [nganhNgheOptions, setNganhNgheOptions] = useState([]);

useEffect(() => {
  if (categories?.length > 0) {
    const options = categories.map(category => ({
      value: category.MaNganhNghe,
      label: category.TenNganhNghe
    }));
    setNganhNgheOptions(options);
  }
}, [categories]);
  
// Thêm state cho levelOptions
const [levelOptions, setLevelOptions] = useState([]);

// Thêm useEffect để xử lý levelOptions
useEffect(() => {
  if (levels?.length > 0) {
    const options = levels.map(level => ({
      value: level.MaLevel,
      label: level.TenLevel
    }));
    setLevelOptions(options);
  }
}, [levels]);

  

  // Khởi tạo formData
  const [formData, setFormData] = useState({
    tieuDe: "",
    moTa: [],
    yeuCau: [],
    quyenLoi: [],
    level: "",
    nganhNghe: "",
    hinhThuc: "Toàn thời gian",
    diaDiem: "",
    mucLuong: "",
    ngayDangTin: getCurrentDate(),
    ngayHetHan: getDefaultEndDate(),
    soLuongYeuCau: "1",
    ghiChu: ""
  });

  // Đặt ngày đăng/ngày hết hạn mặc định trong useEffect để tránh hydration mismatch
  useEffect(() => {
    if (typeof window !== "undefined") {
      const today = new Date().toISOString().split("T")[0];
      const defaultExpireDate = new Date();
      defaultExpireDate.setDate(defaultExpireDate.getDate() + 30);
      setFormData(prev => ({
        ...prev,
        ngayDangTin: today,
        ngayHetHan: defaultExpireDate.toISOString().split("T")[0]
      }));
    }
  }, []);

  

  // Tùy chọn loại hình công việc
  const hinhThucOptions = [
    { value: "Toàn thời gian", label: "Toàn thời gian" },
    { value: "Bán thời gian", label: "Bán thời gian" },
    { value: "Làm việc tự do", label: "Làm việc tự do" },
    { value: "Làm việc theo hợp đồng", label: "Làm việc theo hợp đồng" }
  ];

  // Tùy chỉnh react-select
  const selectStyles = {
    control: (provided) => ({
      ...provided,
      backgroundColor: 'white',
      borderColor: '#e2e8f0',
      height: '42px',
      boxShadow: 'none',
      '&:hover': { borderColor: '#cbd5e0' }
    }),
    option: (provided, state) => ({
      ...provided,
      backgroundColor: state.isSelected ? '#2c7a7b' : state.isFocused ? '#e6fffa' : 'white',
      color: state.isSelected ? 'white' : 'black',
      '&:hover': { backgroundColor: state.isSelected ? '#2c7a7b' : '#e6fffa' }
    }),
    singleValue: (provided) => ({ ...provided, color: 'black' }),
    menu: (provided) => ({ ...provided, maxHeight: '200px' })
  };

  const customFilter = (option, inputValue) => {
    if (!inputValue) return true;
    if (!option.label || typeof option.label !== 'string') return false;
    return option.label.toLowerCase().includes(inputValue.toLowerCase());
  };

  // Các hàm thêm/cập nhật trường động
  const addJobDescription = () => {
    setFormData(f => ({ ...f, moTa: [...f.moTa, ""] }));
    setShowMoTa(true);
  };
  const updateJobDescription = (index, value) => {
    setFormData(f => {
      const updated = [...f.moTa];
      updated[index] = value;
      return { ...f, moTa: updated };
    });
  };
  const addRequirement = () => {
    setFormData(f => ({ ...f, yeuCau: [...f.yeuCau, ""] }));
    setShowYeuCau(true);
  };
  const updateRequirement = (index, value) => {
    setFormData(f => {
      const updated = [...f.yeuCau];
      updated[index] = value;
      return { ...f, yeuCau: updated };
    });
  };
  const addBenefit = () => {
    setFormData(f => ({ ...f, quyenLoi: [...f.quyenLoi, ""] }));
    setShowQuyenLoi(true);
  };
  const updateBenefit = (index, value) => {
    setFormData(f => {
      const updated = [...f.quyenLoi];
      updated[index] = value;
      return { ...f, quyenLoi: updated };
    });
  };

  // Xử lý thay đổi input
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(f => ({ ...f, [name]: value }));
  };
  const handleSelectChange = (selectedOption, actionMeta) => {
    setFormData(f => ({
      ...f,
      [actionMeta.name]: selectedOption ? selectedOption.value : ""
    }));
  };

  // Xử lý submit
  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");
    if (
      !formData.tieuDe ||
      !formData.moTa.length ||
      !formData.yeuCau.length ||
      !formData.diaDiem ||
      !formData.mucLuong ||
      !formData.level ||
      !formData.nganhNghe
    ) {
      setError("Vui lòng điền đầy đủ thông tin bắt buộc");
      return;
    }
    setShowConfirm(true);
  };

  // Xác nhận đăng tin
  const confirmPost = async () => {
    try {
      setLoading(true);
      const payload = {
        ...formData,
        moTa: formData.moTa.join('\n'),
        yeuCau: formData.yeuCau.join('\n'),
        quyenLoi: formData.quyenLoi.join('\n')
      };
      const response = await axios.post('/api/nhatuyendung/create_job', payload, {
        headers: { 'Content-Type': 'application/json' }
      });
      if (response.data.success) {
        alert("Tạo tin tuyển dụng thành công!");
        router.push({
          pathname: "/nhatuyendung/dstindadang",
          query: { success: 'created' }
        });
      } else {
        setError(response.data.message || "Có lỗi xảy ra");
        setShowConfirm(false);
      }
    } catch (err) {
      if (err.response) {
        if (err.response.status === 401) {
          setError("Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại");
          signIn();
        } else {
          setError(err.response.data?.message || "Có lỗi xảy ra khi tạo tin tuyển dụng");
        }
      } else {
        setError("Lỗi kết nối máy chủ");
      }
      setShowConfirm(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <ThanhdhDN />
      <div className="min-h-screen bg-white">
        <main className="container mx-auto p-4 mt-6">
          <h1 className="text-3xl font-bold text-black text-center mb-8">Tạo tin tuyển dụng</h1>

          {(error || categoriesError || levelsError) && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error || categoriesError || levelsError}
            </div>
          )}

          {(categoriesLoading || levelsLoading) && (
            <div className="text-center text-black">Đang tải dữ liệu...</div>
          )}

          {!categoriesLoading && !levelsLoading && (
            <form onSubmit={handleSubmit} className="bg-white shadow-md rounded-lg p-6 max-w-4xl mx-auto border border-gray-200">
              <h2 className="text-xl font-semibold mb-6 border-b text-black pb-2">Thông tin chung</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-black font-medium mb-2">Tiêu đề công việc: <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    name="tieuDe"
                    value={formData.tieuDe}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded px-3 py-2 bg-white text-black"
                    placeholder="Ví dụ: Giáo viên mầm non"
                    required
                  />
                </div>
                <div>
                  <label className="block text-black font-medium mb-2">Ngành nghề: <span className="text-red-500">*</span></label>
                  <Select
                  name="nganhNghe"
                  options={nganhNgheOptions}
                  value={nganhNgheOptions.find(option => option.value === formData.nganhNghe) || null}
                  onChange={(selectedOption) => {
                    setFormData(prev => ({
                      ...prev,
                      nganhNghe: selectedOption ? selectedOption.value : ''
                    }));
                  }}
                  styles={{
                    control: (base) => ({
                      ...base,
                      minHeight: '42px',
                      background: '#fff',
                      borderColor: '#e2e8f0',
                      '&:hover': {
                        borderColor: '#cbd5e1'
                      }
                    }),
                    menu: (base) => ({
                      ...base,
                      zIndex: 9999,
                      background: '#fff',
                      marginTop: '2px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                    }),
                    option: (base, state) => ({
                      ...base,
                      background: state.isSelected ? '#0d9488' : state.isFocused ? '#f0fdfa' : '#fff',
                      color: state.isSelected ? '#fff' : '#000',
                      '&:hover': {
                        background: '#f0fdfa'
                      }
                    })
                  }}
                  isSearchable={true}
                  placeholder="Chọn ngành nghề"
                  noOptionsMessage={() => "Không có ngành nghề phù hợp"}
                  loadingMessage={() => "Đang tải..."}
                  className="react-select-container"
                  classNamePrefix="react-select"
                  menuPortalTarget={document.body}
                  menuPosition="fixed"
                />
                </div>
                <div>
                  <label className="block text-black font-medium mb-2">Hình thức làm việc: <span className="text-red-500">*</span></label>
                  <Select
                    name="hinhThuc"
                    options={hinhThucOptions}
                    value={hinhThucOptions.find(option => option.value === formData.hinhThuc)}
                    onChange={(selectedOption, actionMeta) => handleSelectChange(selectedOption, { name: 'hinhThuc' })}
                    styles={selectStyles}
                    isSearchable={true}
                    placeholder="Chọn hình thức làm việc"
                    className="text-black"
                    isClearable
                  />
                </div>
                <div>
                  <label className="block text-black font-medium mb-2">Mức lương: <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    name="mucLuong"
                    value={formData.mucLuong}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded px-3 py-2 bg-white text-black"
                    placeholder="Ví dụ: 5tr-10tr"
                    required
                  />
                </div>
                <div>
                  <label className="block text-black font-medium mb-2">Địa điểm làm việc: <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    name="diaDiem"
                    value={formData.diaDiem}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded px-3 py-2 bg-white text-black"
                    placeholder="Ví dụ: Linh Trung, Thủ Đức"
                    required
                  />
                </div>
                <div>
                  <label className="block text-black font-medium mb-2">Cấp bậc: <span className="text-red-500">*</span></label>
                
                <Select
                  name="level"
                  options={levelOptions}
                  value={levelOptions.find(option => option.value === formData.level) || null}
                  onChange={(selectedOption) => {
                    setFormData(prev => ({
                      ...prev,
                      level: selectedOption ? selectedOption.value : ''
                    }));
                  }}
                  styles={{
                    control: (base) => ({
                      ...base,
                      minHeight: '42px',
                      background: '#fff',
                      borderColor: '#e2e8f0',
                      '&:hover': {
                        borderColor: '#cbd5e1'
                      }
                    }),
                    menu: (base) => ({
                      ...base,
                      zIndex: 9999,
                      background: '#fff',
                      marginTop: '2px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                    }),
                    option: (base, state) => ({
                      ...base,
                      background: state.isSelected ? '#0d9488' : state.isFocused ? '#f0fdfa' : '#fff',
                      color: state.isSelected ? '#fff' : '#000',
                      '&:hover': {
                        background: '#f0fdfa'
                      }
                    })
                  }}
                  isSearchable={true}
                  placeholder="Chọn cấp bậc"
                  noOptionsMessage={() => "Không có cấp bậc phù hợp"}
                  loadingMessage={() => "Đang tải..."}
                  className="react-select-container"
                  classNamePrefix="react-select"
                  menuPortalTarget={document.body}
                  menuPosition="fixed"
                  isClearable
                  isDisabled={levelsLoading || levelsError}
                />
                </div>
                <div>
                  <label className="block text-black font-medium mb-2">Số lượng tuyển: <span className="text-red-500">*</span></label>
                  <input
                    type="number"
                    name="soLuongYeuCau"
                    value={formData.soLuongYeuCau}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded px-3 py-2 bg-white text-black"
                    min="1"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Ngày đăng tin *
                  </label>
                  <input
                    type="date"
                    name="ngayDangTin"
                    value={formData.ngayDangTin}
                    onChange={handleChange}
                    min={getCurrentDate()}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500"
                    required
                  />
                </div>
                <div>
                <label className="block text-sm font-medium text-gray-700">
                  Ngày hết hạn *
                </label>
                <input
                  type="date"
                  name="ngayHetHan"
                  value={formData.ngayHetHan}
                  onChange={handleChange}
                  min={formData.ngayDangTin} 
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500"
                  required
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-black font-medium mb-2">Ghi chú:</label>
                  <textarea
                    name="ghiChu"
                    value={formData.ghiChu}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded px-3 py-2 bg-white text-black"
                    placeholder="Ghi chú thêm về tin tuyển dụng (nếu có)"
                    rows="3"
                  />
                </div>
              </div>

              {/* Mô tả công việc */}
              <h2 className="text-xl font-semibold mt-8 mb-4 text-black">Mô tả công việc <span className="text-red-500">*</span></h2>
              {!showMoTa && (
                <button
                  type="button"
                  onClick={addJobDescription}
                  className="text-teal-600 hover:text-teal-800 mt-2 flex items-center"
                >
                  <span className="mr-1">+</span> Thêm mô tả
                </button>
              )}
              {showMoTa && (
                <>
                  {formData.moTa.map((desc, index) => (
                    <div key={`desc-${index}`} className="mb-3 flex items-center">
                      <span className="mr-2 text-black">•</span>
                      <input
                        type="text"
                        value={desc}
                        onChange={(e) => updateJobDescription(index, e.target.value)}
                        className="w-full border border-gray-300 rounded px-3 py-2 bg-white text-black"
                        placeholder={`Mô tả ${index + 1}`}
                        required={index === 0}
                      />
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={addJobDescription}
                    className="text-teal-600 hover:text-teal-800 mt-2 flex items-center"
                  >
                    <span className="mr-1">+</span> Thêm mô tả
                  </button>
                </>
              )}

              {/* Yêu cầu công việc */}
              <h2 className="text-xl font-semibold mt-8 mb-4 text-black">Yêu cầu công việc <span className="text-red-500">*</span></h2>
              {!showYeuCau && (
                <button
                  type="button"
                  onClick={addRequirement}
                  className="text-teal-600 hover:text-teal-800 mt-2 flex items-center"
                >
                  <span className="mr-1">+</span> Thêm yêu cầu
                </button>
              )}
              {showYeuCau && (
                <>
                  {formData.yeuCau.map((req, index) => (
                    <div key={`req-${index}`} className="mb-3 flex items-center">
                      <svg width="20" height="20" viewBox="0 0 24 24" className="text-green-500 mr-2" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" fill="currentColor" />
                      </svg>
                      <input
                        type="text"
                        value={req}
                        onChange={(e) => updateRequirement(index, e.target.value)}
                        className="w-full border border-gray-300 rounded px-3 py-2 bg-white text-black"
                        placeholder={`Yêu cầu ${index + 1}`}
                        required={index === 0}
                      />
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={addRequirement}
                    className="text-teal-600 hover:text-teal-800 mt-2 flex items-center"
                  >
                    <span className="mr-1">+</span> Thêm yêu cầu
                  </button>
                </>
              )}

              {/* Quyền lợi công việc */}
              <h2 className="text-xl font-semibold mt-8 mb-4 text-black">Quyền lợi công việc</h2>
              {!showQuyenLoi && (
                <button
                  type="button"
                  onClick={addBenefit}
                  className="text-teal-600 hover:text-teal-800 mt-2 flex items-center"
                >
                  <span className="mr-1">+</span> Thêm quyền lợi
                </button>
              )}
              {showQuyenLoi && (
                <>
                  {formData.quyenLoi.map((benefit, index) => (
                    <div key={`benefit-${index}`} className="mb-3 flex items-center">
                      <span className="mr-2 text-black">•</span>
                      <input
                        type="text"
                        value={benefit}
                        onChange={(e) => updateBenefit(index, e.target.value)}
                        className="w-full border border-gray-300 rounded px-3 py-2 bg-white text-black"
                        placeholder={`Quyền lợi ${index + 1}`}
                      />
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={addBenefit}
                    className="text-teal-600 hover:text-teal-800 mt-2 flex items-center"
                  >
                    <span className="mr-1">+</span> Thêm quyền lợi
                  </button>
                </>
              )}

              {/* Submit */}
              <div className="mt-8 flex justify-center">
                <button
                  type="submit"
                  className="bg-teal-600 hover:bg-teal-700 text-white font-medium py-2 px-8 rounded-lg"
                  disabled={loading || categoriesLoading || levelsLoading}
                >
                  {loading ? "Đang xử lý..." : "Đăng tin tuyển dụng"}
                </button>
              </div>
            </form>
          )}
        </main>

        {/* Modal xác nhận */}
        {showConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full">
              <h3 className="text-lg font-medium mb-4 text-black">Xác nhận đăng tin tuyển dụng?</h3>
              <p className="text-gray-800 mb-6">
                Tin tuyển dụng sẽ được gửi và chờ quản trị viên duyệt trước khi hiển thị công khai.
              </p>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowConfirm(false)}
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
                  disabled={loading}
                >
                  Hủy
                </button>
                <button
                  onClick={confirmPost}
                  className="px-4 py-2 bg-teal-600 text-white rounded hover:bg-teal-700"
                  disabled={loading}
                >
                  {loading ? "Đang xử lý..." : "Xác nhận"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
      <ChanTrang />
    </div>
  );
}