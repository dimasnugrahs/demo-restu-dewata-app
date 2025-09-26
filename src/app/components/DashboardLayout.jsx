"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import LogoutButton from "./LogoutButton"; // Import komponen LogoutButton

// Komponen untuk setiap item navigasi
const NavItem = ({ href, name, icon: Icon, pathname }) => {
  const isActive = pathname === href;
  return (
    <Link
      href={href}
      className={`
        flex flex-col items-center justify-center p-2 text-center
        md:flex-row md:items-center md:justify-start md:space-x-2 md:py-2 md:px-4 md:rounded-md
        transition-colors duration-200
        ${
          isActive
            ? "text-company-50 md:bg-company-800"
            : "text-gray-500 hover:text-blue-600"
        }
      `}
    >
      <Icon className="w-6 h-6 md:w-5 md:h-5 mb-1 md:mb-0" />
      <span className="md:block">{name}</span>
    </Link>
  );
};

// Placeholder untuk ikon, Anda bisa menggantinya dengan library ikon seperti Heroicons atau Lucide
const HomeIcon = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    className="size-6"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25"
    />
  </svg>
);
const UsersIcon = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    className="size-6"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m.94 3.198.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0 1 12 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 0 1 6 18.719m12 0a5.971 5.971 0 0 0-.941-3.197m0 0A5.995 5.995 0 0 0 12 12.75a5.995 5.995 0 0 0-5.058 2.772m0 0a3 3 0 0 0-4.681 2.72 8.986 8.986 0 0 0 3.74.477m.94-3.197a5.971 5.971 0 0 0-.94 3.197M15 6.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm6 3a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Zm-13.5 0a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Z"
    />
  </svg>
);
const TransactionsIcon = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    className="size-6"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M6.429 9.75 2.25 12l4.179 2.25m0-4.5 5.571 3 5.571-3m-11.142 0L2.25 7.5 12 2.25l9.75 5.25-4.179 2.25m0 0L21.75 12l-4.179 2.25m0 0 4.179 2.25L12 21.75 2.25 16.5l4.179-2.25m11.142 0-5.571 3-5.571-3"
    />
  </svg>
);
const UserIcon = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    className="size-6"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z"
    />
  </svg>
);

const navItems = [
  { name: "Home", href: "/beranda", icon: HomeIcon },
  { name: "Customers", href: "/customer", icon: UsersIcon },
  { name: "All Transaction", href: "/transactions", icon: TransactionsIcon },
  { name: "Transaction", href: "/transaction", icon: TransactionsIcon },
  { name: "Marketing", href: "/marketing", icon: UserIcon },
];

export default function DashboardLayout({ children }) {
  const pathname = usePathname();

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-company-50">
      {/* Sidebar untuk Layar Lebar */}
      <aside className="hidden md:flex flex-col bg-company-100 text-gray-700 w-64 md:w-80 space-y-6 py-7 px-2 justify-between">
        <div>
          <div className="flex items-center px-2">
            <Link href="/" className="text-blue-950 text-2xl p-2 rounded-md">
              Restu Dewata App
            </Link>
          </div>

          <nav className="space-y-2 px-2 font-normal mt-6">
            {navItems.map((item) => (
              <NavItem key={item.name} {...item} pathname={pathname} />
            ))}
          </nav>
        </div>

        {/* Tombol Logout di bagian bawah sidebar */}
        <div className="px-2 pb-4 hidden md:flex">
          <LogoutButton />
        </div>
      </aside>

      {/* Konten Utama */}
      <main className="flex-1 p-4 md:p-8 overflow-y-auto">{children}</main>

      {/* Navbar Bawah untuk Layar HP */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
        <div className="flex justify-around items-center h-16">
          {navItems.map((item) => (
            <NavItem key={item.name} {...item} pathname={pathname} />
          ))}
        </div>
      </nav>
    </div>
  );
}
