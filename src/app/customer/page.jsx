// src/app/dashboard/page.jsx

"use client";

import { useRouter } from "next/navigation";
import DashboardLayout from "../components/DashboardLayout";
import { useEffect, useState } from "react";

export default function CustomerPage() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const router = useRouter();
  const [user, setUser] = useState([]);

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const response = await fetch("/api/customers");

        if (response.ok) {
          const data = await response.json();
          setCustomers(data.customers);
        } else {
          // Tangani kasus ketika otentikasi gagal atau API error
          const errorData = await response.json();
          setError(errorData.message || "Gagal mengambil data pengguna.");
        }
      } catch (err) {
        console.error("Error fetching customers:", err);
        setError("Terjadi kesalahan jaringan.");
      } finally {
        setLoading(false);
      }
    };

    const fetchUserData = async () => {
      try {
        const response = await fetch("/api/auth/user");

        if (response.ok) {
          // Menggunakan response.ok untuk memeriksa status 200
          const data = await response.json();
          setUser(data.user);
        } else {
          // Redirect jika tidak terautentikasi atau terjadi kesalahan
          router.push("/auth");
        }
      } catch (error) {
        console.error("Failed to fetch user data:", error);
        router.push("/auth");
      } finally {
        setLoading(false);
      }
    };

    fetchCustomers();
    fetchUserData();
  }, [router]);

  const allowedRoles = ["ADMIN", "SUPERADMIN"];

  // Fungsi sederhana untuk memeriksa izin
  const isAllowed = allowedRoles.includes(user.role);

  const handleEdit = (customerId) => {
    // Arahkan ke halaman edit dengan ID pengguna
    router.push(`/dashboard/customers/edit/${customerId}`);
  };

  const handleDelete = async (customerId) => {
    if (window.confirm("Apakah Anda yakin ingin menghapus pengguna ini?")) {
      try {
        const response = await fetch(`/api/customers/${customerId}`, {
          method: "DELETE",
        });

        if (response.ok) {
          // Perbarui state untuk menghilangkan pengguna yang sudah dihapus dari tabel
          setCustomers(
            customers.filter((customer) => customer.id !== customerId)
          );
        } else {
          const errorData = await response.json();
          setError(errorData.message || "Gagal menghapus pengguna.");
        }
      } catch (err) {
        console.error("Error deleting customer:", err);
        setError("Terjadi kesalahan jaringan saat menghapus.");
      }
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
            {customers.length === 0 ? (
              <p>Rendering on customers data.</p>
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
                      No Rekening
                    </th>
                    <th
                      className="font-normal"
                      style={{ padding: "8px", border: "1px solid #ddd" }}
                    >
                      No Rek Alternatif
                    </th>
                    <th
                      className="font-normal"
                      style={{ padding: "8px", border: "1px solid #ddd" }}
                    >
                      Kode Kantor
                    </th>
                    {isAllowed && (
                      <th
                        className="font-normal"
                        style={{ padding: "8px", border: "1px solid #ddd" }}
                      >
                        Action
                      </th>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {customers.map((customer) => (
                    <tr
                      key={customer.id}
                      style={{ borderBottom: "1px solid #ddd" }}
                      className="bg-company-50"
                    >
                      <td style={{ padding: "8px", border: "1px solid #ddd" }}>
                        {customer.full_name}
                      </td>
                      <td style={{ padding: "8px", border: "1px solid #ddd" }}>
                        {customer.nasabah_id}
                      </td>
                      <td style={{ padding: "8px", border: "1px solid #ddd" }}>
                        {customer.no_alternatif}
                      </td>
                      <td style={{ padding: "8px", border: "1px solid #ddd" }}>
                        {customer.type_customer}
                      </td>
                      {isAllowed && (
                        <td
                          style={{ padding: "8px", border: "1px solid #ddd" }}
                          className="text-center"
                        >
                          <button
                            onClick={() => handleEdit(customer.id)}
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
                            onClick={() => handleDelete(customer.id)}
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
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </DashboardLayout>
      </div>
    </div>
  );
}
