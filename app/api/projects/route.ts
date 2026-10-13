import { NextRequest, NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";
import { getRequestAuth } from "@/lib/server-auth";
import { sanitizeText } from "@/lib/team";

const ALLOWED_LIVE_LINK_TYPES = ["app", "web", "both"] as const;

export type ProjectRow = {
  id: string;
  name: string;
  description: string | null;
  live_link: string | null;
  live_link_type: string | null;
  project_types: string[];
  skills: string[];
  sort_order: number;
  created_at: string;
  updated_at: string;
};

export type Project = {
  id: string;
  name: string;
  description: string;
  liveLink: string;
  liveLinkType: "app" | "web" | "both";
  projectTypes: string[];
  skills: string[];
  sortOrder: number;
};

function toProject(row: ProjectRow): Project {
  return {
    id: row.id,
    name: row.name,
    description: row.description ?? "",
    liveLink: row.live_link ?? "",
    liveLinkType: (ALLOWED_LIVE_LINK_TYPES as readonly string[]).includes(row.live_link_type ?? "")
      ? (row.live_link_type as "app" | "web" | "both")
      : "web",
    projectTypes: row.project_types ?? [],
    skills: row.skills ?? [],
    sortOrder: row.sort_order ?? 0,
  };
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
      .from("projects")
      .select("*")
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: true });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      projects: (rows ?? []).map(toProject),
      isAdmin,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to load projects" },
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
      return NextResponse.json({ error: "Only admins can manage projects" }, { status: 403 });
    }

    const body = await request.json().catch(() => null);

    const name = sanitizeText(body?.name, 120);
    const description = sanitizeText(body?.description, 5000);
    const liveLink = sanitizeText(body?.liveLink, 500);
    const liveLinkType = sanitizeText(body?.liveLinkType, 10);
    const projectTypes = Array.isArray(body?.projectTypes) ? body.projectTypes : [];
    const skills = Array.isArray(body?.skills) ? body.skills : [];
    const sortOrder = Number.isFinite(Number(body?.sortOrder)) ? Number(body.sortOrder) : 0;

    if (!name) {
      return NextResponse.json({ error: "Project name is required" }, { status: 400 });
    }

    if (liveLinkType && !ALLOWED_LIVE_LINK_TYPES.includes(liveLinkType as "app" | "web" | "both")) {
      return NextResponse.json({ error: "Invalid live link type" }, { status: 400 });
    }

    const supabase = getSupabase();
    const { data, error } = await supabase
      .from("projects")
      .insert({
        name,
        description: description || null,
        live_link: liveLink || null,
        live_link_type: liveLinkType || "web",
        project_types: projectTypes,
        skills,
        sort_order: sortOrder,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ project: toProject(data as ProjectRow) });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to create project" },
      { status: 500 },
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { user, isAdmin } = await getRequestAuth(request);

    if (!user) {
      return NextResponse.json({ error: "Sign in required" }, { status: 401 });
    }

    if (!isAdmin) {
      return NextResponse.json({ error: "Only admins can manage projects" }, { status: 403 });
    }

    const body = await request.json().catch(() => null);
    const id = sanitizeText(body?.id, 50);

    if (!id) {
      return NextResponse.json({ error: "Project ID is required" }, { status: 400 });
    }

    const updates: Record<string, unknown> = {};

    if (body?.name !== undefined) {
      const name = sanitizeText(body.name, 120);
      if (!name) return NextResponse.json({ error: "Project name is required" }, { status: 400 });
      updates.name = name;
    }

    if (body?.description !== undefined) {
      updates.description = sanitizeText(body.description, 5000) || null;
    }

    if (body?.liveLink !== undefined) {
      updates.live_link = sanitizeText(body.liveLink, 500) || null;
    }

    if (body?.liveLinkType !== undefined) {
      const liveLinkType = sanitizeText(body.liveLinkType, 10);
      if (liveLinkType && !ALLOWED_LIVE_LINK_TYPES.includes(liveLinkType as "app" | "web" | "both")) {
        return NextResponse.json({ error: "Invalid live link type" }, { status: 400 });
      }
      updates.live_link_type = liveLinkType || "web";
    }

    if (body?.projectTypes !== undefined) {
      updates.project_types = Array.isArray(body.projectTypes) ? body.projectTypes : [];
    }

    if (body?.skills !== undefined) {
      updates.skills = Array.isArray(body.skills) ? body.skills : [];
    }

    if (body?.sortOrder !== undefined) {
      updates.sort_order = Number.isFinite(Number(body.sortOrder)) ? Number(body.sortOrder) : 0;
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: "Nothing to update" }, { status: 400 });
    }

    const supabase = getSupabase();
    const { data, error } = await supabase
      .from("projects")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ project: toProject(data as ProjectRow) });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to update project" },
      { status: 500 },
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { user, isAdmin } = await getRequestAuth(request);

    if (!user) {
      return NextResponse.json({ error: "Sign in required" }, { status: 401 });
    }

    if (!isAdmin) {
      return NextResponse.json({ error: "Only admins can manage projects" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Project ID is required" }, { status: 400 });
    }

    const supabase = getSupabase();
    const { error } = await supabase.from("projects").delete().eq("id", id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to delete project" },
      { status: 500 },
    );
  }
}