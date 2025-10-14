"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import Link from "next/link";

// Utility function for debouncing (menghindari terlalu banyak panggilan API)
const debounce = (func, delay) => {
  let timeoutId;
  return (...args) => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    timeoutId = setTimeout(() => {
      func.apply(null, args);
    }, delay);
  };
};

export default function TransactionForm() {
  const [formData, setFormData] = useState({
    identifier: "", // Diubah dari nasabah_id menjadi identifier (sesuai API baru)
    transaction_type: "",
    amount: "",
    description: "",
    office_code: "",
  });
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState([]); // State untuk menampung saran
  const [isSearching, setIsSearching] = useState(false); // State loading untuk saran
  const formRef = useRef(null); // Ref untuk menutup suggestion saat klik di luar

  // Fungsi pencarian nasabah yang di-debounce
  const searchNasabah = useCallback(
    debounce(async (query) => {
      if (query.length < 3) {
        setSuggestions([]);
        setIsSearching(false);
        return;
      }

      setIsSearching(true);
      try {
        const response = await axios.get(`/api/transactions/search?q=${query}`);
        setSuggestions(response.data.customer);
      } catch (error) {
        console.error("Gagal mendapatkan saran:", error);
        setSuggestions([]);
      } finally {
        setIsSearching(false);
      }
    }, 300), // Panggilan API ditunda 300ms
    []
  );

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));

    // Panggil pencarian hanya jika field 'identifier' yang berubah
    if (name === "identifier") {
      searchNasabah(value);
    }
  };

  const handleSelectSuggestion = (customer) => {
    // Saat saran dipilih, kita mengisi input dengan ID nasabah yang sebenarnya.
    // Ini penting agar API transaksi (yang mencari ID nasabah) mendapatkan ID yang valid
    setFormData((prevData) => ({
      ...prevData,
      identifier: customer.id,
    }));
    setSuggestions([]); // Tutup daftar saran
  };

  // useEffect untuk menutup saran saat mengklik di luar form
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (formRef.current && !formRef.current.contains(event.target)) {
        setSuggestions([]);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Kirim formData (yang berisi identifier)
    try {
      const response = await axios.post("/api/transactions", formData);

      Swal.fire({
        icon: "success",
        title: "Sukses!",
        text: response.data.message,
        showConfirmButton: false,
        timer: 1500,
      });

      // Reset form setelah berhasil
      setFormData({
        identifier: "",
        transaction_type: "",
        amount: "",
        description: "",
        office_code: "",
      });
    } catch (error) {
      console.error("Gagal membuat transaksi:", error);
      const errorMessage =
        error.response?.data?.message ||
        "Terjadi kesalahan. Silakan coba lagi.";

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
    <form onSubmit={handleSubmit} className="space-y-4" ref={formRef}>
      {/* Container diubah menjadi relative untuk menampung suggestions */}
      <div className="relative">
        <label
          htmlFor="identifier"
          className="block text-sm font-medium text-gray-700"
        >
          ID/Nama/No. Rekening Nasabah
        </label>
        <input
          type="text"
          id="identifier"
          name="identifier"
          value={formData.identifier}
          onChange={handleChange}
          required
          autoComplete="off"
          placeholder="Masukkan ID, Nama Lengkap, atau Nomor Rekening"
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
        />

        {/* --- Daftar Suggestion --- */}
        {(isSearching || suggestions.length > 0) && (
          <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
            {isSearching && formData.identifier.length >= 3 && (
              <div className="p-2 text-center text-sm text-gray-500">
                Mencari...
              </div>
            )}

            {!isSearching &&
              suggestions.length === 0 &&
              formData.identifier.length >= 3 && (
                <div className="p-2 text-center text-sm text-gray-500">
                  Nasabah tidak ditemukan.
                </div>
              )}

            {suggestions.map((nasabah) => (
              <div
                key={nasabah.id}
                onClick={() => handleSelectSuggestion(nasabah)}
                className="p-3 cursor-pointer hover:bg-indigo-50 border-b border-gray-100 last:border-b-0 transition-colors duration-150"
              >
                <p className="text-sm font-medium text-gray-900">
                  {nasabah.full_name}
                </p>
                <p className="text-xs text-gray-500">
                  ID: {nasabah.nasabah_id} | Rek: {nasabah.no_alternatif}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      <div>
        <label
          htmlFor="transaction_type"
          className="block text-sm font-medium text-gray-700"
        >
          Jenis Transaksi
        </label>
        <select
          id="transaction_type"
          name="transaction_type"
          value={formData.transaction_type}
          onChange={handleChange}
          required
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
        >
          <option value="">Silahkan pilih jenis transaksi...</option>
          <option value="100">Setoran Tabungan</option>
        </select>
      </div>

      <div>
        <label
          htmlFor="amount"
          className="block text-sm font-medium text-gray-700"
        >
          Jumlah
        </label>
        <input
          type="number"
          id="amount"
          name="amount"
          value={formData.amount}
          onChange={handleChange}
          required
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
        />
      </div>

      {/* <div>
        <label
          htmlFor="description"
          className="block text-sm font-medium text-gray-700"
        >
          Deskripsi
        </label>
        <select
          id="description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          required
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
        >
          <option value="">Silahkan pilih deskripsi setoran...</option>
          <option value="Setoran Mobile Collector">
            Setoran Mobile Collector
          </option>
        </select>
      </div> */}

      <div>
        <label
          htmlFor="office_code"
          className="block text-sm font-medium text-gray-700"
        >
          Kode Kantor
        </label>
        <select
          id="office_code"
          name="office_code"
          value={formData.office_code}
          onChange={handleChange}
          required
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
        >
          <option value="">Silahkan pilih kode kantor...</option>
          <option value="111">Kantor Pusat</option>
          <option value="116">Kantor Cabang Gianyar</option>
        </select>
      </div>

      {/* <div>
        <label
          htmlFor="description"
          className="block text-sm font-medium text-gray-700"
        >
          Deskripsi
        </label>
        <textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          required
          rows="3"
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
        />
      </div> */}

      <button
        type="submit"
        disabled={loading}
        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
      >
        {loading ? "Menambahkan..." : "Tambah Transaksi"}
      </button>
      <Link href="/beranda" passHref>
        <button className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50">
          Kembali ke Beranda
        </button>
      </Link>
    </form>
  );
}
