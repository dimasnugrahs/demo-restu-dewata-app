// src/app/dashboard/page.jsx

"use client";

import TransactionForm from "./_components/page";

export default function TransactionPage() {

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6 text-center text-gray-800">
          Tambah Transaksi Baru
        </h1>
        <TransactionForm />
      </div>
    </div>
  );
}
