import {
  PrismaClientKnownRequestError,
  PrismaClientValidationError,
} from "@prisma/client/runtime/library";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(req) {
  try {
    const {
      nasabah_id,
      no_alternatif,
      type_customer,
      account_balance,
      created_by_user_id,
      address,
      full_name,
    } = await req.json();

    // Pastikan data yang diperlukan ada
    if (
      !nasabah_id ||
      !no_alternatif ||
      !type_customer ||
      !account_balance ||
      !address ||
      !full_name
    ) {
      return NextResponse.json(
        { message: "Semua kolom harus diisi." },
        { status: 400 }
      );
    }

    // Simpan data nasabah baru ke database
    const newCustomer = await db.customer.create({
      data: {
        nasabah_id: nasabah_id,
        no_alternatif: no_alternatif,
        type_customer: type_customer,
        account_balance: account_balance,
        created_by_user_id: created_by_user_id,
        address: address,
        full_name: full_name,
      },
    });

    return NextResponse.json(
      { message: "Nasabah berhasil ditambahkan", customer: newCustomer },
      { status: 201 } // Created
    );
  } catch (error) {
    console.error("Kesalahan saat menambahkan nasabah:", error);
    return NextResponse.json(
      { message: "Kesalahan server internal." },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    // Ambil semua data customer dari database
    const customers = await db.customer.findMany();

    return NextResponse.json({ customers }, { status: 200 });
  } catch (error) {
    console.error("Kesalahan saat mengambil data customer:", error);
    return NextResponse.json(
      { message: "Kesalahan server internal." },
      { status: 500 }
    );
  }
}
