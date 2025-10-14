import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { db } from "@/lib/db"; // Asumsi path ke client Prisma Anda

export async function GET() {
  try {
    // Ambil semua data transaction dari database
    const transactions = await db.transaction.findMany({
      include: {
        customer: true, // Sertakan data nasabah yang berelasi
      },
    });

    return NextResponse.json({ transactions }, { status: 200 });
  } catch (error) {
    console.error("Kesalahan saat mengambil data customer:", error);
    return NextResponse.json(
      { message: "Kesalahan server internal." },
      { status: 500 }
    );
  }
}

// Fungsi untuk mendapatkan userId dari token JWT di cookie
const getUserIdFromToken = () => {
  const cookieStore = cookies();
  const token = cookieStore.get("authToken")?.value;

  if (!token) {
    return null;
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_ACCESS_KEY);
    return decoded.id;
  } catch (error) {
    console.error("JWT verification failed:", error.message);
    return null;
  }
};

export async function POST(req) {
  try {
    const userId = getUserIdFromToken();
    if (!userId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { identifier, transaction_type, amount, description, office_code } =
      body;

    // Validasi data input
    if (!identifier || !transaction_type || !amount || !office_code) {
      return NextResponse.json(
        { message: "Semua field wajib diisi" },
        { status: 400 }
      );
    }

    if (isNaN(parseFloat(amount))) {
      return NextResponse.json(
        { message: "Amount harus berupa angka" },
        { status: 400 }
      );
    }

    // --- Langkah 1: Cari Nasabah Berdasarkan Identifier ---
    const nasabah = await db.customer.findFirst({
      where: {
        OR: [
          { id: identifier }, // Cari berdasarkan ID Nasabah
          { nasabah_id: identifier }, // Cari berdasarkan no rekening
          { full_name: identifier }, // Cari berdasarkan Nama Lengkap
          { no_alternatif: identifier }, // Cari berdasarkan Nomor Rekening Alternatif
        ],
      },
      // Hanya ambil ID-nya saja (sesuaikan dengan field Anda)
      select: {
        id: true,
        nasabah_id: true,
        full_name: true,
      },
    });

    if (!nasabah) {
      return NextResponse.json(
        { message: "Nasabah tidak ditemukan dengan identifier tersebut." },
        { status: 404 }
      );
    }

    const nasabah_id = nasabah.id;
    // 💡 KOREKSI B: Ambil Nomor Rekening yang sebenarnya
    const no_rekening = nasabah.nasabah_id;
    const full_name = nasabah.full_name;

    const newDescription = `Setoran Mobile Collector - No rek ${no_rekening} - a.n ${full_name}`;

    // Simpan data transaksi ke database
    const newTransaction = await db.transaction.create({
      data: {
        nasabah_id, // ID nasabah yang sudah diverifikasi
        userId,
        transaction_type,
        amount: parseFloat(amount),
        description:newDescription,
        office_code,
      },
    });

    return NextResponse.json(
      {
        message: "Transaksi berhasil ditambahkan",
        transaction: newTransaction,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Failed to create transaction. Details:", error);
    return NextResponse.json(
      { message: "Terjadi kesalahan internal server" },
      { status: 500 }
    );
  }
}
