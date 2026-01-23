// Integrations API Endpoint

import { NextResponse } from "next/server";
import { loadRegistry, getCategories } from "@/server/integrations/registry";

export async function GET() {
  try {
    const integrations = loadRegistry();
    const categories = getCategories();

    return NextResponse.json({
      ok: true,
      integrations,
      categories,
      count: Object.keys(integrations).length,
    });
  } catch (err: any) {
    console.error("[API] Error fetching integrations:", err);
    return NextResponse.json(
      { error: err.message || "Failed to fetch integrations" },
      { status: 500 }
    );
  }
}
