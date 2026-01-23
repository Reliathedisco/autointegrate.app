import { NextRequest, NextResponse } from "next/server";
import { listPrices } from "./prices";

export const GET = async (req: NextRequest) => {
  const { searchParams } = new URL(req.url);
  const productId = searchParams.get("productId") || undefined;
  const prices = await listPrices(productId);
  return NextResponse.json(prices);
};
