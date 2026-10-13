import { NextRequest, NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";
import { getRequestAuth } from "@/lib/server-auth";
import {
  getInitials,
  normalizeGradient,
  sanitizeText,
  toTeamMember,
  type TeamMemberRow,
} from "@/lib/team";

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(request: NextRequest, { params }: RouteContext) {
  try {
    const { id } = await params;
    const { user, isAdmin } = await getRequestAuth(request);

    if (!user) {
      return NextResponse.json({ error: "Sign in required" }, { status: 401 });
    }

    const supabase = getSupabase();
    const { data: existing, error: readError } = await supabase
      .from("team")
      .select("*, team:teams(name)")
      .eq("id", id)
      .maybeSingle();

    if (readError) {
      return NextResponse.json({ error: readError.message }, { status: 500 });
    }

    if (!existing) {
      return NextResponse.json({ error: "Member not found" }, { status: 404 });
    }

    const row = existing as TeamMemberRow;
    const isOwner = row.user_id === user.id;

    if (!isAdmin && !isOwner) {
      return NextResponse.json({ error: "Not allowed" }, { status: 403 });
    }

    const body = await request.json().catch(() => null);
    const patch: Record<string, unknown> = {};

    if (body?.name !== undefined) {
      const name = sanitizeText(body.name, 120);
      if (!name) return NextResponse.json({ error: "Name cannot be empty" }, { status: 400 });
      patch.name = name;
      patch.initials = getInitials(name);
    }

    if (body?.role !== undefined) {
      patch.role = sanitizeText(body.role, 120);
    }

    if (body?.bio !== undefined) patch.bio = sanitizeText(body.bio, 2000);
    if (body?.imageUrl !== undefined) patch.image_url = sanitizeText(body.imageUrl, 1000) || null;
    if (body?.gradient !== undefined) patch.gradient = normalizeGradient(body.gradient);

    if (body?.profileUrl !== undefined) {
      patch.profile_url = sanitizeText(body.profileUrl, 500) || null;
    }

    if (body?.linkedinUrl !== undefined) {
      patch.linkedin_url = sanitizeText(body.linkedinUrl, 500) || null;
    }

    if (isAdmin && body?.sortOrder !== undefined && Number.isFinite(Number(body.sortOrder))) {
      patch.sort_order = Number(body.sortOrder);
    }

    if (isAdmin && body?.teamId !== undefined) {
      patch.team_id = sanitizeText(body.teamId, 60) || null;
    }

    if (Object.keys(patch).length === 0) {
      return NextResponse.json({ error: "Nothing to update" }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("team")
      .update(patch)
      .eq("id", id)
      .select("*, team:teams(name)")
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ member: toTeamMember(data as TeamMemberRow) });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to update member" },
      { status: 500 },
    );
  }
}

export async function DELETE(request: NextRequest, { params }: RouteContext) {
  try {
    const { id } = await params;
    const { user, isAdmin } = await getRequestAuth(request);

    if (!user) {
      return NextResponse.json({ error: "Sign in required" }, { status: 401 });
    }

    if (!isAdmin) {
      return NextResponse.json({ error: "Only admins can remove team members" }, { status: 403 });
    }

    const supabase = getSupabase();
    const { error } = await supabase.from("team").delete().eq("id", id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to remove member" },
      { status: 500 },
    );
  }
}
