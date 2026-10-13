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
import type { SupabaseClient } from "@supabase/supabase-js";

export async function readTeamSettings(supabase: SupabaseClient) {
  const { data, error } = await supabase
    .from("app_settings")
    .select("key, value")
    .in("key", ["team_tagline", "team_description", "contact_email"]);

  if (error) throw new Error(error.message);

  const map = new Map((data ?? []).map((row) => [row.key, row.value ?? ""]));

  return {
    tagline: map.get("team_tagline") || "",
    description: map.get("team_description") || "",
    contactEmail: map.get("contact_email") || "",
  };
}

export async function readOrgOptions(supabase: SupabaseClient) {
  const [rolesRes, teamsRes] = await Promise.all([
    supabase.from("roles").select("id, name, sort_order").order("sort_order"),
    supabase.from("teams").select("id, name, sort_order").order("sort_order"),
  ]);

  if (rolesRes.error) throw new Error(rolesRes.error.message);
  if (teamsRes.error) throw new Error(teamsRes.error.message);

  return {
    roles: (rolesRes.data ?? []).map((row) => ({
      id: String(row.id),
      name: String(row.name),
      sortOrder: row.sort_order ?? 0,
    })),
    teams: (teamsRes.data ?? []).map((row) => ({
      id: String(row.id),
      name: String(row.name),
      sortOrder: row.sort_order ?? 0,
    })),
  };
}

async function findAuthUserByEmail(supabase: SupabaseClient, email: string) {
  for (let page = 1; page <= 20; page++) {
    const { data, error } = await supabase.auth.admin.listUsers({ page, perPage: 100 });
    if (error) throw new Error(error.message);

    const match = data.users.find((user) => (user.email || "").toLowerCase() === email);
    if (match) return match;

    if (data.users.length < 100) break;
  }

  return null;
}

export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabase();
    const { searchParams } = new URL(request.url);
    const mineOnly = searchParams.get("mine") === "1";

    const { user, isAdmin } = await getRequestAuth(request);

    if (mineOnly && !user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const { data: rows, error } = await supabase
      .from("team")
      .select("*, team:teams(name)")
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: true });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const rowsList = (rows ?? []) as TeamMemberRow[];
    const member = user ? rowsList.find((row) => row.user_id === user.id) ?? null : null;

    const [settings, options] = await Promise.all([
      readTeamSettings(supabase),
      readOrgOptions(supabase),
    ]);

    return NextResponse.json({
      members: rowsList.map(toTeamMember),
      roles: options.roles,
      teams: options.teams,
      settings: { tagline: settings.tagline, description: settings.description },
      isAdmin,
      member: member
        ? {
            id: member.id,
            name: member.name,
            role: member.role,
            bio: member.bio,
            imageUrl: member.image_url,
            profileUrl: member.profile_url,
            linkedinUrl: member.linkedin_url ?? null,
            gradient: normalizeGradient(member.gradient),
            sortOrder: member.sort_order,
            teamId: member.team_id ?? null,
            teamName: member.team?.name ?? null,
          }
        : null,
      user: user ? { id: user.id, email: user.email ?? "" } : null,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to load team" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { user, isAdmin } = await getRequestAuth(request);

    if (!user) {
      return NextResponse.json({ error: "Sign in required" }, { status: 401 });
    }

    if (!isAdmin) {
      return NextResponse.json({ error: "Only admins can manage the team" }, { status: 403 });
    }

    const body = await request.json().catch(() => null);

    const name = sanitizeText(body?.name, 120);
    const role = sanitizeText(body?.role, 120);
    const bio = sanitizeText(body?.bio, 2000);
    const profileUrl = sanitizeText(body?.profileUrl, 500) || null;
    const linkedinUrl = sanitizeText(body?.linkedinUrl, 500) || null;
    const imageUrl = sanitizeText(body?.imageUrl, 1000) || null;
    const gradient = normalizeGradient(body?.gradient);
    const sortOrder = Number.isFinite(Number(body?.sortOrder)) ? Number(body.sortOrder) : 0;
    const teamId = sanitizeText(body?.teamId, 60) || null;
    const loginEmail = sanitizeText(body?.email, 254).toLowerCase();
    const loginPassword = typeof body?.password === "string" ? body.password : "";

    if (!name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    const supabase = getSupabase();
    let userId: string | null = null;

    if (loginEmail) {
      let authUser = await findAuthUserByEmail(supabase, loginEmail);

      if (!authUser) {
        if (loginPassword.length < 8) {
          return NextResponse.json(
            { error: "Password must be at least 8 characters for a new login" },
            { status: 400 },
          );
        }

        const { data, error } = await supabase.auth.admin.createUser({
          email: loginEmail,
          password: loginPassword,
          email_confirm: true,
        });

        if (error) {
          return NextResponse.json({ error: error.message }, { status: 400 });
        }

        authUser = data.user;
      }

      userId = authUser.id;
    }

    const { data, error } = await supabase
      .from("team")
      .insert({
        name,
        role,
        bio,
        initials: getInitials(name),
        gradient,
        image_url: imageUrl,
        profile_url: profileUrl,
        linkedin_url: linkedinUrl,
        sort_order: sortOrder,
        user_id: userId,
        team_id: teamId,
      })
      .select("*, team:teams(name)")
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      member: toTeamMember(data as TeamMemberRow),
      linkedEmail: loginEmail || null,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to create member" },
      { status: 500 },
    );
  }
}
