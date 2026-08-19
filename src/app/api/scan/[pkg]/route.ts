import { NextResponse, type NextRequest } from "next/server";
import { runScan } from "@/lib/hydra";

export const runtime = "nodejs";            // Bolt/Node tls client requires node runtime
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest, { params }: { params: { pkg: string } }) {
  try {
    const pkg = decodeURIComponent(params.pkg);
    const r = await runScan(pkg);
    return NextResponse.json(r, {
      headers: { "cache-control": "public, max-age=30, s-maxage=60" },
    });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

export async function POST(req: NextRequest, { params }: { params: { pkg: string } }) {
  try {
    const pkg = decodeURIComponent(params.pkg);
    const r = await runScan(pkg);
    return NextResponse.json(r, {
      headers: { "cache-control": "public, max-age=30, s-maxage=60" },
    });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
