import Image from "next/image";
import Link from "next/link";

export const metadata = {
  title: "Restu Dewata App",
  description: "This is internal App for an employee of PT BPR Restu Dewata",
  icons: "/images/icons/logo-tab.png",
};

export default function Home() {
  return (
    <div>
      <div>Welcome to Restu Dewata App</div>
      <Link
        href="/beranda"
        className="text-blue-950 text-2xl p-2 bg-company-200 rounded-md"
      >
        Restu App
      </Link>
    </div>
  );
}
