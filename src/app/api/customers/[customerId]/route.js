import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";
import jwt, { JsonWebTokenError } from "jsonwebtoken";
import { db } from "@/lib/db";

export async function GET(request, { params }) {
  try {
    //Get nasabah by id
    const customer = await db.customer.findFirst({
      where: {
        id: params.customerId,
      },
    });

    //Check if nasabah is found
    if (!customer) {
      return new NextResponse("Nasabah Not Found", { status: 404 });
    }

    //Return nasabah to client
    return NextResponse.json(customer, { status: 200 });
  } catch (err) {
    console.log(err);
    return new NextResponse("Internal server error", {
      status: err.status || 500,
    });
  }
}

export async function PATCH(req, { params }) {
  try {
    //Get nasabah by id
    const customer = await db.customer.findFirst({
      where: {
        id: params.customerId,
      },
    });

    //Check if nasabah is found
    if (!customer) {
      return new NextResponse("Nasabah Not Found", { status: 404 });
    }

    //Get name nasabah from body
    const {
      nasabah_id,
      no_alternatif,
      type_customer,
      account_balance,
      created_by_user_id,
      address,
      full_name,
    } = await req.json();

    //Update nasabah
    const updateCustomer = await db.customer.update({
      where: {
        id: params.customerId,
      },
      data: {
        nasabah_id: nasabah_id,
        no_alternatif: no_alternatif,
        type_customer: type_customer,
        account_balance: account_balance,
        created_by_user_id: created_by_user_id,
        address: address,
        full_name: full_name,
      },
    });

    //Return product to client
    return NextResponse.json(updateCustomer, { status: 200 });
  } catch (err) {
    return new NextResponse("Internal server error", {
      status: err.status || 500,
    });
  }
}

// Delete customer by id
export async function DELETE(req, { params }) {
  try {
    //Get customer by id
    const customer = await db.customer.findFirst({
      where: {
        id: params.customerId,
      },
    });

    //Check if customer is found
    if (!customer) {
      return new NextResponse("Customer Not Found", { status: 404 });
    }

    //Delete customer
    await db.customer.delete({
      where: {
        id: params.customerId,
      },
    });

    //Return customer to client
    return NextResponse.json({ message: "Customer deleted." }, { status: 200 });
  } catch (err) {
    return new NextResponse("Internal server error", {
      status: err.status || 500,
    });
  }
}
