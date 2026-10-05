import { NextRequest, NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";
import {
  buildFolioApiUrl,
  DEFAULT_FOLIO_API_URL,
  FOLIO_SETTING_KEYS,
  type FolioTeam,
  isAdminEmail,
  isValidFolioToken,
  normalizeFolioTeam,
  normalizeTeamSlug,
  parseAdminEmails,
} from "@/lib/folio-team";

type FolioFetchResult =
  | { ok: true; team: FolioTeam }
  | { ok: false; status: number; error: string };

type FolioApiResponse = {
  ok?: boolean;
  error?: string;
  team?: unknown;
};

const CACHE_TTL_MS = 60_000;
let cache: { at: number; team: FolioTeam } | null = null;

const adminEmails = parseAdminEmails(process.env.ADMIN_EMAILS);

async function fetchFolioTeam(token: string, slug: string): Promise<FolioFetchResult> {
  const url = buildFolioApiUrl(process.env.FOLIO_API_URL || DEFAULT_FOLIO_API_URL, slug);

  let response: Response;

  try {
    response = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
      signal: AbortSignal.timeout(8000),
    });
  } catch {
    return { ok: false, status: 502, error: "Could not reach the folio API" };
  }

  const payload = (await response.json().catch(() => null)) as FolioApiResponse | null;

  if (!response.ok || !payload?.ok) {
    const error = typeof payload?.error === "string" ? payload.error : "Folio API request failed";
    const status = [401, 403, 404].includes(response.status) ? response.status : 502;
    return { ok: false, status, error };
  }

  const team = normalizeFolioTeam(payload.team);

  if (!team) {
    return { ok: false, status: 502, error: "Unexpected folio API response" };
  }

  return { ok: true, team };
}

async function readSettings() {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("app_settings")
    .select("key, value")
    .in("key", [FOLIO_SETTING_KEYS.token, FOLIO_SETTING_KEYS.slug]);

  if (error) throw new Error(error.message);

  const map = new Map((data ?? []).map((row) => [row.key, row.value ?? ""]));

  return {
    token: map.get(FOLIO_SETTING_KEYS.token) || "",
    slug: map.get(FOLIO_SETTING_KEYS.slug) || "",
  };
}

async function getSignedInUser(request: NextRequest) {
  const auth = request.headers.get("authorization");
  const accessToken = auth?.startsWith("Bearer ") ? auth.slice(7).trim() : "";

  if (!accessToken) return null;

  const supabase = getSupabase();
  const { data } = await supabase.auth.getUser(accessToken);

  return data.user ?? null;
}

export async function GET(request: NextRequest) {
  try {
    const user = await getSignedInUser(request);
    const isAdmin = isAdminEmail(user?.email, adminEmails);
    const { token, slug } = await readSettings();

    if (!token || !slug) {
      return NextResponse.json({ configured: false, team: null, isAdmin });
    }

    if (cache && Date.now() - cache.at < CACHE_TTL_MS) {
      return NextResponse.json({ configured: true, team: cache.team, isAdmin });
    }

    const result = await fetchFolioTeam(token, slug);

    if (!result.ok) {
      return NextResponse.json({ configured: true, team: null, error: result.error, isAdmin });
    }

    cache = { at: Date.now(), team: result.team };

    return NextResponse.json({ configured: true, team: result.team, isAdmin });
  } catch (error) {
    return NextResponse.json(
      {
        configured: false,
        team: null,
        isAdmin: false,
        error: error instanceof Error ? error.message : "Failed to read settings",
      },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  const user = await getSignedInUser(request);

  if (!user) {
    return NextResponse.json({ error: "Sign in to connect a folio team" }, { status: 401 });
  }

  if (!isAdminEmail(user.email, adminEmails)) {
    return NextResponse.json(
      { error: "Only admins can manage the folio team connection" },
      { status: 403 },
    );
  }

  const body = await request.json().catch(() => null);
  const token = typeof body?.token === "string" ? body.token.trim() : "";
  const slug = typeof body?.slug === "string" ? normalizeTeamSlug(body.slug) : "";

  if (!isValidFolioToken(token)) {
    return NextResponse.json(
      { error: "Invalid folio token. Create one in folio under Settings → API tokens." },
      { status: 400 },
    );
  }

  if (!slug) {
    return NextResponse.json({ error: "Team slug is required" }, { status: 400 });
  }

  const result = await fetchFolioTeam(token, slug);

  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }

  const supabase = getSupabase();
  const { error } = await supabase.from("app_settings").upsert(
    [
      { key: FOLIO_SETTING_KEYS.token, value: token },
      { key: FOLIO_SETTING_KEYS.slug, value: slug },
    ],
    { onConflict: "key" },
  );

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  cache = { at: Date.now(), team: result.team };

  return NextResponse.json({ configured: true, team: result.team });
}

export async function DELETE(request: NextRequest) {
  const user = await getSignedInUser(request);

  if (!user) {
    return NextResponse.json({ error: "Sign in to disconnect the folio team" }, { status: 401 });
  }

  if (!isAdminEmail(user.email, adminEmails)) {
    return NextResponse.json(
      { error: "Only admins can manage the folio team connection" },
      { status: 403 },
    );
  }

  const supabase = getSupabase();
  const { error } = await supabase
    .from("app_settings")
    .delete()
    .in("key", [FOLIO_SETTING_KEYS.token, FOLIO_SETTING_KEYS.slug]);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  cache = null;

  return NextResponse.json({ configured: false, team: null });
}
