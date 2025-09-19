// src/app/components/DashboardLayout.jsx

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

// Komponen untuk setiap item navigasi
const NavItem = ({ href, name, icon: Icon, pathname }) => {
  const isActive = pathname === href;
  return (
    <Link
      href={href}
      className={`
        flex flex-col items-center justify-center p-2 text-center text-sm
        md:flex-row md:items-center md:justify-start md:space-x-2 md:py-2 md:px-4 md:rounded-md
        transition-colors duration-200
        ${
          isActive
            ? "text-blue-600 dark:text-blue-400 font-semibold md:bg-blue-100 dark:md:bg-gray-700"
            : "text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"
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
    {...props}
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0h6m-5-9l5-5 5 5-5-5-5 5z"
    />
  </svg>
);
const DashboardIcon = (props) => (
  <svg
    {...props}
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M16 8v-1m-4 5v-1m-4 5v-1m4 0h12a2 2 0 002-2v-8a2 2 0 00-2-2H4a2 2 0 00-2 2v8a2 2 0 002 2h12zm-8-3h8M4 20h16"
    />
  </svg>
);
const SettingsIcon = (props) => (
  <svg
    {...props}
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37a1.724 1.724 0 002.572-1.065z"
    />
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
    />
  </svg>
);

const navItems = [
  { name: "Beranda", href: "/beranda", icon: HomeIcon },
  { name: "Dashboard", href: "/dashboard", icon: DashboardIcon },
  { name: "Pengaturan", href: "/setting", icon: SettingsIcon },
  { name: "DashboardX", href: "/dashboardx", icon: DashboardIcon },
];

export default function DashboardLayout({ children }) {
  const pathname = usePathname();

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gray-100 dark:bg-gray-900">
      {/* Sidebar untuk Layar Lebar */}
      <aside className="hidden md:flex flex-col bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 w-64 md:w-80 space-y-6 py-7 px-2">
        <div className="flex items-center px-4">
          <Link
            href="/"
            className="text-2xl font-bold text-gray-900 dark:text-white"
          >
            <span className="text-blue-600 dark:text-blue-400">Restu</span> App
          </Link>
        </div>

        <nav className="space-y-2">
          {navItems.map((item) => (
            <NavItem key={item.name} {...item} pathname={pathname} />
          ))}
        </nav>
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
