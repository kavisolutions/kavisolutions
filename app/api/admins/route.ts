import { NextRequest, NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";
import { getRequestAuth } from "@/lib/server-auth";
import { isEmail, parseAdminEmails } from "@/lib/team";

export async function GET(request: NextRequest) {
  const { user, isAdmin } = await getRequestAuth(request);

  if (!user) {
    return NextResponse.json({ error: "Sign in required" }, { status: 401 });
  }

  if (!isAdmin) {
    return NextResponse.json({ error: "Admins only" }, { status: 403 });
  }

  const envEmails = parseAdminEmails(process.env.ADMIN_EMAILS);
  const supabase = getSupabase();
  const { data, error } = await supabase.from("admins").select("email, created_at").order("created_at");

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const dbEmails = new Set((data ?? []).map((row) => (row.email || "").toLowerCase()));

  const admins = [
    ...envEmails.map((email) => ({ email, source: "env" as const })),
    ...(data ?? [])
      .filter((row) => !envEmails.includes((row.email || "").toLowerCase()))
      .map((row) => ({ email: String(row.email).toLowerCase(), source: "db" as const })),
  ];

  return NextResponse.json({ admins, envEmails, dbEmails: Array.from(dbEmails) });
}

export async function POST(request: NextRequest) {
  const { user, isAdmin } = await getRequestAuth(request);

  if (!user) {
    return NextResponse.json({ error: "Sign in required" }, { status: 401 });
  }

  if (!isAdmin) {
    return NextResponse.json({ error: "Admins only" }, { status: 403 });
  }

  const body = await request.json().catch(() => null);
  const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";

  if (!isEmail(email)) {
    return NextResponse.json({ error: "Enter a valid email address" }, { status: 400 });
  }

  const supabase = getSupabase();
  const { error } = await supabase.from("admins").upsert({ email }, { onConflict: "email" });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, email });
}

export async function DELETE(request: NextRequest) {
  const { user, isAdmin } = await getRequestAuth(request);

  if (!user) {
    return NextResponse.json({ error: "Sign in required" }, { status: 401 });
  }

  if (!isAdmin) {
    return NextResponse.json({ error: "Admins only" }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const email = (searchParams.get("email") || "").trim().toLowerCase();

  if (!isEmail(email)) {
    return NextResponse.json({ error: "Enter a valid email address" }, { status: 400 });
  }

  const envEmails = parseAdminEmails(process.env.ADMIN_EMAILS);
  if (envEmails.includes(email)) {
    return NextResponse.json(
      { error: "This admin comes from the ADMIN_EMAILS env var and cannot be removed here" },
      { status: 400 },
    );
  }

  const supabase = getSupabase();
  const { error } = await supabase.from("admins").delete().eq("email", email);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
