// middleware.js yang sudah diperbaiki
import { NextResponse } from "next/server";
import { jwtVerify } from "jose";

const protectedRoutes = ["/beranda", "/dashboard", "/"];
const publicRoutes = ["/auth", "/auth/signup"];

export async function middleware(request) {
  const authToken = request.cookies.get("authToken")?.value;
  const currentPath = request.nextUrl.pathname;

  // 1. Verifikasi token dan dapatkan payload (data user)
  let userPayload = null;
  if (authToken) {
    try {
      const { payload } = await jwtVerify(
        authToken,
        new TextEncoder().encode(process.env.JWT_ACCESS_KEY)
      );
      userPayload = payload;
    } catch (error) {
      console.error("Token verification failed:", error);
      // Token tidak valid, hapus cookie
      const response = NextResponse.redirect(new URL("/auth", request.url));
      response.cookies.set("authToken", "", { maxAge: 0 });
      return response;
    }
  }

  // 2. Jika pengguna mencoba rute yang dilindungi dan token tidak valid, redirect
  if (protectedRoutes.includes(currentPath) && !userPayload) {
    return NextResponse.redirect(new URL("/auth", request.url));
  }

  // 3. Jika pengguna sudah login (token valid) dan mencoba rute publik, redirect
  if (publicRoutes.includes(currentPath) && userPayload) {
    return NextResponse.redirect(new URL("/beranda", request.url));
  }

  // Lanjutkan request. Jika token valid, tambahkan data pengguna ke header
  // Ini adalah bagian TERPENTING untuk mengambil data di halaman dashboard
  const response = NextResponse.next();
  if (userPayload) {
    response.headers.set("x-user-payload", JSON.stringify(userPayload));
  }
  return response;
}

export const config = {
  matcher: ["/", "/dashboard", "/auth", "/auth/signup"],
};
