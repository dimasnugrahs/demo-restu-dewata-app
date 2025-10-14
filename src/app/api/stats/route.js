import { NextResponse } from "next/server";
import { db } from "@/lib/db"; // Asumsi path ke client Prisma Anda

export async function GET() {
  try {
    // 1. Ambil Total Balance Pusat (Total amount dari semua transaksi)
    const totalBalanceResultPusat = await db.transaction.aggregate({
      where: {
        office_code: "111", // Tambahkan filter di sini
      },
      _sum: {
        amount: true,
      },
    });

    // 1. Ambil Total Balance Cabang (Total amount dari semua transaksi)
    const totalBalanceResultCabang = await db.transaction.aggregate({
      where: {
        office_code: "116", // Tambahkan filter di sini
      },
      _sum: {
        amount: true,
      },
    });

    // 2. Hitung Jumlah Customers
    const customerCount = await db.customer.count();

    // 3. Hitung Jumlah Users
    const userCount = await db.user.count();

    // 4. Hitung Jumlah Transactions
    const transactionCountPusat = await db.transaction.count({
      where: {
        office_code: "111", // Tambahkan filter di sini
      },
    });

    const transactionCountCabang = await db.transaction.count({
      where: {
        office_code: "116", // Tambahkan filter di sini
      },
    });

    // Pastikan total amount dikonversi ke number (karena Prisma bisa mengembalikan Decimal/String)
    const totalBalancePusat = parseFloat(
      totalBalanceResultPusat._sum.amount || 0
    );

    const totalBalanceCabang = parseFloat(
      totalBalanceResultCabang._sum.amount || 0
    );

    const stats = {
      balancePusat: totalBalancePusat,
      balanceCabang: totalBalanceCabang,
      customers: customerCount,
      users: userCount,
      transactionsPusat: transactionCountPusat,
      transactionsCabang: transactionCountCabang,
    };

    return NextResponse.json({ stats }, { status: 200 });
  } catch (error) {
    console.error("Kesalahan saat mengambil data statistik dashboard:", error);
    return NextResponse.json(
      { message: "Kesalahan server internal saat memuat statistik." },
      { status: 500 }
    );
  }
}
