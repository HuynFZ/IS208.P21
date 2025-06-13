import Link from "next/link";
import Image from "next/image";

const Thanhdh0DN = () => {
  return (
    <header className="w-full p-4 bg-teal-100 flex justify-between items-center shadow-md">
            <div className="flex items-center">
            <Link href="/" className="flex items-center">
                <Image src="/logo.jpg" alt="TalentHub Logo" width={50} height={50} />            
                <h1
                  className="text-black text-2xl font-bold ml-2">TalentHub</h1>
              </Link>
            </div>
            <div>
              <Link href="/dangnhap_ky/dangnhap">
                <button className="mr-4 bg-teal-600 text-black font-semibold py-2 px-3 rounded-full shadow hover:bg-teal-700">
                  Đăng nhập
                </button>
              </Link>

              <Link href="/dangnhap_ky/dkVaitro">
                <button className="bg-teal-600 text-black font-semibold py-2 px-5 rounded-full shadow hover:bg-teal-700">
                  Đăng ký
                </button>
              </Link>
            </div>
        
    </header>
  );
};

export default Thanhdh0DN;
