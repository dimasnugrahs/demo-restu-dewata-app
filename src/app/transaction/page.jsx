// src/app/dashboard/page.jsx

"use client";

import DashboardLayout from "../components/DashboardLayout";
import TransactionForm from "./_components/page";

export default function TransactionPage() {
  return (
    <div>
      <DashboardLayout>
        <h1 className="text-4xl font-bold text-company-950">
          Tambah Transaksi
        </h1>
        <h1 className="text-lg text-company-950">
          Menu untuk setoran tabungan.
        </h1>
        <div className="mt-0 flex flex-col items-center justify-center">
          <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
            <h1 className="text-2xl font-bold mb-6 text-center text-gray-800">
              Tambah Transaksi Baru
            </h1>
            <TransactionForm />
          </div>
        </div>
      </DashboardLayout>
    </div>
  );
}
