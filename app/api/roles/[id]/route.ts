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
  const name = sanitizeText(body?.name, 60);

  if (!name) {
    return NextResponse.json({ error: "Role name is required" }, { status: 400 });
  }

  const supabase = getSupabase();
  const { data: existing, error: readError } = await supabase
    .from("roles")
    .select("name")
    .eq("id", id)
    .maybeSingle();

  if (readError) {
    return NextResponse.json({ error: readError.message }, { status: 500 });
  }

  if (!existing) {
    return NextResponse.json({ error: "Role not found" }, { status: 404 });
  }

  const { error } = await supabase.from("roles").update({ name }).eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (existing.name !== name) {
    await supabase.from("team").update({ role: name }).eq("role", existing.name);
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

  const { data: existing, error: readError } = await supabase
    .from("roles")
    .select("name")
    .eq("id", id)
    .maybeSingle();

  if (readError) {
    return NextResponse.json({ error: readError.message }, { status: 500 });
  }

  if (!existing) {
    return NextResponse.json({ error: "Role not found" }, { status: 404 });
  }

  const { error } = await supabase.from("roles").delete().eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  await supabase.from("team").update({ role: "" }).eq("role", existing.name);

  return NextResponse.json({ ok: true });
}
