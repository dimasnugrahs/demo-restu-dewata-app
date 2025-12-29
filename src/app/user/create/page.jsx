"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "../../components/DashboardLayout"; // Sesuaikan path jika perlu
import Swal from "sweetalert2";

export default function CreateUserPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    full_name: "",
    username: "",
    email: "",
    password_hash: "",
    role: "MARKETING", // Default value
    access_token: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  // Handle perubahan pada input formulir
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle pengiriman formulir
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/users", {
        // Sesuaikan dengan path API register Anda
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        Swal.fire({
          icon: "success",
          title: "Berhasil!",
          text: "User baru berhasil didaftarkan.",
          timer: 2000,
          showConfirmButton: false,
        });

        // Redirect ke daftar user setelah sukses
        setTimeout(() => {
          router.push("/user"); // Sesuaikan route tujuan
        }, 2000);
      } else {
        const errorText = await response.text();
        setError(errorText || "Gagal membuat user.");
      }
    } catch (err) {
      console.error("Error creating user:", err);
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
              placeholder="Silahkan masukkan nama lengkap anda"
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
            />
          </div>

          {/* Input Username */}
          <div>
            <label
              htmlFor="username"
              className="block text-sm font-medium text-gray-700"
            >
              Username
            </label>
            <input
              type="text"
              name="username"
              id="username"
              value={formData.username}
              onChange={handleChange}
              required
              placeholder="Silahkan masukkan username anda"
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          {/* Input Email */}
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700"
            >
              Email
            </label>
            <input
              type="email"
              name="email"
              id="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="user@mail.com"
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          {/* Input Password */}
          <div>
            <label
              htmlFor="password_hash"
              className="block text-sm font-medium text-gray-700"
            >
              Password
            </label>
            <input
              type="password"
              name="password_hash"
              id="password_hash"
              value={formData.password_hash}
              onChange={handleChange}
              required
              placeholder="********"
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          {/* Input Role */}
          <div>
            <label
              htmlFor="role"
              className="block text-sm font-medium text-gray-700"
            >
              Role / Hak Akses
            </label>
            <select
              name="role"
              id="role"
              value={formData.role}
              onChange={handleChange}
              required
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="ADMIN">ADMIN</option>
              <option value="MARKETING">MARKETING</option>
              <option value="TELLER">TELLER</option>
              <option value="SUPERADMIN">SUPERADMIN</option>
            </select>
          </div>

          {/* Input Access Token */}
          <div>
            <label
              htmlFor="access_token"
              className="block text-sm font-medium text-gray-700"
            >
              Token User
            </label>
            <input
              type="text"
              name="access_token"
              id="access_token"
              value={formData.access_token}
              onChange={handleChange}
              required
              placeholder="Silahkan masukkan token anda"
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-indigo-500 focus:border-indigo-500"
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
            {loading ? "Menyimpan..." : "Mendaftarkan User"}
          </button>
        </form>
      </div>
    </DashboardLayout>
  );
}
