'use client'; // nếu bạn dùng Next.js 13+ với App Router
import ThanhdhDN from "../../components/thanhdieuhuong/thanhdhDN";
import ChanTrang from "../../components/chantrang" ;
import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';

export default function DSlich_test() {
  const [showFilterPV, setShowFilterPV] = useState(false); // dropdown cho Lịch PV
  const [showFilterTest, setShowFilterTest] = useState(false); // dropdown cho Bài test

  const filterRefPV = useRef(null);
  const filterRefTest = useRef(null);


  // Đóng dropdown nếu click ra ngoài
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (filterRefPV.current && !filterRefPV.current.contains(event.target)) {
        setShowFilterPV(false);
      }
      if (filterRefTest.current && !filterRefTest.current.contains(event.target)) {
        setShowFilterTest(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <>
    <ThanhdhDN userType="nhatuyendung" />
    <div className="bg-white min-h-screen relative overflow-x-auto p-4">
      <h1 className="text-4xl text-black font-bold mt-10 mb-10">Danh sách tin lịch phỏng vấn</h1>
      <table className="min-w-full border border-gray-300 table-fixed">
        <thead className="bg-gray-100">
          <tr className="text-left text-black">
            <th className="p-3 border-b w-6">
              <input type="checkbox" />
            </th>
            <th className="p-3 border-b w-1/5">Lịch phỏng vấn</th>
            <th className="p-3 border-b w-1/5">Tin tuyển dụng</th>
            <th className="p-3 border-b w-1/5">Hình thức</th>
            <th className="p-3 border-b w-1/5">Ngày diễn ra</th>
            <th className="p-3 border-b w-1/5 relative text-right">
              <div className="inline-flex items-center gap-4 justify-end">
                <span>Trạng thái</span>
                <button onClick={() => setShowFilterPV(prev => !prev)}>
                  <Image src="/icons/filter.png" alt="Lọc" width={16} height={16} />
                </button>
              </div>

              {showFilterPV && (
                <div
                  ref={filterRefPV}
                  className="absolute right-0 mt-2 w-40 bg-white border border-gray-300 shadow-lg z-10 rounded-md"
                >
                  <ul className="text-sm text-left text-gray-700">
                    <li className="p-2 hover:bg-gray-100 cursor-pointer">Tất cả</li>
                    <li className="p-2 hover:bg-gray-100 cursor-pointer">Đã diễn ra</li>
                    <li className="p-2 hover:bg-gray-100 cursor-pointer">Chưa diễn ra</li>
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
      <hr className="my-4 border-gray-300 mt-20 " />

      <h1 className="text-4xl text-black font-bold mt-10 mb-10">Danh sách tin bài test</h1>
      <table className="min-w-full border border-gray-300 table-fixed">
        <thead className="bg-gray-100">
          <tr className="text-left text-black">
            <th className="p-3 border-b w-6">
              <input type="checkbox" />
            </th>
            <th className="p-3 border-b w-1/5">Bài test</th>
            <th className="p-3 border-b w-1/5">Tin tuyển dụng</th>
            <th className="p-3 border-b w-1/5">Hình thức</th>
            <th className="p-3 border-b w-1/5">Ngày diễn ra</th>
            <th className="p-3 border-b w-1/5 relative text-right">
              <div className="inline-flex items-center gap-4 justify-end">
                <span>Trạng thái</span>
                <button onClick={() => setShowFilterTest(prev => !prev)}>
                  <Image src="/icons/filter.png" alt="Lọc" width={16} height={16} />
                </button>
              </div>

              {showFilterTest && (
                <div
                  ref={filterRefTest}
                  className="absolute right-0 mt-2 w-40 bg-white border border-gray-300 shadow-lg z-10 rounded-md"
                >
                  <ul className="text-sm text-left text-gray-700">
                    <li className="p-2 hover:bg-gray-100 cursor-pointer">Tất cả</li>
                    <li className="p-2 hover:bg-gray-100 cursor-pointer">Đã diễn ra</li>
                    <li className="p-2 hover:bg-gray-100 cursor-pointer">Chưa diễn ra</li>
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
