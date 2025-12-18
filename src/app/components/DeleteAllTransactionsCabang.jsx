"use client";

import { useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";

export default function DeleteAllTransactionsCabangButton() {
  const [loading, setLoading] = useState(false);

  const handleDeleteAll = async () => {
    // 1. Tampilkan dialog konfirmasi PERINGATAN
    const result = await Swal.fire({
      icon: "warning",
      title: "Apakah Anda Yakin?",
      text: "Tindakan ini akan menghapus SEMUA data transaksi secara permanen dan tidak dapat dikembalikan. Lanjutkan?",
      showCancelButton: true,
      confirmButtonText: "Ya, Hapus Semua!",
      cancelButtonText: "Batal",
      reverseButtons: true,
      confirmButtonColor: "#dc2626", // Warna merah
    });

    // 2. Jika pengguna membatalkan, hentikan proses
    if (!result.isConfirmed) {
      return;
    }

    setLoading(true);

    try {
      // Panggil API DELETE dengan parameter deleteAll=true
      const response = await axios.delete(
        "/api/transactions/cleanupcabang?deleteAll=true"
      );

      // Tampilkan notifikasi sukses
      Swal.fire({
        icon: "success",
        title: "Berhasil Dihapus!",
        text: response.data.message,
        showConfirmButton: false,
        timer: 3000,
      });

      // Catatan: Setelah ini, Anda mungkin perlu memicu refresh data transaksi
      // di komponen induk (jika ada daftar transaksi di halaman yang sama).
    } catch (error) {
      console.error("Gagal menghapus transaksi:", error);
      const errorMessage =
        error.response?.data?.message ||
        "Terjadi kesalahan saat menghapus data transaksi.";

      // Tampilkan notifikasi error
      Swal.fire({
        icon: "error",
        title: "Gagal!",
        text: errorMessage,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleDeleteAll}
      disabled={loading}
      className="py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 disabled:opacity-50 transition duration-150 ease-in-out"
    >
      {loading ? "Menghapus..." : "Hapus SEMUA Transaksi Permanen (Cabang)"}
    </button>
  );
}
