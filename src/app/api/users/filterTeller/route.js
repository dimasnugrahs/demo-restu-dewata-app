import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const tellers = await db.user.findMany({
      where: {
        role: "TELLER", // Hanya ambil yang rolenya TELLER
      },
      select: {
        id: true,
        full_name: true,
        access_token: true, // Atau field lain yang mewakili "Kode Kantor"
      },
    });

    return NextResponse.json({ tellers }, { status: 200 });
  } catch (error) {
    console.error("Kesalahan saat mengambil data user:", error);
    return NextResponse.json(
      { message: "Kesalahan server internal." },
      { status: 500 }
    );
  }
}
