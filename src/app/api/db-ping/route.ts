export const runtime = "nodejs";
export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { Client } from "pg";

export async function GET() {
  try {
    const connectionString = process.env.DATABASE_URL || process.env.NETLIFY_DATABASE_URL;
    const c = new Client({ connectionString });
    await c.connect();
    const r = await c.query("select now() as now, current_schema()");
    await c.end();
    return NextResponse.json({ ok: true, now: r.rows[0].now, schema: r.rows[0].current_schema });
  } catch (e:any) {
    return NextResponse.json({ ok: false, code: e.code, message: e.message }, { status: 500 });
  }
}
