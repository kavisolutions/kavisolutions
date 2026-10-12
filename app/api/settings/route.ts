import { NextRequest, NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";
import { getRequestAuth } from "@/lib/server-auth";
import { sanitizeText, TEAM_SETTING_KEYS } from "@/lib/team";

export async function GET(request: NextRequest) {
  const { user, isAdmin } = await getRequestAuth(request);

  if (!user || !isAdmin) {
    return NextResponse.json({ error: "Admins only" }, { status: 403 });
  }

  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("app_settings")
    .select("key, value")
    .in("key", [TEAM_SETTING_KEYS.tagline, TEAM_SETTING_KEYS.description, TEAM_SETTING_KEYS.contactEmail]);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const map = new Map((data ?? []).map((row) => [row.key, row.value ?? ""]));

  return NextResponse.json({
    settings: {
      tagline: map.get(TEAM_SETTING_KEYS.tagline) || "",
      description: map.get(TEAM_SETTING_KEYS.description) || "",
      contactEmail: map.get(TEAM_SETTING_KEYS.contactEmail) || "",
    },
  });
}

export async function PUT(request: NextRequest) {
  const { user, isAdmin } = await getRequestAuth(request);

  if (!user) {
    return NextResponse.json({ error: "Sign in required" }, { status: 401 });
  }

  if (!isAdmin) {
    return NextResponse.json({ error: "Admins only" }, { status: 403 });
  }

  const body = await request.json().catch(() => null);
  const rows: { key: string; value: string }[] = [];

  if (body?.tagline !== undefined) {
    rows.push({ key: TEAM_SETTING_KEYS.tagline, value: sanitizeText(body.tagline, 300) });
  }

  if (body?.description !== undefined) {
    rows.push({ key: TEAM_SETTING_KEYS.description, value: sanitizeText(body.description, 1000) });
  }

  if (body?.contactEmail !== undefined) {
    rows.push({ key: TEAM_SETTING_KEYS.contactEmail, value: sanitizeText(body.contactEmail, 254) });
  }

  if (rows.length === 0) {
    return NextResponse.json({ error: "Nothing to update" }, { status: 400 });
  }

  const supabase = getSupabase();
  const { error } = await supabase.from("app_settings").upsert(rows, { onConflict: "key" });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
