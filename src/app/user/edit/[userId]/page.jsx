"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import DashboardLayout from "../../../components/DashboardLayout"; // Sesuaikan path
import Swal from "sweetalert2";

export default function EditUserPage() {
  const router = useRouter();
  const params = useParams(); // Mengambil parameter dari URL
  const userId = params.userId; // ID user dari URL

  const [formData, setFormData] = useState({
    full_name: "",
    username: "",
    email: "",
    role: "MARKETING",
    access_token: "",
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  // --- EFFECT 1: MEMUAT DATA USER LAMA ---
  useEffect(() => {
    if (!userId) return;

    const fetchUser = async () => {
      try {
        const response = await fetch(`/api/users/${userId}`);
        if (response.ok) {
          const data = await response.json();
          setFormData({
            full_name: data.full_name || "",
            username: data.username || "",
            email: data.email || "",
            role: data.role || "MARKETING",
            access_token: data.access_token || "",
          });
        } else {
          setError("User tidak ditemukan.");
        }
      } catch (err) {
        setError("Gagal mengambil data user.");
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [userId]);

  // Handle perubahan pada input formulir
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // --- FUNGSI UPDATE DATA (PATCH) ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        Swal.fire({
          icon: "success",
          title: "Berhasil!",
          text: "Data user berhasil diperbarui.",
          timer: 2000,
          showConfirmButton: false,
        });

        setTimeout(() => {
          router.push("/user");
        }, 2000);
      } else {
        const errData = await response.json();
        setError(errData.message || "Gagal update user.");
      }
    } catch (err) {
      setError("Terjadi kesalahan jaringan.");
    } finally {
      setLoading(false);
    }
  };

  if (loading && !formData.full_name) {
    return (
      <DashboardLayout>
        <div className="p-6">Memuat data user...</div>
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
        <div className="p-6 text-red-600">User tidak ditemukan.</div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto p-6 bg-white shadow-lg rounded-lg">
        <h1 className="text-3xl font-bold mb-6 text-company-950">
          Edit User: {formData.full_name}
        </h1>

        {error && (
          <div className="p-3 mb-4 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}
        {success && (
          <div className="p-3 mb-4 bg-green-100 border border-green-400 text-green-700 rounded">
            User berhasil diperbarui! Mengalihkan...
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Nama Lengkap
            </label>
            <input
              type="text"
              name="full_name"
              value={formData.full_name}
              onChange={handleChange}
              required
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Username
            </label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              required
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Role / Hak Akses
            </label>
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              required
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
            >
              <option value="ADMIN">ADMIN</option>
              <option value="MARKETING">MARKETING</option>
              <option value="TELLER">TELLER</option>
              <option value="SUPERADMIN">SUPERADMIN</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Token User
            </label>
            <input
              type="text"
              name="access_token"
              value={formData.access_token}
              onChange={handleChange}
              required
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
            />
          </div>

          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={() => router.back()}
              className="flex-1 py-2 px-4 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={loading}
              className={`flex-1 py-2 px-4 rounded-md text-white ${
                loading ? "bg-gray-400" : "bg-company-600 hover:bg-company-700"
              }`}
            >
              {loading ? "Menyimpan..." : "Update User"}
            </button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}
