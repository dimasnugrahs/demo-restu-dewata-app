import {
  PrismaClientKnownRequestError,
  PrismaClientValidationError,
} from "@prisma/client/runtime/library";
import { hashSync } from "bcrypt";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(req, res) {
  try {
    // Get data from body request
    const { full_name, email, password_hash, role, username } =
      await req.json();

    // Create new user
    const user = await db.user.create({
      data: {
        full_name,
        password_hash: hashSync(password_hash, 10),
        username,
        email,
        role: role || "MARKETING",
      },
    });

    // Delete password from object user for hiding password
    delete user.password_hash;

    // Return user
    return NextResponse.json({
      ...user,
    });
  } catch (err) {
    if (err instanceof PrismaClientKnownRequestError) {
      return new NextResponse("User already exists", { status: 400 });
    } else if (err instanceof PrismaClientValidationError) {
      return new NextResponse("User validation error", { status: 400 });
    } else {
      console.error(err);
      return new NextResponse("Internal Server Error", { status: 500 });
    }
  }
}

export async function GET() {
  try {
    // Ambil semua data customer dari database
    const users = await db.user.findMany();

    return NextResponse.json({ users }, { status: 200 });
  } catch (error) {
    console.error("Kesalahan saat mengambil data user:", error);
    return NextResponse.json(
      { message: "Kesalahan server internal." },
      { status: 500 }
    );
  }
}
