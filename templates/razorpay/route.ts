import { NextRequest, NextResponse } from "next/server";
import { razorpay } from "./client";

export const POST = async (req: NextRequest) => {
  const { amount } = await req.json();

  const order = await razorpay.orders.create({
    amount: Number(amount) * 100,
    currency: "INR",
  });

  return NextResponse.json(order);
};
