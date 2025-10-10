import { NextResponse } from "next/server";
import { db } from "@/lib/db"; // Asumsi path ke client Prisma Anda

export async function GET() {
  try {
    // 1. Ambil Total Balance (Total amount dari semua transaksi)
    const totalBalanceResult = await db.transaction.aggregate({
      _sum: {
        amount: true,
      },
    });

    // 2. Hitung Jumlah Customers
    const customerCount = await db.customer.count();

    // 3. Hitung Jumlah Users
    const userCount = await db.user.count();

    // 4. Hitung Jumlah Transactions
    const transactionCount = await db.transaction.count();

    // Pastikan total amount dikonversi ke number (karena Prisma bisa mengembalikan Decimal/String)
    const totalBalance = parseFloat(totalBalanceResult._sum.amount || 0);

    const stats = {
      balance: totalBalance,
      customers: customerCount,
      users: userCount,
      transactions: transactionCount,
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
