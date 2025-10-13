"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "../../components/DashboardLayout"; // Sesuaikan path jika perlu

export default function CreateCustomerPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    full_name: "",
    nasabah_id: "",
    no_alternatif: "",
    type_customer: "", // Default value
    account_balance: 0,
    address: "",
    // created_by_user_id tidak perlu diisi di frontend, biarkan backend yang mengurus
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  // Handle perubahan pada input formulir
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "account_balance" ? parseFloat(value) || 0 : value,
    }));
  };

  // Handle pengiriman formulir
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await fetch("/api/customers", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setSuccess(true);
        // Opsional: Reset formulir atau redirect
        setFormData({
          full_name: "",
          nasabah_id: "",
          no_alternatif: "",
          type_customer: "",
          account_balance: 0,
          address: "",
        });

        // Arahkan kembali ke halaman daftar customer setelah 2 detik
        setTimeout(() => {
          router.push("/customer");
        }, 2000);
      } else {
        const errorData = await response.json();
        setError(errorData.message || "Gagal membuat customer.");
      }
    } catch (err) {
      console.error("Error creating customer:", err);
      setError("Terjadi kesalahan jaringan.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto p-6 bg-white shadow-lg rounded-lg">
        <h1 className="text-3xl font-bold mb-6 text-company-950">
          Buat Customer Baru
        </h1>

        {error && (
          <div className="p-3 mb-4 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}
        {success && (
          <div className="p-3 mb-4 bg-green-100 border border-green-400 text-green-700 rounded">
            Customer berhasil dibuat! Mengalihkan...
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Input Nama Lengkap */}
          <div>
            <label
              htmlFor="full_name"
              className="block text-sm font-medium text-gray-700"
            >
              Nama Lengkap
            </label>
            <input
              type="text"
              name="full_name"
              id="full_name"
              value={formData.full_name}
              onChange={handleChange}
              required
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
            />
          </div>

          {/* Input No Rekening (nasabah_id) */}
          <div>
            <label
              htmlFor="nasabah_id"
              className="block text-sm font-medium text-gray-700"
            >
              No Rekening
            </label>
            <input
              type="text"
              name="nasabah_id"
              id="nasabah_id"
              value={formData.nasabah_id}
              onChange={handleChange}
              required
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
            />
          </div>

          {/* Input No Rek Alternatif */}
          <div>
            <label
              htmlFor="no_alternatif"
              className="block text-sm font-medium text-gray-700"
            >
              No Rek Alternatif
            </label>
            <input
              type="text"
              name="no_alternatif"
              id="no_alternatif"
              value={formData.no_alternatif}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
            />
          </div>

          {/* Input Type Customer */}
          <div>
            <label
              htmlFor="type_customer"
              className="block text-sm font-medium text-gray-700"
            >
              Kode Kantor/Type Customer
            </label>
            <select
              name="type_customer"
              id="type_customer"
              value={formData.type_customer}
              onChange={handleChange}
              required
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
            >
              <option value="">Pilih Kode Kantor...</option>
              <option value="111">KANTOR PUSAT</option>
              <option value="116">KANTOR CABANG</option>
            </select>
          </div>

          {/* Input Account Balance */}
          <div>
            <label
              htmlFor="account_balance"
              className="block text-sm font-medium text-gray-700"
            >
              Saldo Awal
            </label>
            <input
              type="number"
              name="account_balance"
              id="account_balance"
              value={formData.account_balance}
              onChange={handleChange}
              min="0"
              required
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
            />
          </div>

          {/* Input Address */}
          <div>
            <label
              htmlFor="address"
              className="block text-sm font-medium text-gray-700"
            >
              Alamat
            </label>
            <textarea
              name="address"
              id="address"
              value={formData.address}
              onChange={handleChange}
              rows="3"
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
            />
          </div>

          {/* Tombol Submit */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
              loading ? "bg-gray-400" : "bg-company-600 hover:bg-company-700"
            }`}
          >
            {loading ? "Menyimpan..." : "Simpan Customer"}
          </button>
        </form>
      </div>
    </DashboardLayout>
  );
}
