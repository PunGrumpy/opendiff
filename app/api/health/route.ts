import { NextResponse } from "next/server";

import { getSetupDiagnostics } from "@/lib/setup-diagnostics";

export const dynamic = "force-dynamic";

export const GET = async (): Promise<NextResponse> => {
  const diagnostics = await getSetupDiagnostics();

  return NextResponse.json(diagnostics, {
    status: diagnostics.overallStatus === "error" ? 503 : 200,
  });
};
