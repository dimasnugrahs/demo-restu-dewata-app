"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import DashboardLayout from "../../../components/DashboardLayout"; // Sesuaikan path

export default function EditTransactionPage() {
  const router = useRouter();
  const params = useParams(); // Mengambil parameter dari URL
  const transactionId = params.transactionId; // ID transaction dari URL

  const [formData, setFormData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const [customerName, setCustomerName] = useState("");

  // --- EFFECT 1: MEMUAT DATA TRANSACTION LAMA ---
  useEffect(() => {
    if (!transactionId) return;

    const fetchTransaction = async () => {
      try {
        const response = await fetch(`/api/transactions/${transactionId}`);

        if (response.ok) {
          const data = await response.json();

          setCustomerName(data.customer?.full_name || "Nama Tidak Tersedia");
          // Mengisi formData dengan data yang ada
          setFormData({
            transaction_type: data.transaction_type,
            amount: data.amount,
            description: data.description || "", // Handle null/undefined
            office_code: data.office_code,
          });
        } else {
          setError("Gagal memuat data transaction.");
        }
      } catch (err) {
        console.error("Error fetching transaction:", err);
        setError("Terjadi kesalahan jaringan saat memuat data.");
      } finally {
        setLoading(false);
      }
    };

    fetchTransaction();
  }, [transactionId]);

  // Handle perubahan pada input formulir
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // --- FUNGSI UPDATE DATA (PATCH) ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    // Persiapkan data untuk dikirim ke API
    const dataToSend = {
      ...formData,
    };

    try {
      const response = await fetch(`/api/transactions/${transactionId}`, {
        method: "PATCH", // Menggunakan metode PATCH untuk update
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(dataToSend),
      });

      if (response.ok) {
        setSuccess(true);
        // Arahkan kembali ke halaman dashboard setelah 2 detik
        setTimeout(() => {
          router.push("/transactions");
        }, 2000);
      } else {
        const errorData = await response.json();
        setError(errorData.message || "Gagal memperbarui transaksi.");
      }
    } catch (err) {
      console.error("Error updating transaction:", err);
      setError("Terjadi kesalahan jaringan saat update.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="p-6">Memuat data transaksi...</div>
      </DashboardLayout>
    );
  }

  if (error && !formData) {
    return (
      <DashboardLayout>
        <div className="p-6 text-red-600">Error: {error}</div>
      </DashboardLayout>
    );
  }

  if (!formData) {
    return (
      <DashboardLayout>
        <div className="p-6 text-red-600">Transaksi tidak ditemukan.</div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto p-6 bg-white shadow-lg rounded-lg">
        <h1 className="text-3xl font-bold mb-6 text-company-950">
          Edit Transaksi
        </h1>

        {error && (
          <div className="p-3 mb-4 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}
        {success && (
          <div className="p-3 mb-4 bg-green-100 border border-green-400 text-green-700 rounded">
            Transaksi berhasil diperbarui! Mengalihkan...
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Input Nama Lengkap */}
          <label
            htmlFor="customer_name"
            className="block text-sm font-medium text-gray-700"
          >
            Nama Pelanggan
          </label>
          {/* Tampilkan customerName dari state terpisah */}
          <p
            id="customer_name"
            className="mt-1 block w-full bg-gray-100 border border-gray-300 rounded-md shadow-sm p-2 text-gray-900"
          >
            {customerName}
          </p>

          {/* Input Nama Lengkap */}
          <div>
            <label
              htmlFor="transaction_type"
              className="block text-sm font-medium text-gray-700"
            >
              Transaction Type
            </label>
            <input
              type="text"
              name="transaction_type"
              id="transaction_type"
              value={formData.transaction_type}
              onChange={handleChange}
              required
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
            />
          </div>

          {/* Input Jumlah (amount) */}
          <div>
            <label
              htmlFor="amount"
              className="block text-sm font-medium text-gray-700"
            >
              Jumlah
            </label>
            <input
              type="text"
              name="amount"
              id="amount"
              value={formData.amount}
              onChange={handleChange}
              required
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
            />
          </div>

          {/* Input description */}
          <div>
            <label
              htmlFor="description"
              className="block text-sm font-medium text-gray-700"
            >
              Description
            </label>
            <input
              type="text"
              name="description"
              id="description"
              value={formData.description}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
            />
          </div>

          {/* Input Type Transaction */}
          <div>
            <label
              htmlFor="office_code"
              className="block text-sm font-medium text-gray-700"
            >
              Kode Kantor
            </label>
            <select
              name="office_code"
              id="office_code"
              value={formData.office_code}
              onChange={handleChange}
              required
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
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

          {/* Tombol Submit */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
              loading ? "bg-gray-400" : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {loading ? "Memperbarui..." : "Perbarui Transaksi"}
          </button>
        </form>
      </div>
    </DashboardLayout>
  );
}
