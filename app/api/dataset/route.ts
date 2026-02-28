import { NextRequest, NextResponse } from "next/server";
import { fetchDatasetRows } from "@/lib/api";

export async function GET(request: NextRequest) {
  const datasetId = request.nextUrl.searchParams.get("id");

  if (!datasetId) {
    return NextResponse.json(
      { error: "Missing dataset id" },
      { status: 400 }
    );
  }

  try {
    const rows = await fetchDatasetRows(datasetId);
    return NextResponse.json({ rows });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
