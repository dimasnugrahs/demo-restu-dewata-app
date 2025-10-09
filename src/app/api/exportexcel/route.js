import { NextResponse } from "next/server";
import { db } from "@/lib/db"; // Asumsi path ke client Prisma Anda
import ExcelJS from "exceljs";
import { Transform } from "stream";

// Fungsi untuk mendapatkan data dan menghasilkan Buffer file Excel
async function generateExcelBuffer(transactions) {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("Data Transaksi");

  // 1. Tentukan Header Kolom sesuai urutan baru
  worksheet.columns = [
    { header: "Nomor Rekening", key: "nasabah_id", width: 30 }, // 1. dari tabel customer/Nasabah
    {
      header: "Jumlah",
      key: "amount",
      width: 20,
      style: { numFmt: "#,##0.00" },
    },
    { header: "Deskripsi", key: "description", width: 50 },
    { header: "Jenis Transaksi", key: "transaction_type", width: 20 },
    { header: "Kode Kantor", key: "office_code", width: 20 },

    // Catatan: Kolom lama seperti ID Transaksi, Tanggal, ID Nasabah, Nama, dan User ID dihapus
  ];

  // Terapkan styling untuk Header
  worksheet.getRow(1).eachCell((cell) => {
    cell.font = { bold: true, size: 12, color: { argb: "000000" } };
    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "ffffff" }, // Warna ungu indigo
    };
    cell.border = {
      top: { style: "thin" },
      left: { style: "thin" },
      bottom: { style: "thin" },
      right: { style: "thin" },
    };
  });

  // 2. Tambahkan Data Baris (Mapping sesuai kolom baru)
  transactions.forEach((transaction, index) => {
    const row = worksheet.addRow({
      // Mapping field berdasarkan key kolom yang baru
      nasabah_id: transaction.customer?.nasabah_id || "N/A", // Asumsi field di model Nasabah adalah 'account_number'
      amount: parseFloat(transaction.amount),
      description: transaction.description,
      transaction_type: transaction.transaction_type,
      office_code: transaction.office_code || "N/A", // Jika office_code bisa null
    });

    // Beri warna latar belakang berbeda pada baris ganjil/genap
    // if (index % 2 !== 0) {
    //     row.fill = {
    //         type: 'pattern',
    //         pattern: 'solid',
    //         fgColor: { argb: 'FFE0E7FF' } // Warna latar belakang ringan
    //     };
    // }
  });

  // 3. Tulis Workbook ke Buffer
  const buffer = await workbook.xlsx.writeBuffer();
  return buffer;
}

export async function GET() {
  try {
    // Ambil semua data transaksi, diurutkan berdasarkan tanggal terbaru
    const transactions = await db.transaction.findMany({
      // >>>>>> PENYESUAIAN UTAMA: Gunakan 'include' untuk memuat data nasabah <<<<<<
      include: {
        customer: {
          // Asumsi nama relasi di skema Prisma adalah 'nasabah'
          select: {
            // Ambil Nomor Rekening. Sesuaikan jika field Anda bernama 'no_rekening'.
            nasabah_id: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    if (transactions.length === 0) {
      return NextResponse.json(
        { message: "Tidak ada data transaksi untuk diekspor." },
        { status: 404 }
      );
    }

    const excelBuffer = await generateExcelBuffer(transactions);

    // 4. Kirim Buffer sebagai Response
    const fileName = `Laporan_Transaksi_${new Date()
      .toISOString()
      .slice(0, 10)}.xlsx`;

    return new Response(excelBuffer, {
      status: 200,
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="${fileName}"`,
        "Content-Length": excelBuffer.length,
      },
    });
  } catch (error) {
    console.error("Gagal mengekspor data ke Excel:", error);
    return NextResponse.json(
      { message: "Terjadi kesalahan server saat mengekspor data." },
      { status: 500 }
    );
  }
}
