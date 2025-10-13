// pages/beranda/index.js (BerandaPage.js)

"use client";

import { useRouter } from "next/navigation";
import DashboardLayout from "../components/DashboardLayout";
import { useEffect, useState } from "react";

export default function BerandaPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [groupedData, setGroupedData] = useState([]);
  const [stats, setStats] = useState({
    // State baru untuk statistik
    balance: 0,
    customers: 0,
    users: 0,
    transactions: 0,
  });
  const [loading, setLoading] = useState(true);

  const formatCurrency = (amount) => {
    // Pastikan input adalah angka, jika tidak, kembalikan 'Rp 0'
    if (typeof amount !== "number" || isNaN(amount)) return "Rp 0";

    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Fungsi utilitas untuk format jumlah (tanpa mata uang)
  const formatCount = (count) => {
    return new Intl.NumberFormat("id-ID").format(count);
  };

  useEffect(() => {
    const fetchAllData = async () => {
      let isAuth = false;
      try {
        // 1. Ambil Data User (Autentikasi)
        const userResponse = await fetch("/api/auth/user");
        if (userResponse.ok) {
          const userData = await userResponse.json();
          setUser(userData.user);
          isAuth = true;
        } else {
          router.push("/auth");
          return;
        }

        // ambil data statistik
        const statsResponse = await fetch("/api/stats");
        if (statsResponse.ok) {
          const statsData = await statsResponse.json();
          setStats(statsData.stats);
        } else {
          console.error("Failed to fetch dashboard stats");
        }

        // 2. Ambil Data Transaksi yang Sudah Dikelompokkan
        // URL disesuaikan dengan yang Anda gunakan di Postman
        const transactionResponse = await fetch(
          "/api/transactions/groupedTransactions"
        );

        if (transactionResponse.ok) {
          const transactionData = await transactionResponse.json();

          // --- Konversi String ke Float ---
          const cleanData = (transactionData.groupedTransactions || []).map(
            (item) => ({
              ...item,
              // Konversi total_amount dari string (misal: "170000") menjadi number
              total_amount: parseFloat(item.total_amount) || 0,
            })
          );

          setGroupedData(cleanData);
        } else {
          console.error("Failed to fetch grouped transactions");
        }
      } catch (error) {
        console.error("Failed to fetch data:", error);
        if (!isAuth) {
          router.push("/auth");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, [router]);

  if (!user || loading) {
    return <div>Sedang memuat...</div>; // Tampilkan loading state minimal
  }

  return (
    <DashboardLayout>
      <h1 className="text-4xl font-bold mb-4 text-company-950">
        Selamat Datang di Beranda
      </h1>
      <h1 className="text-lg text-company-950">
        Selamat datang, {user.full_name}!
      </h1>

      <div className="p-4 bg-company-100 w-full rounded-md mt-5">
        {/* Bagian Statistik Dasar */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 ">
          <div className="p-4 bg-company-800 rounded text-sm text-company-50">
            Customers
            <div className="text-company-50 text-2xl">
              {formatCount(stats.customers)}
            </div>
          </div>
          <div className="p-4 bg-company-800 rounded text-sm text-company-50">
            Users
            <div className="text-company-50 text-2xl">
              {formatCount(stats.users)}
            </div>
          </div>
          <div className="p-4 bg-company-800 rounded text-sm text-company-50">
            Balance
            <div className="text-company-50 text-2xl">
              {formatCurrency(stats.balance)}
            </div>
          </div>
          <div className="p-4 bg-company-800 rounded text-sm text-company-50">
            Transactions
            <div className="text-company-50 text-2xl">
              {formatCount(stats.transactions)}
            </div>
          </div>
        </div>

        {/* Bagian Tampilan Data Transaksi per User */}
        <div className="grid grid-cols-1">
          <div className="p-5 bg-company-50 mt-5 rounded shadow">
            <h2 className="text-xl font-semibold mb-3 text-company-950">
              Rekap Transaksi Berdasarkan Input User
            </h2>

            {groupedData.length > 0 ? (
              <ul className="space-y-3">
                {groupedData.map((item, index) => (
                  <li
                    key={index}
                    className="flex justify-between items-center p-3 bg-white border border-company-100 rounded"
                  >
                    {/* PERUBAHAN TAMPILAN DISINI */}
                    <span className="font-medium text-company-800 text-lg">
                      {item.full_name}
                      {/* Keterangan Count di bawah atau di samping nama */}
                      <span className="block text-sm font-normal text-company-500">
                        {item.transaction_count} Transaksi
                      </span>
                    </span>

                    <span className="font-bold text-xl text-company-900">
                      {formatCurrency(item.total_amount)}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="p-5 text-center text-gray-500 border border-dashed rounded">
                Belum ada transaksi yang tercatat.
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
