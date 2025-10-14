import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";
import jwt, { JsonWebTokenError } from "jsonwebtoken";
import { db } from "@/lib/db";

export async function GET(request, { params }) {
  try {
    //Get transaction by id
    const transaction = await db.transaction.findFirst({
      where: {
        id: params.transactionId,
      },
      include: {
        customer: {
          select: {
            // Pastikan menggunakan nama kolom yang benar di tabel customer
            full_name: true,
          },
        },
      },
    });

    //Check if transaction is found
    if (!transaction) {
      return new NextResponse("Transaction Not Found", { status: 404 });
    }

    //Return transaction to client
    return NextResponse.json(transaction, { status: 200 });
  } catch (err) {
    console.log(err);
    return new NextResponse("Internal server error", {
      status: err.status || 500,
    });
  }
}

export async function PATCH(req, { params }) {
  try {
    //Get transaction by id
    const transaction = await db.transaction.findFirst({
      where: {
        id: params.transactionId,
      },
      include: {
        customer: {
          select: {
            full_name: true,
          },
        },
      },
    });

    //Check if transaction is found
    if (!transaction) {
      return new NextResponse("Transaction Not Found", { status: 404 });
    }

    //Get name transaction from body
    const { transaction_type, amount, description, office_code } =
      await req.json();

    //Update nasabah
    const updateTransaction = await db.transaction.update({
      where: {
        id: params.transactionId,
      },
      data: {
        transaction_type: transaction_type,
        amount: amount,
        description: description,
        office_code: office_code,
      },
    });

    //Return product to client
    return NextResponse.json(updateTransaction, { status: 200 });
  } catch (err) {
    return new NextResponse("Internal server error", {
      status: err.status || 500,
    });
  }
}

// Delete transaction by id
export async function DELETE(req, { params }) {
  try {
    //Get transaction by id
    const transaction = await db.transaction.findFirst({
      where: {
        id: params.transactionId,
      },
    });

    //Check if transaction is found
    if (!transaction) {
      return new NextResponse("transaction Not Found", { status: 404 });
    }

    //Delete transaction
    await db.transaction.delete({
      where: {
        id: params.transactionId,
      },
    });

    //Return transaction to client
    return NextResponse.json(
      { message: "transaction deleted." },
      { status: 200 }
    );
  } catch (err) {
    return new NextResponse("Internal server error", {
      status: err.status || 500,
    });
  }
}
