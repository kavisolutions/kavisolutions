import { NextRequest, NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";
import { getRequestAuth } from "@/lib/server-auth";
import { sanitizeText } from "@/lib/team";

export async function GET(request: NextRequest) {
  const { user, isAdmin } = await getRequestAuth(request);

  if (!user || !isAdmin) {
    return NextResponse.json({ error: "Admins only" }, { status: 403 });
  }

  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("teams")
    .select("id, name, sort_order")
    .order("sort_order");

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    teams: (data ?? []).map((row) => ({
      id: String(row.id),
      name: String(row.name),
      sortOrder: row.sort_order ?? 0,
    })),
  });
}

export async function POST(request: NextRequest) {
  const { user, isAdmin } = await getRequestAuth(request);

  if (!user || !isAdmin) {
    return NextResponse.json({ error: "Admins only" }, { status: 403 });
  }

  const body = await request.json().catch(() => null);
  const name = sanitizeText(body?.name, 80);

  if (!name) {
    return NextResponse.json({ error: "Team name is required" }, { status: 400 });
  }

  const supabase = getSupabase();
  const { data: maxRow } = await supabase
    .from("teams")
    .select("sort_order")
    .order("sort_order", { ascending: false })
    .limit(1)
    .maybeSingle();

  const sortOrder = (maxRow?.sort_order ?? 0) + 1;

  const { data, error } = await supabase
    .from("teams")
    .insert({ name, sort_order: sortOrder })
    .select("id, name, sort_order")
    .single();

  if (error) {
    return NextResponse.json(
      { error: error.code === "23505" ? "That team already exists" : error.message },
      { status: 400 },
    );
  }

  return NextResponse.json({ ok: true, team: data });
}
