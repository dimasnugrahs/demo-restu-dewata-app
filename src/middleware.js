// middleware.js yang sudah diperbaiki
import { NextResponse } from "next/server";
import { jwtVerify } from "jose";

const protectedRoutes = [
  "/beranda",
  "/customer",
  "/transactions",
  "/users",
  "/transaction",
];
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
      // Jika token tidak valid, hapus cookie dan redirect ke /auth
      const response = NextResponse.redirect(new URL("/auth", request.url));
      response.cookies.set("authToken", "", { maxAge: 0 });
      return response;
    }
  }

  // --- Bagian 2: Penanganan Rute Publik (Jika sudah login, jangan biarkan akses /auth) ---
  if (publicRoutes.includes(currentPath) && userPayload) {
    // Jika user sudah login dan mencoba mengakses /auth, redirect ke /beranda atau rute default
    return NextResponse.redirect(new URL("/transaction", request.url));
  }

  // 3. Jika pengguna sudah login (token valid) dan mencoba rute publik, redirect
  if (protectedRoutes.includes(currentPath) && !userPayload) {
    return NextResponse.redirect(new URL("/auth", request.url));
  }

  const response = NextResponse.next();

  // Tambahkan payload ke header untuk pengambilan data pengguna di komponen server
  if (userPayload) {
    response.headers.set("x-user-payload", JSON.stringify(userPayload));
  }

  // Penanganan Rute Root (Opsional, tapi sering dilakukan)
  // Jika pengguna mengakses rute root (/) dan sudah login, arahkan ke /beranda
  if (currentPath === "/" && userPayload) {
    return NextResponse.redirect(new URL("/beranda", request.url));
  }

  return response;
}

export const config = {
  matcher: [
    "/",
    "/dashboard",
    "/auth/:path*",
    "/beranda",
    "/transaction",
    "/transactions",
    "/customer",
  ],
};
