import Image from 'next/image';
import { useState } from 'react';

export default function InfoLayout({ title, generalInfo, children, modalContent }) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div>
      <div className="bg-teal-100 py-10 text-black text-center text-5xl font-bold">
        {title}
      </div>

      {/* Modal form nhập liệu */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-auto p-6 shadow-lg relative">
            <form className="space-y-4">
              {modalContent}
              <div className="flex justify-end gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                >
                  Hủy Bỏ
                </button>
                <button
                  type="submit"
                  className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                >
                  Xác Nhận
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Nội dung chính */}
      <div className="bg-white min-h-screen relative overflow-x-auto p-4">
        <div className="bg-gray-100 p-6 m-6 text-black rounded shadow">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-bold text-3xl">Thông tin chung</h2>
            <button onClick={() => setIsModalOpen(true)}>
              <Image src="/icons/edit_2.png" width={20} height={20} alt="Edit" />
            </button>
          </div>
          <hr className="my-4 border-gray-300" />
          {generalInfo}
        </div>

        <h1 className="text-3xl text-black font-bold mt-10 mb-10">Danh sách ứng viên</h1>
        {children}
      </div>
    </div>
  );
}

