import type { NextRequest } from "next/server";
import type { SupabaseClient, User } from "@supabase/supabase-js";
import { getSupabase } from "@/lib/supabase";
import { isAdminEmail, parseAdminEmails } from "@/lib/team";

export async function getSignedInUser(request: NextRequest): Promise<User | null> {
  const auth = request.headers.get("authorization");
  const accessToken = auth?.startsWith("Bearer ") ? auth.slice(7).trim() : "";

  if (!accessToken) return null;

  const supabase = getSupabase();
  const { data, error } = await supabase.auth.getUser(accessToken);

  if (error) return null;

  return data.user ?? null;
}

export async function getAdminEmails(supabase: SupabaseClient): Promise<string[]> {
  const fromEnv = parseAdminEmails(process.env.ADMIN_EMAILS);

  const { data, error } = await supabase.from("admins").select("email");

  if (error) return fromEnv;

  const fromDb = (data ?? [])
    .map((row) => (typeof row.email === "string" ? row.email.trim().toLowerCase() : ""))
    .filter(Boolean);

  return Array.from(new Set([...fromEnv, ...fromDb]));
}

export async function getRequestAuth(request: NextRequest): Promise<{
  user: User | null;
  isAdmin: boolean;
}> {
  const user = await getSignedInUser(request);

  if (!user) return { user: null, isAdmin: false };

  const admins = await getAdminEmails(getSupabase());

  return { user, isAdmin: isAdminEmail(user.email, admins) };
}
