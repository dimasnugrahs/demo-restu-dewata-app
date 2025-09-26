"use client";

import { useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";

export default function TransactionForm() {
  const [formData, setFormData] = useState({
    nasabah_id: "",
    transaction_type: "",
    amount: "",
    description: "",
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Panggil API transaksi
      const response = await axios.post("/api/transactions", formData);

      // Tampilkan notifikasi sukses
      Swal.fire({
        icon: "success",
        title: "Sukses!",
        text: response.data.message,
        showConfirmButton: false,
        timer: 1500,
      });

      // Reset form setelah berhasil
      setFormData({
        nasabah_id: "",
        transaction_type: "",
        amount: "",
        description: "",
      });
    } catch (error) {
      console.error("Gagal membuat transaksi:", error);
      const errorMessage =
        error.response?.data?.message ||
        "Terjadi kesalahan. Silakan coba lagi.";

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
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label
          htmlFor="nasabah_id"
          className="block text-sm font-medium text-gray-700"
        >
          ID Nasabah
        </label>
        <input
          type="text"
          id="nasabah_id"
          name="nasabah_id"
          value={formData.nasabah_id}
          onChange={handleChange}
          required
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
        />
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
          <option value="">Pilih...</option>
          <option value="deposit">Deposit</option>
          <option value="withdraw">Withdraw</option>
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

      <div>
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
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
      >
        {loading ? "Menambahkan..." : "Tambah Transaksi"}
      </button>
    </form>
  );
}
