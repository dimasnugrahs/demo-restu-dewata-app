import { db } from "@/lib/db";
import ExcelJS from "exceljs";
import { NextResponse } from "next/server";

// Gunakan fungsi GET yang diekspor untuk menangani permintaan GET
export async function GET(request) {
  try {
    // 1. Ambil Nama Marketing dari Query Parameter
    const { searchParams } = new URL(request.url);
    const marketingName = searchParams.get("marketingName");

    if (!marketingName) {
      return NextResponse.json(
        { message: "Parameter marketingName diperlukan." },
        { status: 400 }
      );
    }

    // 2. Ambil User ID berdasarkan Nama Marketing
    const user = await db.user.findFirst({
      where: {
        full_name: marketingName,
      },
      select: {
        id: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        {
          message: `Marketing dengan nama "${marketingName}" tidak ditemukan.`,
        },
        { status: 404 }
      );
    }

    // 3. Ambil Data Transaksi yang Difilter
    const transactions = await db.transaction.findMany({
      where: {
        userId: user.id,
      },
      include: {
        customer: {
          select: { full_name: true },
        },
        user: {
          select: { full_name: true },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    if (transactions.length === 0) {
      return NextResponse.json(
        { message: "Tidak ditemukan data transaksi untuk marketing ini." },
        { status: 404 }
      );
    }

    // 4. Buat Workbook Excel
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("Laporan Transaksi Marketing");

    sheet.columns = [
      { header: "No.", key: "no", width: 5 },
      { header: "Tanggal Transaksi", key: "tanggal", width: 25 },
      { header: "Nama Nasabah", key: "nasabah", width: 30 },
      { header: "Jenis Transaksi", key: "jenis", width: 20 },
      { header: "Jumlah (Rp)", key: "jumlah", width: 20 },
      { header: "Deskripsi", key: "deskripsi", width: 40 },
      { header: "Nama Marketing", key: "marketing", width: 30 },
    ];

    transactions.forEach((t, index) => {
      sheet.addRow({
        no: index + 1,
        tanggal: new Date(t.createdAt).toLocaleString("id-ID"),
        nasabah: t.customer?.full_name || "N/A",
        jenis: t.transaction_type,
        // Menggunakan toString() untuk Decimal
        jumlah: t.amount.toString(),
        deskripsi: t.description,
        marketing: t.user?.full_name || "N/Ax",
      });
    });

    // 5. Kirim Respons File Excel (Menggunakan ArrayBuffer)
    const buffer = await workbook.xlsx.writeBuffer();

    const fileName = `Laporan_Transaksi_${marketingName.replace(
      /[^a-z0-9]/gi,
      "_"
    )}.xlsx`;

    // Kirim ArrayBuffer sebagai respons Blob
    return new Response(buffer, {
      status: 200,
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="${fileName}"`,
      },
    });
  } catch (error) {
    console.error("Error generating Excel report:", error);
    return NextResponse.json(
      { message: "Gagal menghasilkan laporan Excel dari server." },
      { status: 500 }
    );
  }
}

// Opsional: Anda bisa menambahkan fungsi OPTIONS untuk Preflight, meskipun Next.js biasanya menanganinya
export async function OPTIONS() {
  return NextResponse.json({}, { status: 200 });
}
