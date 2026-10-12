import { NextRequest, NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";
import { getRequestAuth } from "@/lib/server-auth";
import {
  getInitials,
  normalizeGradient,
  sanitizeText,
  TEAM_SETTING_KEYS,
  toTeamMember,
  type TeamMemberRow,
} from "@/lib/team";
import type { SupabaseClient } from "@supabase/supabase-js";

export async function readTeamSettings(supabase: SupabaseClient) {
  const { data, error } = await supabase
    .from("app_settings")
    .select("key, value")
    .in("key", [
      TEAM_SETTING_KEYS.tagline,
      TEAM_SETTING_KEYS.description,
      TEAM_SETTING_KEYS.contactEmail,
    ]);

  if (error) throw new Error(error.message);

  const map = new Map((data ?? []).map((row) => [row.key, row.value ?? ""]));

  return {
    tagline: map.get(TEAM_SETTING_KEYS.tagline) || "",
    description: map.get(TEAM_SETTING_KEYS.description) || "",
    contactEmail: map.get(TEAM_SETTING_KEYS.contactEmail) || "",
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

    const membersQuery = supabase
      .from("team")
      .select("*")
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: true });

    const { data: rows, error } = await membersQuery;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const rowsList = (rows ?? []) as TeamMemberRow[];
    const member = user ? rowsList.find((row) => row.user_id === user.id) ?? null : null;

    if (mineOnly && !user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const settings = await readTeamSettings(supabase);

    return NextResponse.json({
      members: rowsList.map(toTeamMember),
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
            gradient: normalizeGradient(member.gradient),
            sortOrder: member.sort_order,
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
    const imageUrl = sanitizeText(body?.imageUrl, 1000) || null;
    const gradient = normalizeGradient(body?.gradient);
    const sortOrder = Number.isFinite(Number(body?.sortOrder)) ? Number(body.sortOrder) : 0;
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
        sort_order: sortOrder,
        user_id: userId,
      })
      .select("*")
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ member: toTeamMember(data as TeamMemberRow), linkedEmail: loginEmail || null });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to create member" },
      { status: 500 },
    );
  }
}
