// src/app/dashboard/page.jsx

"use client";

import { useRouter } from "next/navigation";
import DashboardLayout from "../components/DashboardLayout";
import { useEffect, useState, useMemo } from "react";
import Link from "next/link";

export default function CustomerPage() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const router = useRouter();
  const [user, setUser] = useState([]);

  // search
  const [searchTerm, setSearchTerm] = useState("");

  //pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(20);

  // State untuk Custom Confirmation Modal
  const [showConfirm, setShowConfirm] = useState(false);
  const [customerToDelete, setCustomerToDelete] = useState(null);

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

  const filteredCustomers = useMemo(() => {
    const term = searchTerm.toLowerCase();
    if (!term) return customers;

    // Filter berdasarkan nama, no rekening, atau kode kantor
    return customers.filter(
      (customer) =>
        customer.full_name.toLowerCase().includes(term) ||
        (customer.nasabah_id &&
          customer.nasabah_id.toString().includes(term)) ||
        (customer.no_alternatif &&
          customer.no_alternatif.toString().includes(term)) ||
        customer.type_customer.toLowerCase().includes(term)
    );
  }, [customers, searchTerm]);

  //pagination
  const totalPages = useMemo(() => {
    return Math.ceil(filteredCustomers.length / itemsPerPage);
  }, [filteredCustomers.length, itemsPerPage]);

  const currentCustomers = useMemo(() => {
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    return filteredCustomers.slice(indexOfFirstItem, indexOfLastItem);
  }, [filteredCustomers, currentPage, itemsPerPage]);

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

  const handleEdit = (customerId) => {
    router.push(`/customer/edit/${customerId}`);
  }; // --- FUNGSI DELETE DENGAN MODAL KUSTOM ---

  const handleDelete = (customerId) => {
    setCustomerToDelete(customerId);
    setShowConfirm(true);
  };

  const confirmDelete = async () => {
    if (!customerToDelete) return;

    setShowConfirm(false);
    setLoading(true);

    try {
      const response = await fetch(`/api/customers/${customerToDelete}`, {
        method: "DELETE",
      });

      if (response.ok) {
        // Perbarui state untuk menghilangkan pengguna yang sudah dihapus dari tabel
        const updatedCustomers = customers.filter(
          (customer) => customer.id !== customerToDelete
        );
        setCustomers(updatedCustomers);
        setError(null); // Logika agar halaman tidak kosong setelah penghapusan

        const newTotalPages = Math.ceil(updatedCustomers.length / itemsPerPage);
        if (currentPage > newTotalPages && newTotalPages > 0) {
          setCurrentPage(newTotalPages);
        } else if (updatedCustomers.length === 0) {
          setCurrentPage(1);
        }
      } else {
        const errorData = await response.json();
        setError(errorData.message || "Gagal menghapus pengguna.");
      }
    } catch (err) {
      console.error("Error deleting customer:", err);
      setError("Terjadi kesalahan jaringan saat menghapus.");
    } finally {
      setCustomerToDelete(null);
      setLoading(false);
    }
  };

  const cancelDelete = () => {
    setShowConfirm(false);
    setCustomerToDelete(null);
  };

  return (
    <div>
      {showConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white p-6 rounded-xl shadow-2xl w-full max-w-sm">
            <h2 className="text-xl font-bold mb-4 text-red-600">
              Konfirmasi Penghapusan
            </h2>
            <p className="mb-6 text-gray-700">
              Apakah Anda yakin ingin menghapus customer ini?
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={cancelDelete}
                className="px-4 py-2 text-sm font-medium border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition"
              >
                Batal
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition"
              >
                Hapus
              </button>
            </div>
          </div>
        </div>
      )}
      <div>
        <DashboardLayout>
          <h1 className="text-4xl font-bold text-company-950">
            Selamat Datang di Customers
          </h1>
          <h1 className="text-lg text-company-950">
            Menu untuk melihat semua pengguna!
          </h1>
          <div className="p-4 bg-company-100 w-full rounded-md mt-5 overflow-x-auto">
            <Link href="/customer/create" passHref>
              <button className="py-2 px-4 mb-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-company-800 hover:bg-company-900 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50">
                Tambahkan Customer Baru
              </button>
            </Link>
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
            {filteredCustomers.length === 0 ? (
              <p className="p-4 text-gray-500">
                {searchTerm
                  ? `Tidak ditemukan data customer untuk kata kunci "${searchTerm}".`
                  : "Tidak ada data customer untuk ditampilkan."}
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
                    {currentCustomers.map((customer, index) => {
                      // RUMUS UNTUK MENGHITUNG NOMOR URUT YANG BENAR
                      const customerNumber =
                        (currentPage - 1) * itemsPerPage + index + 1;
                      return (
                        <tr
                          key={customer.id}
                          style={{ borderBottom: "1px solid #ddd" }}
                          className="bg-company-50"
                        >
                          <td
                            style={{ padding: "8px", border: "1px solid #ddd" }}
                          >
                            {customerNumber}
                          </td>
                          <td
                            style={{ padding: "8px", border: "1px solid #ddd" }}
                          >
                            {customer.full_name}
                          </td>
                          <td
                            style={{ padding: "8px", border: "1px solid #ddd" }}
                          >
                            {customer.nasabah_id}
                          </td>
                          <td
                            style={{ padding: "8px", border: "1px solid #ddd" }}
                          >
                            {customer.no_alternatif}
                          </td>
                          <td
                            style={{ padding: "8px", border: "1px solid #ddd" }}
                          >
                            {customer.type_customer}
                          </td>
                          {isAllowed && (
                            <td
                              style={{
                                padding: "8px",
                                border: "1px solid #ddd",
                              }}
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
    </div>
  );
}
