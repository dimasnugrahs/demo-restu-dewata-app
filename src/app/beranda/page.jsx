"use client";

import { useRouter } from "next/navigation";
import DashboardLayout from "../components/DashboardLayout";
import { useEffect, useState } from "react";

export default function BerandaPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await fetch("/api/auth/users");

        if (response.ok) {
          // Menggunakan response.ok untuk memeriksa status 200
          const data = await response.json();
          setUser(data.user);
        } else {
          // Redirect jika tidak terautentikasi atau terjadi kesalahan
          router.push("/auth");
        }
      } catch (error) {
        console.error("Failed to fetch user data:", error);
        router.push("/auth");
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [router]);

  if (loading) {
    return <div>Memuat data pengguna...</div>;
  }

  if (!user) {
    // Tampilkan pesan error atau redirect jika user tidak ada
    return <div>Silakan login untuk mengakses halaman ini.</div>;
  }

  return (
    <DashboardLayout>
      <h1 className="text-4xl font-bold mb-4 text-white">
        Selamat Datang di Beranda
      </h1>
      <p className="text-lg text-gray-700 dark:text-gray-300">
        Ini adalah halaman beranda utama.
      </p>
      <h1 className="text-lg text-white mt-10">
        Selamat datang, {user.email}!
      </h1>
      <p className="text-lg text-white">ID Pengguna: {user.id}</p>
      <p className="text-lg text-white">Peran: {user.role}</p>
    </DashboardLayout>
  );
}
