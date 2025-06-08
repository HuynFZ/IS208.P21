import Image from "next/image";
import AvatarMenu from "../menuthaxuong/avatar";
import { useSession } from "next-auth/react";

const ThanhdhDN = () => {
  const { data: session } = useSession();
  const role = session?.user?.role || "";

  return (
    <header className="w-full p-4 bg-teal-100 flex justify-between items-center shadow-md">
      <div className="flex items-center">
        <Image src="/logo.jpg" alt="TalentHub Logo" width={50} height={50} />
        <h1 className="text-black text-2xl font-bold ml-2">TalentHub</h1>
      </div>
      <AvatarMenu userType={role} />
    </header>
  );
};

export default ThanhdhDN;