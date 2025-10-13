import React, { useEffect, useState, useMemo } from "react";
import { Search, Loader, Users, Trash2, Edit } from "lucide-react"; // Menggunakan lucide-react untuk ikon

// =================================================================
// 1. KOMPONEN DASHBOARD LAYOUT (DIBUAT MANDIRI)
// Komponen DashboardLayout minimal untuk penataan layout
// =================================================================
const DashboardLayout = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Styling disederhanakan dan disematkan di sini
  return (
    <div className="min-h-screen flex bg-gray-100 font-sans antialiased">
      {/* Sidebar - Placeholder */}
      <aside
        className={`fixed z-30 inset-y-0 left-0 transform ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        } lg:relative lg:translate-x-0 transition duration-200 ease-in-out w-64 bg-company-950 p-6 shadow-xl`}
      >
        <div className="flex justify-between items-center mb-10">
          <h2 className="text-xl font-bold text-white tracking-wider">
            APP DASHBOARD
          </h2>
          <button
            onClick={() => setIsSidebarOpen(false)}
            className="text-white lg:hidden"
          >
            &times;
          </button>
        </div>
        <nav className="space-y-4">
          {/* Placeholder Nav Items */}
          <a
            href="#"
            className="flex items-center text-sm font-medium text-company-300 hover:text-white transition duration-150"
          >
            <Users className="w-5 h-5 mr-3" /> Customers
          </a>
          <a
            href="#"
            className="flex items-center text-sm font-medium text-company-500 hover:text-white transition duration-150"
          >
            <Loader className="w-5 h-5 mr-3" /> Settings (Placeholder)
          </a>
        </nav>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header - Placeholder */}
        <header className="flex items-center justify-between p-4 bg-white shadow-md">
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="text-gray-500 lg:hidden"
          >
            &#9776;
          </button>
          <div className="text-lg font-semibold text-company-950">
            Customer View
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto p-6 md:p-8">
          {children}
        </main>
      </div>
    </div>
  );
};

