import { NextRequest, NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";
import { getRequestAuth } from "@/lib/server-auth";
import { normalizeGradient, type TeamMemberRow } from "@/lib/team";

export async function GET(request: NextRequest) {
  const { user, isAdmin } = await getRequestAuth(request);

  if (!user) {
    return NextResponse.json({ user: null, isAdmin: false, member: null });
  }

  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("team")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const row = (data as TeamMemberRow | null) ?? null;

  return NextResponse.json({
    user: { id: user.id, email: user.email ?? "" },
    isAdmin,
    member: row
      ? {
          id: row.id,
          name: row.name,
          role: row.role,
          bio: row.bio,
          imageUrl: row.image_url,
          profileUrl: row.profile_url,
          gradient: normalizeGradient(row.gradient),
          sortOrder: row.sort_order,
        }
      : null,
  });
}
