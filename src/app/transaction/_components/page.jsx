"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import Link from "next/link";

const formatCurrency = (value) => {
  // Hanya ambil angka (atau string angka)
  if (value === null || value === undefined || value === "") return "";

  // Pastikan value adalah number sebelum formatting
  const numberValue = parseFloat(value);
  if (isNaN(numberValue)) return "";

  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })
    .format(numberValue)
    .replace("Rp", "")
    .trim(); // Hapus 'Rp ' agar input lebih bersih
};

/**
 * Menghapus pemformatan agar menjadi angka murni (e.g., "1000000")
 */
const cleanCurrencyFormat = (formattedString) => {
  if (typeof formattedString !== "string") return "";
  // Hapus semua karakter non-digit kecuali tanda koma (jika desimal diizinkan)
  // Untuk kasus ini (IDR/rupiah), kita hanya ambil digit
  return formattedString.replace(/[^\d]/g, "");
};

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

  // State baru: Menyimpan teks yang ditampilkan di input (misalnya: "1234 - Nama Lengkap")
  const [displayIdentifier, setDisplayIdentifier] = useState("");

  // State baru untuk input Jumlah yang diformat (yang terlihat oleh pengguna)
  const [displayAmount, setDisplayAmount] = useState("");

  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState([]); // State untuk menampung saran
  const [isSearching, setIsSearching] = useState(false); // State loading untuk saran
  const formRef = useRef(null); // Ref untuk menutup suggestion saat klik di luar

  // Sinkronisasi displayAmount saat formData.amount di-reset (misal setelah submit sukses)
  useEffect(() => {
    // Jika formData.amount berubah (misalnya menjadi "" setelah reset), update tampilan
    if (formData.amount === "") {
      setDisplayAmount("");
    } else {
      // Jika ada nilai, format ulang untuk ditampilkan
      setDisplayAmount(formatCurrency(formData.amount));
    }
  }, [formData.amount]);

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

    if (name === "amount-display") {
      const cleanedValueString = cleanCurrencyFormat(value);
      const numericValue = parseInt(cleanedValueString, 10) || "";

      // 1. Simpan nilai MURNI (Number/String Number) ke formData
      setFormData((prevData) => ({
        ...prevData,
        amount: numericValue,
      }));

      // 2. Set displayAmount dengan nilai yang terformat
      // Ini akan memicu useEffect di atas (atau kita bisa langsung set di sini)
      // Kita langsung set di sini untuk feedback visual yang lebih cepat
      setDisplayAmount(formatCurrency(numericValue));

      return; // Hentikan fungsi agar tidak masuk ke setFormData umum
    }

    if (name === "identifier-display") {
      // Gunakan nama baru untuk input tampilan

      // Saat pengguna mengetik, set displayIdentifier ke value yang diketik.
      setDisplayIdentifier(value);

      // Set formData.identifier ke value yang diketik.
      // Ini akan berisi string pencarian (misal: "budi"),
      // dan akan diganti dengan ID murni saat saran dipilih.
      setFormData((prevData) => ({
        ...prevData,
        identifier: value,
      }));

      // Panggil pencarian nasabah
      searchNasabah(value);
      return;
    }

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
    const formattedDisplay = `${customer.id} - ${customer.full_name}`;

    setDisplayIdentifier(formattedDisplay);
    // Saat saran dipilih, kita mengisi input dengan ID nasabah yang sebenarnya.
    // Ini penting agar API transaksi (yang mencari ID nasabah) mendapatkan ID yang valid
    setFormData((prevData) => ({
      ...prevData,
      identifier: customer.id, // ID nasabah yang murni
    }));

    setSuggestions([]);
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

      setDisplayIdentifier("");

      setDisplayAmount("");
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
          id="identifier-display"
          name="identifier-display"
          value={displayIdentifier}
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

      {/* <div>
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
          placeholder="0.00"
          step="0.01"
          min="0"
          value={formData.amount}
          onChange={handleChange}
          required
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
        />
      </div> */}

      <div>
        <label
          htmlFor="amount-display"
          className="block text-sm font-medium text-gray-700"
        >
          Jumlah
        </label>
        <div className="relative mt-1">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 pr-2 text-gray-500 sm:text-sm">
            Rp
          </span>
          <input
            type="text"
            id="amount-display"
            name="amount-display"
            value={displayAmount}
            onChange={handleChange}
            required
            placeholder="0"
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
        </div>
        {/* Input Tersembunyi untuk menyimpan nilai angka murni */}
        <input type="hidden" name="amount" value={formData.amount} />
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
          <option value="111">ROSA JUANITA</option>
          <option value="116">NI LUH AYU RIKAYANTI</option>
          <option value="139">NI LUH WAYAN MIRAH AYU PUSPASARI</option>
          <option value="136">TELLER PUSAT (Pengganti)</option>
          <option value="129">TELLER CABANG (Pengganti)</option>
          <option value="138">TELLER KAS (Pengganti)</option>
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
