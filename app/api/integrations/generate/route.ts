// Generate Integration Files API (Preview)

import { NextResponse } from "next/server";
import { generateFilesForIntegrations, getGenerationSummary } from "@/server/integrations/generator";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { integrations, preview = false } = body;

    if (!integrations || !Array.isArray(integrations) || integrations.length === 0) {
      return NextResponse.json(
        { error: "At least one integration is required" },
        { status: 400 }
      );
    }

    if (preview) {
      // Return just the summary without full content
      const summary = getGenerationSummary(integrations);
      return NextResponse.json({
        ok: true,
        preview: true,
        summary,
      });
    }

    // Generate full files
    const files = await generateFilesForIntegrations(integrations);

    return NextResponse.json({
      ok: true,
      files: files.map((f) => ({
        path: f.path,
        integration: f.integration,
        type: f.type,
        size: f.content.length,
        preview: f.content.slice(0, 200),
      })),
      totalFiles: files.length,
    });
  } catch (err: any) {
    console.error("[API] Error generating files:", err);
    return NextResponse.json(
      { error: err.message || "Failed to generate files" },
      { status: 500 }
    );
  }
}
