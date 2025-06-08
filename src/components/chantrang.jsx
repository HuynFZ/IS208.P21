import Image from "next/image";

const ChanTrang = () => {
  return (
    <div className=" w-full bg-teal-600 shadow-lg rounded-lg p-6 flex justify-between items-start">
      {/* Logo bên trái */}
      <div className="flex flex-col items-start">
        <Image src="/logo.jpg" alt="Talent Hub Logo" width={100} height={100} />
        <h1 className="text-2xl font-bold text-black mt-2">Talent Hub</h1>
      </div>

      {/* Danh sách ngành nghề bên phải */}
      <div className="text-gray-700 text-lg">
        <h2 className="text-xl text-left font-bold text-black">Lĩnh vực phổ biến</h2>
        <ul className="mt-2 text-left space-y-2">
          <li>✅ Công nghệ thông tin (CNTT) & AI</li>
          <li>✅ Logistics & Quản lý chuỗi cung ứng</li>
          <li>✅ Digital Marketing & Thương mại điện tử</li>
          <li>✅ Tài chính – Ngân hàng</li>
          <li>✅ Thiết kế đồ họa</li>
        </ul>
      </div>

      {/* Thông tin liên hệ */}
      <div className="text-gray-600 text-sm text-right">
        <h2 className="text-lg font-bold text-black">Liên hệ Talent Hub</h2>
        <p>📍 123 Linh Trung, Thủ Đức, Việt Nam</p>
        <p>📞 +84 123 456 789</p>
        <p>📧 Email ứng viên: ungvien@talenthub.com</p>
        <p>📧 Email tuyển dụng: tuyendung@talenthub.com</p>
      </div>
    </div>
  );
};

export default ChanTrang;