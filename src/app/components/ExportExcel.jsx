"use client";

import { useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";

export default function ExportButton() {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      // Panggil API export
      const response = await axios.get("/api/exportexcel", {
        responseType: "blob", // Penting: memberitahu axios untuk mengharapkan respons biner (file)
      });

      // Membuat URL Blob untuk file yang di-download
      const blob = new Blob([response.data], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      const url = window.URL.createObjectURL(blob);

      // Membuat elemen link sementara untuk memicu download
      const link = document.createElement("a");
      link.href = url;

      // Mengambil nama file dari header Content-Disposition (jika ada) atau menggunakan default
      const contentDisposition = response.headers["content-disposition"];
      let fileName = `Laporan_Transaksi_${new Date()
        .toISOString()
        .slice(0, 10)}.xlsx`;
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
        text: "Laporan Excel telah diunduh.",
        timer: 1500,
        showConfirmButton: false,
      });
    } catch (error) {
      console.error("Export failed:", error);

      // Coba parse error response jika bukan blob
      let errorMessage = "Terjadi kesalahan saat mengunduh laporan.";
      if (error.response && error.response.data) {
        try {
          const text = await error.response.data.text();
          const data = JSON.parse(text);
          errorMessage = data.message || errorMessage;
        } catch (e) {
          // Biarkan error message default
        }
      }

      Swal.fire({
        icon: "error",
        title: "Gagal Export",
        text: errorMessage,
      });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <button
      onClick={handleExport}
      disabled={isExporting}
      className="flex items-center justify-center mb-2 mt-4 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-company-800 hover:bg-company-900 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 transition duration-150 ease-in-out"
    >
      {isExporting ? (
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
        <>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 mr-2"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
          Export ke Excel
        </>
      )}
    </button>
  );
}
