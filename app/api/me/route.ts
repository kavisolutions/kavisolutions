import { NextRequest, NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";
import { getRequestAuth } from "@/lib/server-auth";
import { readOrgOptions } from "@/app/api/team/route";
import { normalizeGradient, type TeamMemberRow } from "@/lib/team";

export async function GET(request: NextRequest) {
  const { user, isAdmin } = await getRequestAuth(request);

  if (!user) {
    return NextResponse.json({ user: null, isAdmin: false, member: null, roles: [], teams: [] });
  }

  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("team")
    .select("*, team:teams(name)")
    .eq("user_id", user.id)
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const row = (data as TeamMemberRow | null) ?? null;
  const options = await readOrgOptions(supabase);

  return NextResponse.json({
    user: { id: user.id, email: user.email ?? "" },
    isAdmin,
    roles: options.roles,
    teams: options.teams,
    member: row
      ? {
          id: row.id,
          name: row.name,
          role: row.role,
          bio: row.bio,
          imageUrl: row.image_url,
          profileUrl: row.profile_url,
          linkedinUrl: row.linkedin_url ?? null,
          gradient: normalizeGradient(row.gradient),
          sortOrder: row.sort_order,
          teamId: row.team_id ?? null,
          teamName: row.team?.name ?? null,
        }
      : null,
  });
}
