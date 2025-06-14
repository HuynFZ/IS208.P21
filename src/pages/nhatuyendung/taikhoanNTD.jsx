import ThanhdhDN from "../../components/thanhdieuhuong/thanhdhDN";
import ChanTrang from "../../components/chantrang" ;
import Image from "next/image";
import DSTin from "../../components/nhatuyendung/dstindadang";
export default function TaiKhoanNTD() {
    return (
        <>
        <ThanhdhDN/>
         
        <div className="min-h-screen bg-gray-50 px-6 py-6 justify-between flex flex-col items-center">     
        <div className="max-w-7xl w-full grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Thông tin người dùng */}
          <div className="bg-white shadow-md rounded-2xl p-6 flex flex-col md:flex-row gap-4 items-center">
            <div className="flex-shrink-0">  
                <Image src="/icons/avatar.jpg" alt="Edit icon" width={100} height={100} />  
            </div>
            <div className="flex-1 text-sm space-y-2">
              <p className="font-semibold text-black">Họ tên: <span className="font-normal" >Nguyễn Văn A</span></p>
              <p className="font-semibold text-black">Email: <span className="font-normal">23520000@gm.ui.edu.vn</span></p>
              <p className="font-semibold text-black">
                Số điện thoại: <a href="#" className="text-blue-600 hover:underline">Thêm số điện thoại</a>
              </p>
              <p className="font-semibold text-black">Công ty: < span className="font-normal">Công ty A</span></p>
              <p className="font-semibold text-black">
                Địa chỉ: < span className="font-normal">đường Phạm Thái Bường, phường 4, Vĩnh Long</span>
              </p>
            </div>
            <div className="self-start">
              <button className="p-2 hover:bg-gray-100 rounded-none">   
                <Image src="/icons/edit_2.png" alt="Edit icon" width={25} height={25} />
              </button>
            </div>
          </div>
      
          {/* Tạo tin tuyển dụng mới */}
          <div className="bg-gray-100 shadow-md rounded-2xl p-6 text-center">
            <h2 className="text-xl text-black font-semibold mb-4">Tin tuyển dụng mới</h2>
            <button className="w-full bg-teal-600 text-black py-3 rounded-xl font-bold text-lg hover:bg-teal-700 transition">
              Tạo tin ngay!
            </button>
          </div>
        
          {/* Danh sách tin tuyển dụng */}
          <div className="bg-gray-100 shadow-md rounded-2xl p-6 col-span-1 md:col-span-2">
            <div className="flex justify-between items-center">
              <h2 className="text-xl text-black font-semibold mb-2">Danh sách tin tuyển dụng</h2>
              <button className="p-2 hover:bg-gray-200 rounded-none">            
                <Image src="/icons/edit_2.png" alt="Edit icon" width={25} height={25} />
              </button>
            </div>
            <hr className="mb-4" />
            <p className="italic text-gray-700 text-center">
              "Bạn có thể cập nhật thông tin tuyển dụng bất cứ lúc nào để thu hút ứng viên phù hợp hơn."
            </p>
          </div>
        </div>
      </div>
      <ChanTrang/>
      </>
    );
  }
  