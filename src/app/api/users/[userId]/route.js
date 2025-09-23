import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";
import jwt, { JsonWebTokenError } from "jsonwebtoken";
import { db } from "@/lib/db";

export async function GET(request, { params }) {
  try {
    //Get user by id
    const user = await db.user.findFirst({
      where: {
        id: params.userId,
      },
    });

    //Check if user is found
    if (!user) {
      return new NextResponse("User Not Found", { status: 404 });
    }

    //Return user to client
    return NextResponse.json(user, { status: 200 });
  } catch (err) {
    console.log(err);
    return new NextResponse("Internal server error", {
      status: err.status || 500,
    });
  }
}

export async function PATCH(req, { params }) {
  try {
    //Get user by id
    const user = await db.user.findFirst({
      where: {
        id: params.userId,
      },
    });

    //Check if user is found
    if (!user) {
      return new NextResponse("User Not Found", { status: 404 });
    }

    //Get name user from body
    const { full_name } = await req.json();

    //Update nasabah
    const updateUser = await db.user.update({
      where: {
        id: params.userId,
      },
      data: {
        full_name: full_name,
      },
    });

    //Return user to client
    return NextResponse.json(updateUser, { status: 200 });
  } catch (err) {
    return new NextResponse("Internal server error", {
      status: err.status || 500,
    });
  }
}

// Delete user by id
export async function DELETE(req, { params }) {
  try {
    //Get user by id
    const user = await db.user.findFirst({
      where: {
        id: params.userId,
      },
    });

    //Check if user is found
    if (!user) {
      return new NextResponse("User Not Found", { status: 404 });
    }

    //Delete user
    await db.user.delete({
      where: {
        id: params.userId,
      },
    });

    //Return user to client
    return NextResponse.json({ message: "User deleted." }, { status: 200 });
  } catch (err) {
    return new NextResponse("Internal server error", {
      status: err.status || 500,
    });
  }
}
