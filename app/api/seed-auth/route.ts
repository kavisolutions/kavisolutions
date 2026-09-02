import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const teamMembers = [
  { email: "kavitha@kavisolutions.in", password: "KaviTeam2026!", name: "Kavitha" },
  { email: "ashok@kavisolutions.in", password: "KaviTeam2026!", name: "Ashok Kumar" },
  { email: "teja@kavisolutions.in", password: "KaviTeam2026!", name: "Simma Tejeswararao" },
  { email: "sai@kavisolutions.in", password: "KaviTeam2026!", name: "Sai" },
];

export async function POST() {
  if (!supabaseServiceKey) {
    return NextResponse.json(
      { error: "SUPABASE_SERVICE_ROLE_KEY not set. Add it to .env.local" },
      { status: 500 }
    );
  }

  const admin = createClient(supabaseUrl, supabaseServiceKey);
  const results = [];

  for (const member of teamMembers) {
    // Create auth user
    const { data: userData, error: createError } = await admin.auth.admin.createUser({
      email: member.email,
      password: member.password,
      email_confirm: true,
    });

    if (createError) {
      results.push({ email: member.email, error: createError.message });
      continue;
    }

    // Link user to team profile
    const { error: updateError } = await admin
      .from("team")
      .update({ user_id: userData.user.id })
      .eq("name", member.name);

    results.push({
      email: member.email,
      user_id: userData.user.id,
      linked: !updateError,
    });
  }

  return NextResponse.json({ results });
}
