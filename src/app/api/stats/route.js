import { NextResponse } from "next/server";
import { db } from "@/lib/db"; // Asumsi path ke client Prisma Anda

export async function GET() {
  try {
    // 1. Ambil Total Balance Pusat (Total amount dari semua transaksi)
    const totalBalanceResultPusat = await db.transaction.aggregate({
      where: {
        OR: [{ office_code: "111" }, { office_code: "136" }], // Tambahkan filter di sini
      },
      _sum: {
        amount: true,
      },
    });

    // 1. Ambil Total Balance Cabang (Total amount dari semua transaksi)
    const totalBalanceResultCabang = await db.transaction.aggregate({
      where: {
        OR: [{ office_code: "116" }, { office_code: "129" }], // Tambahkan filter di sini
      },
      _sum: {
        amount: true,
      },
    });

    const totalBalanceResultKas = await db.transaction.aggregate({
      where: {
        OR: [{ office_code: "139" }, { office_code: "138" }], // Tambahkan filter di sini
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
        OR: [{ office_code: "111" }, { office_code: "136" }], // Tambahkan filter di sini
      },
    });

    const transactionCountCabang = await db.transaction.count({
      where: {
        OR: [{ office_code: "116" }, { office_code: "129" }], // Tambahkan filter di sini
      },
    });

    const transactionCountKas = await db.transaction.count({
      where: {
        OR: [{ office_code: "139" }, { office_code: "138" }], // Tambahkan filter di sini
      },
    });

    // Pastikan total amount dikonversi ke number (karena Prisma bisa mengembalikan Decimal/String)
    const totalBalancePusat = parseFloat(
      totalBalanceResultPusat._sum.amount || 0
    );

    const totalBalanceCabang = parseFloat(
      totalBalanceResultCabang._sum.amount || 0
    );

    const totalBalanceKas = parseFloat(
      totalBalanceResultKas._sum.amount || 0
    );

    const stats = {
      balancePusat: totalBalancePusat,
      balanceCabang: totalBalanceCabang,
      balanceKas: totalBalanceKas,
      customers: customerCount,
      users: userCount,
      transactionsPusat: transactionCountPusat,
      transactionsCabang: transactionCountCabang,
      transactionsKas: transactionCountKas,
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
