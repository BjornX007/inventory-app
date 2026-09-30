import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongoose";
import Warehouse from "@/models/Warehouse";

export async function GET() {
  await dbConnect();

  const warehouses = await Warehouse.find().sort({ isMain: -1 });
  return NextResponse.json(warehouses, { status: 200 });
}

export async function POST(req) {
  await dbConnect();

  const body = await req.json();
  const { name } = body;

  const newWarehouse = await Warehouse.create({
    name,
    isMain: false,
  });

  return NextResponse.json(newWarehouse, { status: 201 });
}
