import { NextResponse } from "next/server";
import { db } from "@/lib/db"; // Asumsi path ke client Prisma Anda

/**
 * Menghapus transaksi yang lebih lama dari tanggal batas yang ditentukan, atau menghapus semua transaksi.
 * * Endpoint: DELETE /api/transactions/cleanup
 * Query Param Opsional:
 * - ?beforeDate=YYYY-MM-DD : Menghapus transaksi sebelum tanggal ini.
 * - ?deleteAll=true       : Menghapus SEMUA transaksi dalam tabel.
 */
export async function DELETE(req) {
  try {
    const { searchParams } = new URL(req.url);
    const beforeDateStr = searchParams.get("beforeDate");
    const deleteAllStr = searchParams.get("deleteAll");

    let whereCondition = {};
    let cleanupMessage = "Tidak ada transaksi yang dihapus.";

    // --- Logika Hapus Semua ---
    if (deleteAllStr === "true") {
      // Jika deleteAll=true, kosongkan whereCondition untuk menghapus semua data.
      whereCondition = {};
      cleanupMessage = "Semua transaksi dalam database telah dihapus.";
    }
    // --- Logika Hapus Berdasarkan Tanggal (Default/Filtered) ---
    else {
      let dateFilter;

      if (beforeDateStr) {
        // Jika pengguna memberikan tanggal, gunakan tanggal tersebut.
        dateFilter = new Date(beforeDateStr);
        // Atur waktu ke 23:59:59.999 agar filter mencakup seluruh hari yang ditentukan
        dateFilter.setHours(23, 59, 59, 999);
        cleanupMessage = `Transaksi yang dihapus dibuat sebelum: ${dateFilter.toLocaleString()}`;
      } else {
        // Default: Hapus semua transaksi sebelum awal hari ini (00:00:00)
        dateFilter = new Date();
        dateFilter.setHours(0, 0, 0, 0);
        cleanupMessage = `Transaksi yang dihapus dibuat sebelum awal hari ini: ${dateFilter.toLocaleString()}`;
      }

      whereCondition = {
        createdAt: {
          lt: dateFilter, // lt = less than (kurang dari). Menghapus rekaman yang dibuat sebelum tanggal ini.
        },
      };
    }

    // Jalankan perintah penghapusan massal
    const result = await db.transaction.deleteMany({
      where: whereCondition,
    });

    // Hasil berisi jumlah rekaman yang dihapus
    return NextResponse.json(
      {
        message: `Berhasil menghapus ${result.count} transaksi. ${
          result.count > 0 ? cleanupMessage : ""
        }`,
        count: result.count,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Gagal menghapus transaksi:", error);
    return NextResponse.json(
      { message: "Terjadi kesalahan saat menghapus data transaksi." },
      { status: 500 }
    );
  }
}
