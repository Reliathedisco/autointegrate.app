import { NextRequest, NextResponse } from "next/server";
import { gateway } from "./client";

export const POST = async (req: NextRequest) => {
  const { nonce, amount } = await req.json();

  const result = await gateway.transaction.sale({
    amount,
    paymentMethodNonce: nonce,
    options: { submitForSettlement: true },
  });

  return NextResponse.json(result);
};
