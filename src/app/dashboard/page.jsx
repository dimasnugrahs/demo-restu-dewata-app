// src/app/dashboard/page.jsx

"use client";

import { useRouter } from "next/navigation";
import axios from "axios";
import Swal from "sweetalert2";
import DashboardLayout from "../components/DashboardLayout";
import { useEffect, useState } from "react";

export default function DashboardPage() {
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

  const handleLogout = async () => {
    try {
      await axios.post("/api/auth/logout");

      // Menampilkan notifikasi sukses
      Swal.fire({
        icon: "success",
        title: "Sukses",
        text: "Anda telah berhasil logout!",
        showConfirmButton: false,
        timer: 1500,
      });

      // PENTING: Panggil router.refresh() untuk memicu middleware.
      // Middleware akan melihat cookie yang hilang dan mengalihkan ke halaman login.
      router.refresh();
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
    <div>
      <div>
        <DashboardLayout>
          <h1 className="text-4xl font-bold mb-4 text-white">
            Selamat Datang di Dashboard
          </h1>
          <p className="text-lg text-white">
            Ini adalah konten utama halaman dashboard Anda.
          </p>
          <h1 className="text-lg text-white mt-10">
            Selamat datang, {user.email}!
          </h1>
          <p className="text-lg text-white">ID Pengguna: {user.id}</p>
          <p className="text-lg text-white">Peran: {user.role}</p>
        </DashboardLayout>

        <button
          onClick={handleLogout}
          style={{
            marginTop: "2rem",
            padding: "0.75rem 1.5rem",
            backgroundColor: "#dc3545",
            color: "#fff",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          Logout
        </button>
      </div>
    </div>
  );
}
