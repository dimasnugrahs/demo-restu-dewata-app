"use client";

import axios from "axios";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";

export default function LogoutButton() {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      // 1. Panggil API untuk menghapus sesi/cookie di server
      await axios.post("/api/auth/logout");

      // 2. Tampilkan notifikasi sukses
      Swal.fire({
        icon: "success",
        title: "Sukses",
        text: "Anda telah berhasil logout!",
        showConfirmButton: false,
        timer: 1500,
      });

      // 3. Panggil router.refresh() untuk memicu middleware (opsional)
      // Ini memastikan state autentikasi klien/server di-sinkronkan.
      router.refresh();

      // 4. >>> PERBAIKAN: Arahkan pengguna ke halaman login setelah jeda notifikasi.
      // Kita beri sedikit waktu (sekitar 1.5 detik) agar notifikasi sempat terlihat sebelum redirect.
      setTimeout(() => {
        router.push("/auth");
      }, 1500); // 1500ms sama dengan durasi timer Swal
    } catch (err) {
      console.error(err);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Gagal logout. Silakan coba lagi.",
      });
    }
  };

  return (
    <button
      onClick={handleLogout}
      className="bg-red-500 hover:bg-red-600 text-white py-2 px-4 w-full rounded transition-colors duration-300"
    >
      Logout
    </button>
  );
}
