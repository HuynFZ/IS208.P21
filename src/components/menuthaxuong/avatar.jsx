import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { signOut } from "next-auth/react";

export default function AvatarMenu({ userType }) {
  const [open, setOpen] = useState(false);
  const [username, setUsername] = useState('');
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        const user = JSON.parse(storedUser);
        setUsername(user.username);
      }
    }
  }, []);

  const menuItems = userType === "ungvien"
    ? [
        { src: "/icons/menu/avatar2.png", text: "Thông tin tài khoản", link : "/ungvien/taikhoanUngVien" },
        { src: "/icons/menu/ho-so.jpg", text: "Hồ sơ của bạn", link: "/ungvien/tranghosoungvien" },
        { src: "/icons/menu/balo.jpg", text: "Công việc đã ứng tuyển" },
      ]
    : [
        { src: "/icons/menu/avatar2.png", text: "Thông tin tài khoản", link: "/nhatuyendung/taikhoanNTD" },
        { src: "/icons/menu/new.png", text: "Tạo lịch PV/Bài test", link: "/nhatuyendung/dslichpv_test" }, 
        { src: "/icons/menu/list.jpg", text: "Danh sách tin đã đăng", link: "/nhatuyendung/dstindadang" },
      ];

  const handleLogout = () => {
    signOut({ callbackUrl: "/" }); // Đăng xuất và chuyển về trang chủ
  };

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center space-x-2 rounded-full p-2 border hover:bg-gray-200"
      >
        <img src="/icons/avatar.jpg" alt="Avatar" className="w-10 h-10 rounded-full object-cover" />
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-60 bg-white shadow-lg rounded-lg z-[9999]">
          <ul className="py-2">
            <li className="px-4 py-2 hover:bg-gray-100 cursor-pointer flex items-center">
              <div className="flex items-center space-x-2">
                <Image src="/icons/avatar.jpg" width={47} height={47} />
                <p className="text-black font-medium">{username}</p>
              </div>
            </li>
            <hr className="border-gray-300" />
            {menuItems.map((item, index) =>
              item.link ? (
                <li key={index} className="px-4 py-2 hover:bg-gray-100 cursor-pointer flex items-center">
                  <Link href={item.link} className="flex items-center w-full">
                    <Image src={item.src} width={47} height={47} />
                    <p className="text-black text-left ml-2">{item.text}</p>
                  </Link>
                </li>
              ) : (
                <li key={index} className="px-4 py-2 hover:bg-gray-100 cursor-pointer flex items-center">
                  <div className="flex items-center">
                    <Image src={item.src} width={47} height={47} />
                    <p className="text-black text-left ml-2">{item.text}</p>
                  </div>
                </li>
              )
            )}
            <li
              onClick={() => setShowLogoutConfirm(true)}
              className="px-4 py-2 hover:bg-gray-100 cursor-pointer flex items-center text-red-500 border-t"
            >
              <div className="flex items-center">
                <Image src="/icons/menu/dangxuat.jpg" width={47} height={47} />
                <p className="text-black text-lg text-left ml-2">Đăng xuất</p>
              </div>
            </li>
          </ul>
        </div>
      )}

      {showLogoutConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[10000]">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full">
            <h3 className="text-lg font-medium mb-4 text-black">Bạn có muốn đăng xuất?</h3>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowLogoutConfirm(false)}
                className="px-4 py-2 bg-gray-200 text-black font-bold rounded hover:bg-gray-300"
              >
                Không
              </button>
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-red-500 text-black font-bold rounded hover:bg-red-600"
              >
                Có
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}