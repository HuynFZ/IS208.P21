'use client'; // nếu bạn dùng Next.js 13+ với App Router
import ThanhdhDN from "../../components/thanhdieuhuong/thanhdhDN";
import ChanTrang from "../../components/chantrang" ;
import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';

export default function DSHoSo() {
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const filterRef = useRef(null);

  // Đóng dropdown nếu click ra ngoài
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (filterRef.current && !filterRef.current.contains(event.target)) {
        setShowFilterMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleFilterClick = () => {
    setShowFilterMenu(prev => !prev);
  };

  return (
    <>
    <ThanhdhDN userType="nhatuyendung" />
    <div className="bg-white min-h-screen relative overflow-x-auto p-4">
      <h1 className="text-4xl text-black font-bold mt-10 mb-10">Danh sách hồ sơ ứng tuyển</h1>
      
      <table className="min-w-full border border-gray-300 table-fixed">
        <thead className="bg-gray-100">
          <tr className="text-left text-black">
            <th className="p-3 border-b w-6">
              <input type="checkbox" />
            </th>
            <th className="p-3 border-b w-1/4">Tên hồ sơ</th>
            <th className="p-3 border-b w-1/4">Vị trí ứng tuyển</th>
            <th className="p-3 border-b w-1/4">Thời gian nộp</th>
            <th className="p-3 border-b w-1/4 relative text-right">
              <div className="inline-flex items-center gap-4 justify-end">
                <span>Trạng thái</span>
                <button onClick={handleFilterClick} >
                  <Image src="/icons/filter.png" alt="Lọc" width={16} height={16} />
                </button>
              </div>

              {showFilterMenu && (
                <div
                  ref={filterRef}
                  className="absolute right-0 mt-2 w-40 bg-white border border-gray-300 shadow-lg z-10 rounded-md"
                >
                  <ul className="text-sm text-left text-gray-700">
                    <li className="p-2 hover:bg-gray-100 cursor-pointer">Tất cả</li>
                    <li className="p-2 hover:bg-gray-100 cursor-pointer">Đã duyệt</li>
                    <li className="p-2 hover:bg-gray-100 cursor-pointer">Chờ duyệt</li>
                    <li className="p-2 hover:bg-gray-100 cursor-pointer">Đã phỏng vấn</li> 
                    <li className="p-2 hover:bg-gray-100 cursor-pointer">Đã làm test</li> 
                  </ul>
                </div>
              )}
            </th>
          </tr>
        </thead>
        <tbody>
          {/* Dữ liệu thật sẽ hiển thị ở đây sau */}
        </tbody>
      </table>
    </div>
  </>
  );
}
