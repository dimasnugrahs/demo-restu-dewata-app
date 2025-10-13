"use client";

import { useRouter } from "next/navigation";
import axios from "axios";
import Swal from "sweetalert2";
import DashboardLayout from "../components/DashboardLayout";
import { useEffect, useState } from "react";
import ExportButton from "../components/ExportExcel";
import DeleteAllTransactionsButton from "../components/DeleteAllTransactions";
import Link from "next/link";

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const router = useRouter();
  const [user, setUser] = useState([]);

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

    fetchTransactions();
    fetchUserData();
  }, [router]);

  if (!user) {
    // Tampilkan pesan error atau redirect jika user tidak ada
    return <div></div>;
  }

  const allowedRoles = ["ADMIN", "SUPERADMIN"];

  // Fungsi sederhana untuk memeriksa izin
  const isAllowed = allowedRoles.includes(user.role);

  const handleEdit = (transactionId) => {
    // Arahkan ke halaman edit dengan ID pengguna
    router.push(`/transactions/edit/${transactionId}`);
  };

  const handleDelete = async (transactionId) => {
    if (window.confirm("Apakah Anda yakin ingin menghapus pengguna ini?")) {
      try {
        const response = await fetch(`/api/transactions/${transactionId}`, {
          method: "DELETE",
        });

        if (response.ok) {
          // Perbarui state untuk menghilangkan pengguna yang sudah dihapus dari tabel
          setTransactions(
            transactions.filter(
              (transaction) => transaction.id !== transactionId
            )
          );
        } else {
          const errorData = await response.json();
          setError(errorData.message || "Gagal menghapus pengguna.");
        }
      } catch (err) {
        console.error("Error deleting transaction:", err);
        setError("Terjadi kesalahan jaringan saat menghapus.");
      }
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

        {isAllowed && (
          <div>
            <ExportButton />
            <DeleteAllTransactionsButton />
          </div>
        )}

        <div className="p-4 bg-company-100 w-full rounded-md mt-5 overflow-x-auto">
          <Link href="/beranda" passHref>
            <button className="py-2 px-4 mb-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-company-800 hover:bg-company-900 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50">
              Kembali ke Beranda
            </button>
          </Link>
          <Link href="/beranda" passHref>
            <button className="py-2 ml-2 px-4 mb-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50">
              Tambah Transaksi
            </button>
          </Link>
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
                    <td style={{ padding: "8px", border: "1px solid #ddd" }}>
                      {transaction.office_code}
                    </td>
                    {isAllowed && (
                      <td
                        style={{ padding: "8px", border: "1px solid #ddd" }}
                        className="text-center"
                      >
                        <button
                          onClick={() => handleEdit(transaction.id)}
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
                          onClick={() => handleDelete(transaction.id)}
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
  );
}
