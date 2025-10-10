import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { db } from "@/lib/db";

export async function GET() {
  try {
    // 1. Agregasi Transaksi: Kelompokkan berdasarkan userId, hitung total amount, dan hitung jumlah transaksi
    const aggregatedTransactions = await db.transaction.groupBy({
      by: ["userId"],
      _sum: {
        amount: true,
      },
      _count: {
        // BARU: Tambahkan count untuk menghitung jumlah transaksi
        id: true, // Hitung setiap ID transaksi
      },
      orderBy: {
        _sum: {
          amount: "desc",
        },
      },
    });

    if (aggregatedTransactions.length === 0) {
      return NextResponse.json({ groupedTransactions: [] }, { status: 200 });
    }

    // 2. Ambil ID User dan data full_name
    const userIds = aggregatedTransactions.map((item) => item.userId);

    const users = await db.user.findMany({
      where: {
        id: {
          in: userIds,
        },
      },
      select: {
        id: true,
        full_name: true,
      },
    });

    const userMap = users.reduce((map, user) => {
      map[user.id] = user.full_name;
      return map;
    }, {});

    // 3. Gabungkan hasil agregasi (sum dan count) dengan nama lengkap user
    const groupedTransactions = aggregatedTransactions
      .map((item) => ({
        full_name: userMap[item.userId] || "User Tidak Dikenal",
        total_amount: item._sum.amount || 0,
        transaction_count: item._count.id || 0, // BARU: Ambil jumlah transaksi
      }))
      .filter((item) => item.total_amount > 0);

    // Mengembalikan data yang sudah dikelompokkan (kini termasuk count)
    return NextResponse.json({ groupedTransactions }, { status: 200 });
  } catch (error) {
    console.error("Kesalahan saat mengambil data transaksi:", error);
    return NextResponse.json(
      { message: "Kesalahan server internal." },
      { status: 500 }
    );
  }
}
