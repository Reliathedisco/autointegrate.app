import { NextRequest, NextResponse } from "next/server";
import { createBillingPortal } from "./portal";

export const POST = async (req: NextRequest) => {
  const { customerId } = await req.json();
  const session = await createBillingPortal(customerId);
  return NextResponse.json({ url: session.url });
};
