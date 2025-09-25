// src/app/dashboard/page.jsx

"use client";

import { useRouter } from "next/navigation";
import axios from "axios";
import Swal from "sweetalert2";
import DashboardLayout from "../components/DashboardLayout";
import { useEffect, useState } from "react";

export default function CustomerPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch("/api/users");

        if (response.ok) {
          const data = await response.json();
          setUsers(data.users);
        } else {
          // Tangani kasus ketika otentikasi gagal atau API error
          const errorData = await response.json();
          setError(errorData.message || "Gagal mengambil data pengguna.");
        }
      } catch (err) {
        console.error("Error fetching users:", err);
        setError("Terjadi kesalahan jaringan.");
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const handleEdit = (userId) => {
    // Arahkan ke halaman edit dengan ID pengguna
    router.push(`/dashboard/users/edit/${userId}`);
  };

  const handleDelete = async (userId) => {
    if (window.confirm("Apakah Anda yakin ingin menghapus pengguna ini?")) {
      try {
        const response = await fetch(`/api/users/${userId}`, {
          method: "DELETE",
        });

        if (response.ok) {
          // Perbarui state untuk menghilangkan pengguna yang sudah dihapus dari tabel
          setUsers(users.filter((user) => user.id !== userId));
        } else {
          const errorData = await response.json();
          setError(errorData.message || "Gagal menghapus pengguna.");
        }
      } catch (err) {
        console.error("Error deleting user:", err);
        setError("Terjadi kesalahan jaringan saat menghapus.");
      }
    }
  };

  const handleLogout = async () => {
    try {
      await axios.post("/api/auth/logout");

      // Menampilkan notifikasi sukses
      Swal.fire({
        icon: "success",
        title: "Sukses",
        text: "Anda telah berhasil logout!",
        showConfirmButton: false,
        timer: 1500,
      });

      // PENTING: Panggil router.refresh() untuk memicu middleware.
      // Middleware akan melihat cookie yang hilang dan mengalihkan ke halaman login.
      router.refresh();
    } catch (err) {
      console.error(err);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Gagal logout. Silakan coba lagi.",
      });
    }
  };

  return (
    <div>
      <div>
        <DashboardLayout>
          <h1 className="text-4xl font-bold mb-4 text-company-950">
            Selamat Datang di Customers
          </h1>
          <h1 className="text-lg text-company-950">
            Menu untuk melihat semua pengguna!
          </h1>
          <div className="p-4 bg-company-100 w-full rounded-md mt-5 overflow-x-auto">
            {users.length === 0 ? (
              <p>Rendering on users data.</p>
            ) : (
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr className="bg-company-950 text-white font-display">
                    <th
                      className="font-normal"
                      style={{ padding: "8px", border: "1px solid #ddd" }}
                    >
                      Nama Lengkap
                    </th>
                    <th
                      className="font-normal"
                      style={{ padding: "8px", border: "1px solid #ddd" }}
                    >
                      Email
                    </th>
                    <th
                      className="font-normal"
                      style={{ padding: "8px", border: "1px solid #ddd" }}
                    >
                      Username
                    </th>
                    <th
                      className="font-normal"
                      style={{ padding: "8px", border: "1px solid #ddd" }}
                    >
                      Role
                    </th>
                    <th
                      className="font-normal"
                      style={{ padding: "8px", border: "1px solid #ddd" }}
                    >
                      Aksi
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr
                      key={user.id}
                      style={{ borderBottom: "1px solid #ddd" }}
                      className="bg-company-50"
                    >
                      <td style={{ padding: "8px", border: "1px solid #ddd" }}>
                        {user.full_name}
                      </td>
                      <td style={{ padding: "8px", border: "1px solid #ddd" }}>
                        {user.email}
                      </td>
                      <td style={{ padding: "8px", border: "1px solid #ddd" }}>
                        {user.username}
                      </td>
                      <td style={{ padding: "8px", border: "1px solid #ddd" }}>
                        {user.role}
                      </td>
                      <td
                        style={{ padding: "8px", border: "1px solid #ddd" }}
                        className="text-center"
                      >
                        <button
                          onClick={() => handleEdit(user.id)}
                          style={{
                            padding: "5px 10px",
                            color: "white",
                            border: "none",
                            cursor: "pointer",
                          }}
                          className="bg-green-500 hover:bg-green-700 rounded mx-1"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(user.id)}
                          style={{
                            padding: "5px 10px",
                            color: "white",
                            border: "none",
                            cursor: "pointer",
                          }}
                          className="bg-red-500 hover:bg-red-800 rounded  mx-1"
                        >
                          Hapus
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </DashboardLayout>

        <button
          onClick={handleLogout}
          style={{
            marginTop: "2rem",
            padding: "0.75rem 1.5rem",
            backgroundColor: "#dc3545",
            color: "#fff",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          Logout
        </button>
      </div>
    </div>
  );
}
