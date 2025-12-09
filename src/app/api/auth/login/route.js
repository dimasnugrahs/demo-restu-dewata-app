import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { compareSync } from "bcrypt";
import jwt from "jsonwebtoken";
import { db } from "@/lib/db";

export async function POST(req) {
  try {
    const { loginId, password } = await req.json();

    // 1. Cari pengguna di database
    // Gunakan "OR" untuk mencari berdasarkan email atau username
    const user = await db.user.findFirst({
      where: {
        OR: [{ email: loginId }, { username: loginId }],
      },
    });

    // 2. Jika pengguna tidak ditemukan, kirim respons 401
    if (!user) {
      return NextResponse.json(
        { message: "Invalid email or password" },
        { status: 401 }
      );
    }

    // 3. Bandingkan kata sandi yang diberikan dengan password_hash di database
    const isPasswordValid = compareSync(password, user.password_hash);
    if (!isPasswordValid) {
      return NextResponse.json(
        { message: "Invalid email or password" },
        { status: 401 }
      );
    }

    // 4. Buat JSON Web Token (JWT)
    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role,
        full_name: user.full_name,
        username: user.username,
      },
      process.env.JWT_ACCESS_KEY, // Gunakan kunci rahasia dari variabel lingkungan
      { expiresIn: "1y" }
    );

    // 5. Buat respons dan atur cookie di server
    const response = NextResponse.json(
      {
        message: "Login berhasil",
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
          full_name: user.full_name,
          username: user.username,
        },
      },
      { status: 200 }
    );

    const oneYearInSeconds = 365 * 24 * 60 * 60;

    response.cookies.set("authToken", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/transaction",
      maxAge: oneYearInSeconds,
    });

    return response;
  } catch (error) {
    console.error("Login API Error:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
