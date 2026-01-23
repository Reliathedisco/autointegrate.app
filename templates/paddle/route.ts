import { NextRequest, NextResponse } from "next/server";
import { createCheckout } from "./checkout";

export const POST = async (req: NextRequest) => {
  const { priceId } = await req.json();
  const session = await createCheckout(priceId);
  return NextResponse.json(session);
};
