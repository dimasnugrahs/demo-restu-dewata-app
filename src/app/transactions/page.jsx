"use client";

import { useRouter } from "next/navigation";
import axios from "axios";
import Swal from "sweetalert2";
import DashboardLayout from "../components/DashboardLayout";
import { useEffect, useState } from "react";

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const response = await fetch("/api/transactions");

        if (response.ok) {
          const data = await response.json();
          // Pastikan nama state yang diatur adalah `transactions`, bukan `users`
          setTransactions(data.transactions);
        } else {
          const errorData = await response.json();
          setError(errorData.message || "Gagal mengambil data transaksi.");
        }
      } catch (err) {
        console.error("Error fetching transactions:", err);
        setError("Terjadi kesalahan jaringan.");
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, []);

  const handleLogout = async () => {
    try {
      await axios.post("/api/auth/logout");
      Swal.fire({
        icon: "success",
        title: "Sukses",
        text: "Anda telah berhasil logout!",
        showConfirmButton: false,
        timer: 1500,
      });
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

  if (loading) {
    return (
      <DashboardLayout>
        <p>Memuat data...</p>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <p className="text-red-500">{error}</p>
      </DashboardLayout>
    );
  }

  return (
    <div>
      <DashboardLayout>
        <h1 className="text-4xl font-bold mb-4 text-company-950">
          Daftar Transaksi
        </h1>
        <h1 className="text-lg text-company-950">
          Menu untuk melihat semua riwayat transaksi.
        </h1>
        <div className="p-4 bg-company-100 w-full rounded-md mt-5 overflow-x-auto">
          {transactions.length === 0 ? (
            <p>Tidak ada data transaksi.</p>
          ) : (
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr className="bg-company-950 text-white font-display">
                  <th
                    className="font-normal"
                    style={{ padding: "8px", border: "1px solid #ddd" }}
                  >
                    Nama Nasabah
                  </th>
                  <th
                    className="font-normal"
                    style={{ padding: "8px", border: "1px solid #ddd" }}
                  >
                    Jenis Transaksi
                  </th>
                  <th
                    className="font-normal"
                    style={{ padding: "8px", border: "1px solid #ddd" }}
                  >
                    Jumlah
                  </th>
                  <th
                    className="font-normal"
                    style={{ padding: "8px", border: "1px solid #ddd" }}
                  >
                    Deskripsi
                  </th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((transaction) => (
                  <tr
                    key={transaction.id}
                    style={{ borderBottom: "1px solid #ddd" }}
                    className="bg-company-50"
                  >
                    <td style={{ padding: "8px", border: "1px solid #ddd" }}>
                      {/* Pastikan relasi 'nasabah' ada */}
                      {transaction.customer
                        ? transaction.customer.full_name
                        : "Tidak Ditemukan"}
                    </td>
                    <td style={{ padding: "8px", border: "1px solid #ddd" }}>
                      {transaction.transaction_type}
                    </td>
                    <td style={{ padding: "8px", border: "1px solid #ddd" }}>
                      {transaction.amount}
                    </td>
                    <td style={{ padding: "8px", border: "1px solid #ddd" }}>
                      {transaction.description}
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
  );
}