// =================================================================
// 2. KOMPONEN UTAMA (CustomerPage diubah menjadi App)
// =================================================================
export default function App() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [user, setUser] = useState({ role: "ADMIN" }); // Mock user data (for isAllowed check)

  // search
  const [searchTerm, setSearchTerm] = useState("");

  //pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5); // <-- ITEMS PER PAGE DIATUR KE 5

  // State untuk Custom Confirmation Modal
  const [showConfirm, setShowConfirm] = useState(false);
  const [customerToDelete, setCustomerToDelete] = useState(null);

  // Mock navigasi karena useRouter Next.js tidak tersedia
  const mockNavigate = (path) => {
    console.log(`[NAVIGASI DITIRU] Berusaha pindah ke: ${path}`);
    // Di lingkungan Next.js yang sebenarnya, ini adalah router.push(path);
    setError(
      `Tindakan navigasi ke ${path} disimulasikan. Di sini hanya bisa menggunakan fitur browser.`
    );
  };

  useEffect(() => {
    const fetchCustomers = async () => {
      // Simulasikan Fetching Data dari API yang mungkin gagal di lingkungan ini
      await new Promise((resolve) => setTimeout(resolve, 500)); // Simulasi penundaan jaringan

      try {
        // Karena API eksternal gagal di lingkungan ini, kita akan menggunakan data tiruan (mock data)
        const totalCustomers = 5; // <-- TOTAL CUSTOMERS DIATUR KE 5
        const simulatedData = Array.from(
          { length: totalCustomers },
          (_, i) => ({
            id: (i + 1).toString(), // Menggunakan string untuk ID
            full_name: `Customer Uji Coba ${i + 1}`,
            nasabah_id: `NAS${1000 + i}`,
            no_alternatif: `ALT${2000 + i}`,
            type_customer:
              i % 3 === 0 ? "Personal" : i % 3 === 1 ? "Corporate" : "SME",
          })
        );
        setCustomers(simulatedData);
        // Simulasi berhasil
        setUser({ role: "SUPERADMIN" }); // Set peran untuk menguji izin
      } catch (err) {
        console.error("Error fetching customers (Simulated):", err);
        setError("Terjadi kesalahan jaringan (Simulasi). Memuat data tiruan.");
      } finally {
        setLoading(false);
      }
    };

    fetchCustomers();
  }, []); // Dependensi kosong untuk memanggil sekali saat komponen dimuat

  const allowedRoles = ["ADMIN", "SUPERADMIN"];
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
    mockNavigate(`/customer/edit/${customerId}`);
  };

  const handleDelete = (customerId) => {
    setCustomerToDelete(customerId);
    setShowConfirm(true);
  };

  const confirmDelete = async () => {
    if (!customerToDelete) return;

    setShowConfirm(false);
    setLoading(true);

    try {
      // Simulasikan Panggilan DELETE API
      console.log(`[SIMULASI] Menghapus customer ID: ${customerToDelete}`);
      await new Promise((resolve) => setTimeout(resolve, 300)); // Simulasi penundaan penghapusan

      // Perbarui state untuk menghilangkan pengguna yang sudah dihapus dari tabel
      const updatedCustomers = customers.filter(
        (customer) => customer.id !== customerToDelete
      );
      setCustomers(updatedCustomers);
      setError(null);

      // Logika agar halaman tidak kosong setelah penghapusan
      const newTotalPages = Math.ceil(updatedCustomers.length / itemsPerPage);
      if (currentPage > newTotalPages && newTotalPages > 0) {
        setCurrentPage(newTotalPages);
      } else if (updatedCustomers.length === 0) {
        setCurrentPage(1);
      }
    } catch (err) {
      console.error("Error deleting customer (Simulated):", err);
      setError("Terjadi kesalahan jaringan saat menghapus (Simulasi Gagal).");
    } finally {
      setCustomerToDelete(null);
      setLoading(false);
    }
  };

  const cancelDelete = () => {
    setShowConfirm(false);
    setCustomerToDelete(null);
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex flex-col justify-center items-center h-64 bg-white rounded-xl shadow-lg">
          <Loader className="animate-spin h-8 w-8 text-company-800" />
          <p className="mt-3 text-lg text-company-600">Memuat data...</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <div>
      {/* Modal Konfirmasi */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white p-6 rounded-xl shadow-2xl w-full max-w-sm transform transition-all scale-100">
            <h2 className="text-xl font-bold mb-4 text-red-600 border-b pb-2">
              Konfirmasi Penghapusan
            </h2>
            <p className="mb-6 text-gray-700">
              Apakah Anda yakin ingin menghapus customer ini? Tindakan ini tidak
              dapat dibatalkan.
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
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition shadow-md"
              >
                <Trash2 className="inline w-4 h-4 mr-1" /> Hapus
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Konten Utama */}
      <DashboardLayout>
        <div className="space-y-6">
          <h1 className="text-4xl font-extrabold text-company-950 tracking-tight">
            Selamat Datang di Customers
          </h1>
          <p className="text-lg text-gray-600">
            Menu untuk melihat semua data customer dan mengelola akun mereka.
          </p>
        </div>

        <div className="p-6 bg-white w-full rounded-xl shadow-lg mt-8">
          {/* Header Kontrol */}
          <div className="flex flex-col sm:flex-row justify-between gap-4 mb-6">
            <button
              onClick={() => mockNavigate("/customer/create")}
              className="py-2 px-4 rounded-lg shadow-md text-sm font-semibold text-white bg-company-800 hover:bg-company-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-company-500 transition duration-150 disabled:opacity-50"
            >
              Tambahkan Customer Baru
            </button>

            <div className="relative w-full sm:w-80">
              <input
                type="text"
                placeholder="Cari (Nama, Rekening, Kode Kantor...)"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1); // Reset halaman ke 1 saat pencarian
                }}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg shadow-inner focus:ring-company-500 focus:border-company-500 text-sm transition"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            </div>
          </div>

          {/* Pesan Error */}
          {error && (
            <div className="p-3 text-sm text-red-700 bg-red-100 border border-red-300 rounded-lg my-4">
              {error}
            </div>
          )}

          {/* Tabel Data */}
          <div className="overflow-x-auto rounded-xl border border-gray-200 shadow-inner">
            {filteredCustomers.length === 0 ? (
              <p className="p-6 text-gray-500 bg-white">
                {searchTerm
                  ? `Tidak ditemukan data customer untuk kata kunci "${searchTerm}".`
                  : "Tidak ada data customer untuk ditampilkan."}
              </p>
            ) : (
              <>
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-company-900">
                    <tr className="text-white">
                      {[
                        "Nama Lengkap",
                        "No Rekening",
                        "No Rek Alternatif",
                        "Kode Kantor",
                      ].map((header) => (
                        <th
                          key={header}
                          className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider whitespace-nowrap"
                        >
                          {header}
                        </th>
                      ))}
                      {isAllowed && (
                        <th className="px-6 py-3 text-center text-xs font-semibold uppercase tracking-wider">
                          Action
                        </th>
                      )}
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-100">
                    {currentCustomers.map((customer, index) => (
                      <tr
                        key={customer.id}
                        className={
                          index % 2 === 0
                            ? "bg-white hover:bg-gray-50"
                            : "bg-gray-50 hover:bg-gray-100"
                        }
                      >
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {customer.full_name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                          {customer.nasabah_id}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                          {customer.no_alternatif}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                          {customer.type_customer}
                        </td>
                        {isAllowed && (
                          <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                            <button
                              onClick={() => handleEdit(customer.id)}
                              className="inline-flex items-center px-3 py-1 bg-green-500 text-white rounded-lg hover:bg-green-600 transition duration-150 shadow-sm mr-2 text-xs"
                            >
                              <Edit className="w-3 h-3 mr-1" /> Edit
                            </button>
                            <button
                              onClick={() => handleDelete(customer.id)}
                              className="inline-flex items-center px-3 py-1 bg-red-500 text-white rounded-lg hover:bg-red-600 transition duration-150 shadow-sm text-xs"
                            >
                              <Trash2 className="w-3 h-3 mr-1" /> Hapus
                            </button>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex flex-col sm:flex-row justify-between items-center px-6 py-4 bg-gray-50 border-t border-gray-200">
                    <div className="text-sm text-gray-600 order-2 sm:order-1 mt-3 sm:mt-0">
                      Menampilkan{" "}
                      <span className="font-semibold">
                        {(currentPage - 1) * itemsPerPage + 1}
                      </span>{" "}
                      sampai{" "}
                      <span className="font-semibold">
                        {Math.min(
                          currentPage * itemsPerPage,
                          filteredCustomers.length
                        )}
                      </span>{" "}
                      dari{" "}
                      <span className="font-semibold">
                        {filteredCustomers.length}
                      </span>{" "}
                      total customer.
                    </div>

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
              </>
            )}
          </div>
        </div>
      </DashboardLayout>
    </div>
  );
}
