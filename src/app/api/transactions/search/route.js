import { NextResponse } from "next/server";
import { db } from "@/lib/db"; // Asumsi path ke client Prisma Anda

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get("q") || ""; // Ambil query pencarian

    if (!query || query.length < 3) {
      // Hanya cari jika query minimal 3 karakter untuk efisiensi
      return NextResponse.json({ customer: [] }, { status: 200 });
    }

    const customerList = await db.customer.findMany({
      where: {
        OR: [
          // Cari berdasarkan ID nasabah (case-insensitive)
          { id: { contains: query, mode: "insensitive" } },
          // Cari berdasarkan Nama Lengkap (case-insensitive)
          { full_name: { contains: query, mode: "insensitive" } },
          // Cari berdasarkan Nomor Rekening
          { nasabah_id: { contains: query, mode: "insensitive" } },
          // Tambahkan pencarian Nomor Rekening Alternatif
          {
            no_alternatif: {
              contains: query,
              mode: "insensitive",
            },
          },
        ],
      },
      // Hanya ambil field yang diperlukan untuk suggestion
      select: {
        id: true,
        full_name: true,
        nasabah_id: true,
        no_alternatif: true,
      },
      take: 10, // Batasi hasilnya
    });

    return NextResponse.json({ customer: customerList }, { status: 200 });
  } catch (error) {
    console.error("Failed to search nasabah:", error);
    return NextResponse.json(
      { message: "Kesalahan server saat mencari nasabah." },
      { status: 500 }
    );
  }
}
