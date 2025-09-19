import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

export async function GET() {
  try {
    // 1. Dapatkan referensi ke store cookies.
    const cookieStore = cookies();
    // 2. Ambil cookie dengan aman dari store tersebut.
    const token = cookieStore.get("authToken")?.value;

    if (!token) {
      return NextResponse.json(
        { message: "Not authenticated" },
        { status: 401 }
      );
    }

    const user = jwt.verify(token, process.env.JWT_ACCESS_KEY);

    return NextResponse.json({ user }, { status: 200 });
  } catch (error) {
    console.error("Token verification failed:", error);
    return NextResponse.json({ message: "Invalid token" }, { status: 401 });
  }
}
