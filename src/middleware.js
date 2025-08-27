// middleware.js

import { NextResponse } from "next/server";

// Rute yang hanya bisa diakses oleh pengguna yang sudah login
const protectedRoutes = ["/", "/dashboard"];
// Rute yang harus dialihkan jika pengguna sudah login
const publicRoutes = ["/auth", "/auth/signup"];

export function middleware(request) {
  // Ambil cookie 'authToken' dari request
  const authToken = request.cookies.get("authToken")?.value;
  const currentPath = request.nextUrl.pathname;

  // 1. Jika pengguna mencoba mengakses rute yang dilindungi dan tidak memiliki token,
  //    redirect ke halaman login.
  if (protectedRoutes.includes(currentPath) && !authToken) {
    return NextResponse.redirect(new URL("/auth", request.url));
  }

  // 2. Jika pengguna sudah login dan mencoba mengakses halaman publik (login/signup),
  //    redirect ke dashboard.
  if (publicRoutes.includes(currentPath) && authToken) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  // Lanjutkan ke rute yang diminta
  return NextResponse.next();
}

export const config = {
  // Tentukan rute yang akan diperiksa oleh middleware
  // Pastikan matcher mencakup semua rute yang perlu dilindungi atau dialihkan
  matcher: ["/", "/dashboard", "/auth", "/auth/signup"],
};
