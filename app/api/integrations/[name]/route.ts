// Single Integration API Endpoint

import { NextResponse } from "next/server";
import { getIntegration } from "@/server/integrations/registry";
import { loadIntegrationTemplates, loadIntegrationReadme } from "@/server/integrations/fileLoader";

export async function GET(
  req: Request,
  { params }: { params: { name: string } }
) {
  try {
    const integration = getIntegration(params.name);
    const templates = loadIntegrationTemplates(params.name);
    const readme = loadIntegrationReadme(params.name);

    return NextResponse.json({
      ok: true,
      integration,
      templates: templates.map((t) => ({
        name: t.templateName,
        preview: t.content.slice(0, 500) + (t.content.length > 500 ? "..." : ""),
      })),
      readme,
    });
  } catch (err: any) {
    console.error(`[API] Error fetching integration ${params.name}:`, err);
    return NextResponse.json(
      { error: err.message || "Integration not found" },
      { status: 404 }
    );
  }
}
