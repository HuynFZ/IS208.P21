import Image from "next/image";
import AvatarMenu from "../menuthaxuong/avatar";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";

const ThanhdhDN = () => {
  const { data: session } = useSession();
  const role = session?.user?.role || "";
  const router = useRouter();

  return (
    <header className="w-full p-4 bg-teal-100 flex justify-between items-center shadow-md">
      <div className="flex items-center">
        <button
          onClick={() => router.push("/")}
          className="p-0 m-0 bg-transparent border-none outline-none"
        >
          <Image
            src="/icons/avatar.jpg"
            alt="Logo"
            width={40}
            height={40}
            className="rounded-full object-cover"
          />
        </button>
        <h1 className="text-black text-2xl font-bold ml-2">TalentHub</h1>
      </div>
      <AvatarMenu userType={role} />
    </header>
  );
};

export default ThanhdhDN;
