"use client";

import { useRouter } from "next/navigation";
import axios from "axios";
import Swal from "sweetalert2";
import DashboardLayout from "../components/DashboardLayout";
import { useEffect, useState, useMemo } from "react";
import ExportButton from "../components/ExportExcel";
import DeleteAllTransactionsButton from "../components/DeleteAllTransactions";
import Link from "next/link";
import ExportButtonCabang from "../components/ExportExcelCabang";
import DeleteAllTransactionsCabangButton from "../components/DeleteAllTransactionsCabang";

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const router = useRouter();
  const [user, setUser] = useState([]);

  //search
  const [searchTerm, setSearchTerm] = useState("");

  //pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(20);

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

  const filteredTransactions = useMemo(() => {
    const term = searchTerm.toLowerCase();
    if (!term) return transactions;

    return transactions.filter((transaction) => {
      // Menggunakan Optional Chaining (?.) untuk mengakses properti 'customer'
      // dan Nullish Coalescing (?? '') untuk memastikan nilai adalah string kosong jika undefined/null.

      // Data Customer
      const customer = transaction.customer;
      const fullName = customer?.full_name ?? "";
      const nasabahId = customer?.nasabah_id ?? "";
      const noAlternatif = customer?.no_alternatif ?? "";

      // Perhatian: type_transaction biasanya ada di objek transaksi itu sendiri,
      // namun di kode Anda sebelumnya ada di 'customer'. Jika di transaksi, gunakan:
      const transactionType = transaction.transaction_type ?? "";
      // Saya asumsikan Anda ingin mencari berdasarkan kolom di objek customer (sesuai kode Anda sebelumnya)
      // Jika type_transaction ada di customer, gunakan:
      const customerType = customer?.type_customer ?? ""; // Saya asumsikan nama field-nya type_customer seperti di halaman customer Anda sebelumnya

      return (
        fullName.toLowerCase().includes(term) ||
        nasabahId.toString().includes(term) ||
        noAlternatif.toString().includes(term) ||
        customerType.toLowerCase().includes(term)
        // Jika Anda ingin mencari berdasarkan tipe transaksi:
        // transactionType.toLowerCase().includes(term)
      );
    });
  }, [transactions, searchTerm]);

  //pagination
  const totalPages = useMemo(() => {
    return Math.ceil(filteredTransactions.length / itemsPerPage);
  }, [filteredTransactions.length, itemsPerPage]);

  const currentTransactions = useMemo(() => {
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    return filteredTransactions.slice(indexOfFirstItem, indexOfLastItem);
  }, [filteredTransactions, currentPage, itemsPerPage]);

  const paginate = (pageNumber) => {
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
      // Gulir ke atas halaman saat pindah halaman
      if (typeof window !== "undefined") {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    }
  };

  /**
   * Menggenerasi urutan tombol halaman dengan batasan dan elipsis.
   * Hanya menampilkan maksimal 7 tombol halaman (termasuk tombol 1 dan terakhir)
   */
  const getPageNumbers = () => {
    if (totalPages <= 7) {
      // Jika halamannya sedikit, tampilkan semua
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    let pages = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(
      2,
      currentPage - Math.floor(maxVisiblePages / 2) + 1
    );
    let endPage = Math.min(totalPages - 1, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(2, endPage - maxVisiblePages + 1);
    }

    pages.push(1);

    if (startPage > 2) {
      pages.push("...");
    }

    for (let i = startPage; i <= endPage; i++) {
      if (i > 1 && i < totalPages) {
        pages.push(i);
      }
    }

    if (endPage < totalPages - 1) {
      pages.push("...");
    }

    if (totalPages > 1 && pages[pages.length - 1] !== totalPages) {
      pages.push(totalPages);
    }

    // Mengeliminasi elipsis ganda dan nomor halaman yang berdekatan/sama
    return pages.filter(
      (value, index, self) =>
        !(value === "..." && index > 0 && self[index - 1] === "...") &&
        !(typeof value === "number" && index > 0 && self[index - 1] === value)
    );
  };

  const pageNumbers = getPageNumbers();

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
        <div className="h-screen flex justify-center items-center text-company-800 text-2xl">
          Sedang memuat data transaksi...
        </div>
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
        <h1 className="text-4xl font-bold text-company-950">
          Daftar Transaksi
        </h1>
        <h1 className="text-lg text-company-950">
          Menu untuk melihat semua riwayat transaksi.
        </h1>

        {isAllowed && (
          <div>
            <ExportButton />
            <ExportButtonCabang />
          </div>
        )}

        <div className="p-4 bg-company-100 w-full rounded-md mt-5 overflow-x-auto">
          <Link href="/beranda" passHref>
            <button className="py-2 px-4 mb-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-company-800 hover:bg-company-900 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50">
              Kembali ke Beranda
            </button>
          </Link>
          <Link href="/transaction" passHref>
            <button className="py-2 ml-2 px-4 mb-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50">
              Tambah Transaksi
            </button>
          </Link>

          {isAllowed && (
            <>
              <DeleteAllTransactionsButton />
              <DeleteAllTransactionsCabangButton />
              <div className="relative w-full sm:w-64 mb-4">
                <input
                  type="text"
                  placeholder="Cari (Nama, Rekening, Kode Kantor...)"
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1); // Reset halaman ke 1 saat pencarian
                  }}
                  className="w-full pl-10 pr-4 py-2 border border-gray-900 rounded-lg shadow-sm focus:ring-company-500 focus:border-company-900 text-sm"
                />
                <svg
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                </svg>
              </div>
            </>
          )}
          {filteredTransactions.length === 0 ? (
            <p className="p-4 text-company-950 bg-company-200 rounded pb-20">
              {searchTerm
                ? `Tidak ditemukan data customer untuk kata kunci "${searchTerm}".`
                : "Data Transaksi tidak ditemukan"}
            </p>
          ) : (
            <div>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr className="bg-company-950 text-white font-display">
                    <th
                      className="font-normal"
                      style={{ padding: "8px", border: "1px solid #ddd" }}
                    >
                      No
                    </th>
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
                  {currentTransactions.map((transaction, index) => {
                    const transactionNumber =
                      (currentPage - 1) * itemsPerPage + index + 1;
                    return (
                      <tr
                        key={transaction.id}
                        style={{ borderBottom: "1px solid #ddd" }}
                        className="bg-company-50"
                      >
                        <td
                          style={{ padding: "8px", border: "1px solid #ddd" }}
                        >
                          {transactionNumber}
                        </td>
                        <td
                          style={{ padding: "8px", border: "1px solid #ddd" }}
                        >
                          {/* Pastikan relasi 'nasabah' ada */}
                          {transaction.customer
                            ? transaction.customer.full_name
                            : "Tidak Ditemukan"}
                        </td>
                        <td
                          style={{ padding: "8px", border: "1px solid #ddd" }}
                        >
                          {transaction.transaction_type}
                        </td>
                        <td
                          style={{ padding: "8px", border: "1px solid #ddd" }}
                        >
                          {transaction.amount}
                        </td>
                        <td
                          style={{ padding: "8px", border: "1px solid #ddd" }}
                        >
                          {transaction.description}
                        </td>
                        <td
                          style={{ padding: "8px", border: "1px solid #ddd" }}
                        >
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
                                margin: "0px 0px 4px 0px"
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
                    );
                  })}
                </tbody>
              </table>
              {totalPages > 1 && (
                <div className="flex flex-col sm:flex-row justify-between items-center px-6 py-4 bg-gray-50 border-t border-gray-200">
                  <div className="flex flex-wrap justify-center space-x-1 order-1 sm:order-2">
                    {/* Tombol Sebelumnya */}
                    <button
                      onClick={() => paginate(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="px-3 py-1 text-sm font-medium border rounded-lg transition-colors disabled:opacity-50 bg-white text-gray-700 hover:bg-gray-100 shadow-sm border-gray-300"
                    >
                      Sebelumnya
                    </button>

                    {/* Tombol Nomor Halaman Skalabel */}
                    {pageNumbers.map((number, index) => {
                      if (number === "...") {
                        return (
                          <span
                            key={`ellipsis-${index}`}
                            className="px-3 py-1 text-sm font-medium text-gray-500 flex items-center"
                          >
                            ...
                          </span>
                        );
                      }

                      const isActive = currentPage === number;
                      return (
                        <button
                          key={number}
                          onClick={() => paginate(number)}
                          className={`px-3 py-1 text-sm font-medium border rounded-lg transition-colors shadow-sm ${
                            isActive
                              ? "bg-company-800 text-white border-company-900 ring-2 ring-company-500 ring-offset-1"
                              : "bg-white text-gray-700 hover:bg-gray-100 border-gray-300"
                          }`}
                        >
                          {number}
                        </button>
                      );
                    })}

                    {/* Tombol Berikutnya */}
                    <button
                      onClick={() => paginate(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="px-3 py-1 text-sm font-medium border rounded-lg transition-colors disabled:opacity-50 bg-white text-gray-700 hover:bg-gray-100 shadow-sm border-gray-300"
                    >
                      Berikutnya
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </DashboardLayout>
    </div>
  );
}
