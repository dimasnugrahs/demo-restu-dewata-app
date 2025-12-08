import Image from "next/image";
import Link from "next/link";

export const metadata = {
  title: "Restu Dewata App",
  description: "This is internal App for an employee of PT BPR Restu Dewata",
  icons: "/images/icons/logo-tab.png",
};

export default function Home() {
  return (
    <div className="">
      <div className="flex items-center justify-center">
        <Image
          className="mb-0"
          src={"/images/icons/unauthorized-01.png"}
          alt="Logo"
          width={800}
          height={100}
        />
      </div>
      <div className="flex items-center justify-center ">
        <Link
          href="/transaction"
          className="text-white px-10 mt-4 text-2xl p-2 mx-20 text-center bg-company-900 rounded-md"
        >
          Klik Untuk Menggunakan Aplikasi sebagai Marketing
        </Link>
      </div>
    </div>
  );
}
