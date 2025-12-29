import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";
import jwt, { JsonWebTokenError } from "jsonwebtoken";
import { db } from "@/lib/db";

export async function GET(request, { params }) {
  try {
    const { userId } = await params;

    const user = await db.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return NextResponse.json({ message: "User Not Found" }, { status: 404 });
    }

    return NextResponse.json(user, { status: 200 });
  } catch (err) {
    console.error("GET ERROR:", err);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PATCH(req, { params }) {
  try {
    const { userId } = await params;
    const body = await req.json();
    const { full_name, role, email, username, access_token } = body;

    // 1. Cek apakah user ada sebelum diupdate
    const existingUser = await db.user.findUnique({
      where: { id: userId },
    });

    if (!existingUser) {
      return NextResponse.json({ message: "User Not Found" }, { status: 404 });
    }

    // 2. Lakukan Update
    const updateUser = await db.user.update({
      where: { id: userId },
      data: {
        full_name,
        role,
        email,
        username,
        access_token,
      },
    });

    return NextResponse.json(updateUser, { status: 200 });
  } catch (err) {
    console.error("PATCH ERROR:", err); // Lihat log ini di terminal VS Code Anda
    return NextResponse.json(
      { message: err.message || "Internal server error" },
      { status: 500 }
    );
  }
}

// Delete user by id
export async function DELETE(req, { params }) {
  try {
    const { userId } = await params;

    //Get user by id
    const user = await db.user.findUnique({
      // findUnique lebih efisien untuk ID
      where: {
        id: userId,
      },
    });

    if (!user) {
      return new NextResponse("User Not Found", { status: 404 });
    }

    await db.user.delete({
      where: {
        id: userId,
      },
    });

    return NextResponse.json({ message: "User deleted." }, { status: 200 });
  } catch (err) {
    console.error(err);
    return new NextResponse("Internal server error", {
      status: 500,
    });
  }
}
