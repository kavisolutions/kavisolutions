import { NextRequest, NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";
import { getRequestAuth } from "@/lib/server-auth";
import { sanitizeText } from "@/lib/team";

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(request: NextRequest, { params }: RouteContext) {
  const { user, isAdmin } = await getRequestAuth(request);

  if (!user || !isAdmin) {
    return NextResponse.json({ error: "Admins only" }, { status: 403 });
  }

  const { id } = await params;
  const body = await request.json().catch(() => null);
  const name = sanitizeText(body?.name, 80);

  if (!name) {
    return NextResponse.json({ error: "Team name is required" }, { status: 400 });
  }

  const supabase = getSupabase();
  const { error } = await supabase.from("teams").update({ name }).eq("id", id);

  if (error) {
    return NextResponse.json(
      { error: error.code === "23505" ? "That team already exists" : error.message },
      { status: 400 },
    );
  }

  return NextResponse.json({ ok: true });
}

export async function DELETE(request: NextRequest, { params }: RouteContext) {
  const { user, isAdmin } = await getRequestAuth(request);

  if (!user || !isAdmin) {
    return NextResponse.json({ error: "Admins only" }, { status: 403 });
  }

  const { id } = await params;
  const supabase = getSupabase();
  const { error } = await supabase.from("teams").delete().eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
