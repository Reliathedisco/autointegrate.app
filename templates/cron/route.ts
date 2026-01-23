import { NextRequest, NextResponse } from "next/server";
import { cleanupTask } from "./tasks/cleanup";
import { reportsTask } from "./tasks/reports";

export const GET = async (req: NextRequest) => {
  const { searchParams } = new URL(req.url);
  const task = searchParams.get("task") || "cleanup";

  let result;
  switch (task) {
    case "cleanup":
      result = await cleanupTask();
      break;
    case "reports":
      result = await reportsTask();
      break;
    default:
      return NextResponse.json({ ok: false, error: "Unknown task" }, { status: 400 });
  }

  return NextResponse.json(result);
};
