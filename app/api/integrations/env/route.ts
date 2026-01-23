// Environment Variables API

import { NextResponse } from "next/server";
import {
  getEnvVarsForIntegrations,
  generateEnvExample,
  getEnvVarsByCategory,
} from "@/server/integrations/envBuilder";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { integrations } = body;

    if (!integrations || !Array.isArray(integrations)) {
      return NextResponse.json(
        { error: "Integrations array is required" },
        { status: 400 }
      );
    }

    const envVars = getEnvVarsForIntegrations(integrations);
    const envExample = generateEnvExample(integrations);
    const byCategory = getEnvVarsByCategory(integrations);

    return NextResponse.json({
      ok: true,
      envVars,
      envExample,
      byCategory,
      total: envVars.length,
    });
  } catch (err: any) {
    console.error("[API] Error getting env vars:", err);
    return NextResponse.json(
      { error: err.message || "Failed to get environment variables" },
      { status: 500 }
    );
  }
}
