"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import DashboardLayout from "../../../components/DashboardLayout"; // Sesuaikan path

export default function EditCustomerPage() {
  const router = useRouter();
  const params = useParams(); // Mengambil parameter dari URL
  const customerId = params.customerId; // ID customer dari URL

  const [formData, setFormData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  // --- EFFECT 1: MEMUAT DATA CUSTOMER LAMA ---
  useEffect(() => {
    if (!customerId) return;

    const fetchCustomer = async () => {
      try {
        const response = await fetch(`/api/customers/${customerId}`);

        if (response.ok) {
          const data = await response.json();
          // Mengisi formData dengan data yang ada
          setFormData({
            full_name: data.full_name,
            nasabah_id: data.nasabah_id,
            no_alternatif: data.no_alternatif || "", // Handle null/undefined
            type_customer: data.type_customer,
            // Penting: Pastikan account_balance adalah string untuk input type="number"
            account_balance: data.account_balance
              ? String(data.account_balance)
              : "0",
            address: data.address || "",
            created_by_user_id: data.created_by_user_id, // Diperlukan untuk PATCH API
          });
        } else {
          setError("Gagal memuat data customer.");
        }
      } catch (err) {
        console.error("Error fetching customer:", err);
        setError("Terjadi kesalahan jaringan saat memuat data.");
      } finally {
        setLoading(false);
      }
    };

    fetchCustomer();
  }, [customerId]);

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
      // Pastikan account_balance dikirim sebagai angka (meskipun diubah lagi di backend)
      account_balance: parseFloat(formData.account_balance),
    };

    try {
      const response = await fetch(`/api/customers/${customerId}`, {
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
          router.push("/customer");
        }, 2000);
      } else {
        const errorData = await response.json();
        setError(errorData.message || "Gagal memperbarui customer.");
      }
    } catch (err) {
      console.error("Error updating customer:", err);
      setError("Terjadi kesalahan jaringan saat update.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="p-6">Memuat data customer...</div>
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
        <div className="p-6 text-red-600">Customer tidak ditemukan.</div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto p-6 bg-white shadow-lg rounded-lg">
        <h1 className="text-3xl font-bold mb-6 text-company-950">
          Edit Customer: {formData.full_name}
        </h1>

        {error && (
          <div className="p-3 mb-4 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}
        {success && (
          <div className="p-3 mb-4 bg-green-100 border border-green-400 text-green-700 rounded">
            Customer berhasil diperbarui! Mengalihkan...
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
              Saldo Akun
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
              loading ? "bg-gray-400" : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {loading ? "Memperbarui..." : "Perbarui Customer"}
          </button>
        </form>
      </div>
    </DashboardLayout>
  );
}
