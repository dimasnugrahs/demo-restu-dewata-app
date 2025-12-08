"use client";

import { useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";

/**
 * Komponen tombol untuk mengekspor data transaksi yang difilter
 * berdasarkan nama marketing melalui API Backend.
 *
 * @param {string} marketingName - Nama marketing lengkap yang dipilih.
 */
export default function ExportMarketingButton({ marketingName }) {
  const [isExporting, setIsExporting] = useState(false);

  // Potong nama marketing untuk tampilan tombol
  const truncatedName = marketingName.substring(0, 10);
  const buttonLabel = `Export List (${truncatedName}${
    marketingName.length > 10 ? "..." : ""
  })`;

  const handleExport = async () => {
    if (!marketingName) {
      Swal.fire("Gagal!", "Marketing belum dipilih.", "warning");
      return;
    }

    setIsExporting(true);

    try {
      // Panggil API export baru di backend.
      // Kami meneruskan nama marketing sebagai query parameter.
      const response = await axios.get("/api/transactions/filterMarketing", {
        params: {
          marketingName: marketingName, // Nilai yang dikirim ke req.query.marketingName
        },
        responseType: "blob",
      });

      // Membuat URL Blob untuk file
      const blob = new Blob([response.data], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      const url = window.URL.createObjectURL(blob);

      // Membuat elemen link sementara untuk memicu download
      const link = document.createElement("a");
      link.href = url;

      // Mendapatkan nama file dari header Content-Disposition atau menggunakan default
      const contentDisposition = response.headers["content-disposition"];
      let fileName = `Transaksi_${marketingName.replace(
        /[^a-z0-9]/gi,
        "_"
      )}_${new Date().toISOString().slice(0, 10)}.xlsx`;

      if (contentDisposition) {
        const match = contentDisposition.match(/filename="([^"]+)"/);
        if (match && match[1]) {
          fileName = match[1];
        }
      }

      link.setAttribute("download", fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      Swal.fire({
        icon: "success",
        title: "Download Sukses!",
        text: `Laporan transaksi untuk ${marketingName} telah diunduh.`,
        timer: 1500,
        showConfirmButton: false,
      });
    } catch (error) {
      console.error("Export failed:", error);

      let errorMessage = "Terjadi kesalahan saat mengunduh laporan.";

      // Logika untuk membaca pesan error dari blob response (seperti di format Anda)
      if (error.response && error.response.data instanceof Blob) {
        // Karena respons error bisa berupa Blob, kita perlu membacanya sebagai teks
        error.response.data.text().then((text) => {
          try {
            const data = JSON.parse(text);
            errorMessage = data.message || errorMessage;
          } catch (e) {
            // Jika gagal parse JSON, gunakan pesan error default
          }
          Swal.fire({
            icon: "error",
            title: "Gagal Export",
            text: errorMessage,
          });
        });
      } else {
        // Jika error bukan Blob (misalnya error jaringan)
        Swal.fire({ icon: "error", title: "Gagal Export", text: errorMessage });
      }
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <button
      onClick={handleExport}
      // Menonaktifkan jika sedang mengekspor atau jika marketing belum dipilih
      disabled={isExporting || !marketingName}
      className="py-2 ml-2 px-4 mb-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition duration-150 ease-in-out"
    >
      {isExporting ? (
        // SVG Loading Spinner Anda
        <>
          <svg
            className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          Mengekspor...
        </>
      ) : (
        // Label Tombol
        buttonLabel
      )}
    </button>
  );
}
