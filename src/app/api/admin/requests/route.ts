import { NextRequest, NextResponse } from "next/server";
import { getRequests } from "@/lib/requests";
import { requireAdmin } from "@/lib/admin-auth";

export async function GET(req: NextRequest) {
  const auth = await requireAdmin(req);
  if (!auth.ok) return auth.response;
  const requests = await getRequests();
  return NextResponse.json(requests);
}
