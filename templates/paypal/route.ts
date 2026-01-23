import { NextRequest, NextResponse } from "next/server";
import { createOrder } from "./create-order";
import { captureOrder } from "./capture-order";

export const POST = async (req: NextRequest) => {
  const { amount } = await req.json();
  const order = await createOrder(amount);
  return NextResponse.json(order);
};
