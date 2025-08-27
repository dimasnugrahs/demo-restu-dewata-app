import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST() {
  const response = NextResponse.json(
    { message: "Logout berhasil" },
    { status: 200 }
  );

  // Hapus cookie 'authToken'
  response.cookies.set("authToken", "", {
    httpOnly: true,
    expires: new Date(0), // Mengatur tanggal kedaluwarsa ke masa lalu
    path: "/",
  });

  return response;
}
