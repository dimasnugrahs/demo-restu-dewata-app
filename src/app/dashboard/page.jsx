// src/app/dashboard/page.jsx

"use client";

import { useRouter } from "next/navigation";
import axios from "axios";
import Swal from "sweetalert2";

export default function DashboardPage() {
  const router = useRouter();

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
    <div
      style={{
        fontFamily: "sans-serif",
        padding: "2rem",
        backgroundColor: "#f0f2f5",
        minHeight: "100vh",
      }}
    >
      <div
        style={{
          maxWidth: "800px",
          margin: "0 auto",
          backgroundColor: "#fff",
          padding: "2rem",
          borderRadius: "8px",
          boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
        }}
      >
        <h1 style={{ color: "#333" }}>Selamat Datang di Dashboard Marketing</h1>
        <p style={{ color: "#666" }}>
          Anda telah berhasil login. Di sini Anda bisa mulai mengelola data
          transaksi.
        </p>

        <div style={{ marginTop: "2rem" }}>
          <h2 style={{ color: "#444" }}>Form Input Transaksi Harian</h2>
          <p>Fitur input transaksi akan diletakkan di sini.</p>
        </div>

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
