import { readFile } from "node:fs/promises";
import * as dotenv from "dotenv";
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { and, eq, ne, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

import {
  account,
  admins,
  appSettings,
  projects,
  roles,
  team,
  teams,
  user,
} from "@/db/drizzle/schema";

dotenv.config();

type ExportUser = {
  id: string;
  email: string;
  name: string;
  verified: boolean;
  createdAt: string;
  updatedAt: string;
  passwordHash: string | null;
};

type ExportIdentity = {
  userId: string;
  provider: string;
  providerId: string;
};

type ExportTeam = {
  id: string;
  name: string;
  role: string;
  initials: string;
  gradient: string;
  bio: string;
  image_url: string | null;
  user_id: string | null;
  sort_order: number;
  profile_url: string | null;
  linkedin_url: string | null;
  team_id: string | null;
  created_at: string;
  updated_at: string;
};

type ExportProject = {
  id: string;
  name: string;
  description: string | null;
  app_link: string | null;
  web_link: string | null;
  live_link_type: string | null;
  project_types: string[];
  skills: string[];
  sort_order: number;
  created_at: string;
  updated_at: string;
};

type ExportSettings = { key: string; value: string | null; updated_at: string };

type ExportObject = { bucket: string; name: string; mime: string | null; size: number };

type SupabaseExport = {
  users: ExportUser[];
  identities: ExportIdentity[];
  team: ExportTeam[];
  teams: { id: string; name: string; sort_order: number; created_at: string }[];
  roles: { id: string; name: string; sort_order: number; created_at: string }[];
  admins: { email: string; created_at: string }[];
  app_settings: ExportSettings[];
  projects: ExportProject[];
  storage_objects: ExportObject[];
};

const args = process.argv.slice(2);
const argValue = (flag: string, fallback: string): string => {
  const index = args.indexOf(flag);
  return index >= 0 && args[index + 1] ? args[index + 1] : fallback;
};

const EXPORT_PATH = argValue("--export", "supabase-export.json");
const AVATAR_DIR = argValue("--avatars", "");
const PUBLIC_PREFIX = argValue("--public-url", process.env.S3_PUBLIC_URL ?? "");
const DRY_RUN = args.includes("--dry-run");

const IMAGE_URL_RE = /\/storage\/v1\/object\/public\/avatars\/(.+)$/;

async function main(): Promise<void> {
  const raw = JSON.parse(await readFile(EXPORT_PATH, "utf8")) as SupabaseExport;

  const pool = new Pool({
    connectionString:
      process.env.DATABASE_URL ?? "postgres://kavi:kavi@localhost:5432/kavi_solutions",
  });
  const db = drizzle(pool);

  const s3 = AVATAR_DIR
    ? new S3Client({
        region: process.env.S3_REGION ?? "us-east-1",
        endpoint: process.env.S3_ENDPOINT,
        forcePathStyle: (process.env.S3_FORCE_PATH_STYLE ?? "true") === "true",
        credentials: {
          accessKeyId: process.env.S3_ACCESS_KEY ?? "minioadmin",
          secretAccessKey: process.env.S3_SECRET_KEY ?? "minioadmin",
        },
      })
    : null;
  const bucket = process.env.S3_BUCKET ?? "avatars";

  const report = {
    users: 0,
    identities: 0,
    teams: 0,
    roles: 0,
    admins: 0,
    settings: 0,
    projects: 0,
    members: 0,
    avatars: 0,
    imageUrlsRewritten: 0,
  };

  if (DRY_RUN) {
    report.users = raw.users.length;
    report.identities = raw.identities.length;
    report.teams = raw.teams.length;
    report.roles = raw.roles.length;
    report.admins = raw.admins.length;
    report.settings = raw.app_settings.length;
    report.projects = raw.projects.length;
    report.members = raw.team.length;
    report.avatars = raw.storage_objects.length;
    console.log(JSON.stringify({ dryRun: true, ...report }, null, 2));
    await pool.end();
    return;
  }

  // --- roles / teams -------------------------------------------------------
  for (const role of raw.roles) {
    await db
      .insert(roles)
      .values({
        id: role.id,
        name: role.name,
        sortOrder: role.sort_order,
        createdAt: new Date(role.created_at),
      })
      .onConflictDoUpdate({
        target: roles.id,
        set: { name: role.name, sortOrder: role.sort_order },
      });
    report.roles += 1;
  }

  for (const orgTeam of raw.teams) {
    // A seeded row with the same name but a different id would trip the
    // unique name constraint; the legacy row is the source of truth.
    await db.delete(teams).where(and(eq(teams.name, orgTeam.name), ne(teams.id, orgTeam.id)));
    await db
      .insert(teams)
      .values({
        id: orgTeam.id,
        name: orgTeam.name,
        sortOrder: orgTeam.sort_order,
        createdAt: new Date(orgTeam.created_at),
      })
      .onConflictDoUpdate({
        target: teams.id,
        set: { name: orgTeam.name, sortOrder: orgTeam.sort_order },
      });
    report.teams += 1;
  }

  // --- users / accounts ----------------------------------------------------
  const credentialHashes = new Map<string, string>();
  for (const identity of raw.identities) {
    if (identity.provider === "email") {
      const owner = raw.users.find((item) => item.id === identity.userId);
      if (owner?.passwordHash) credentialHashes.set(identity.userId, owner.passwordHash);
    }
  }

  for (const legacyUser of raw.users) {
    await db
      .insert(user)
      .values({
        id: legacyUser.id,
        email: legacyUser.email.toLowerCase(),
        name: legacyUser.name || legacyUser.email.split("@")[0],
        emailVerified: legacyUser.verified,
        role: "user",
        createdAt: new Date(legacyUser.createdAt),
        updatedAt: new Date(legacyUser.updatedAt),
      })
      .onConflictDoNothing({ target: user.id });
    report.users += 1;
  }

  for (const identity of raw.identities) {
    if (identity.provider === "email") {
      const hash = credentialHashes.get(identity.userId);
      await db
        .insert(account)
        .values({
          id: `legacy-cred-${identity.userId}`,
          providerId: "credential",
          accountId: identity.userId,
          userId: identity.userId,
          password: hash ?? null,
        })
        .onConflictDoNothing({ target: account.id });
    } else {
      await db
        .insert(account)
        .values({
          id: `legacy-${identity.provider}-${identity.userId}`,
          providerId: identity.provider,
          accountId: identity.providerId,
          userId: identity.userId,
        })
        .onConflictDoNothing({ target: account.id });
    }
    report.identities += 1;
  }

  // --- admins / settings ---------------------------------------------------
  for (const admin of raw.admins) {
    await db
      .insert(admins)
      .values({ email: admin.email.toLowerCase(), createdAt: new Date(admin.created_at) })
      .onConflictDoNothing({ target: admins.email });
    report.admins += 1;
  }

  for (const setting of raw.app_settings) {
    await db
      .insert(appSettings)
      .values({
        key: setting.key,
        value: setting.value,
        updatedAt: new Date(setting.updated_at),
      })
      .onConflictDoUpdate({ target: appSettings.key, set: { value: setting.value } });
    report.settings += 1;
  }

  // --- projects ------------------------------------------------------------
  for (const project of raw.projects) {
    await db
      .insert(projects)
      .values({
        id: project.id,
        name: project.name,
        description: project.description,
        appLink: project.app_link,
        webLink: project.web_link,
        liveLinkType: project.live_link_type,
        projectTypes: project.project_types ?? [],
        skills: project.skills ?? [],
        sortOrder: project.sort_order,
        createdAt: new Date(project.created_at),
        updatedAt: new Date(project.updated_at),
      })
      .onConflictDoUpdate({
        target: projects.id,
        set: {
          name: project.name,
          description: project.description,
          appLink: project.app_link,
          webLink: project.web_link,
          liveLinkType: project.live_link_type,
          projectTypes: project.project_types ?? [],
          skills: project.skills ?? [],
          sortOrder: project.sort_order,
          updatedAt: new Date(project.updated_at),
        },
      });
    report.projects += 1;
  }

  // --- avatars -------------------------------------------------------------
  const rewrite = (url: string | null): string | null => {
    if (!url) return null;
    const match = IMAGE_URL_RE.exec(url);
    if (!match) return url;
    report.imageUrlsRewritten += 1;
    return `${PUBLIC_PREFIX.replace(/\/+$/, "")}/${match[1]}`;
  };

  if (s3 && AVATAR_DIR) {
    for (const object of raw.storage_objects) {
      const localPath = `${AVATAR_DIR.replace(/\/+$/, "")}/${object.name}`;
      let body: Buffer;
      try {
        body = await readFile(localPath);
      } catch {
        console.warn(`! missing avatar file, skipping: ${localPath}`);
        continue;
      }

      await s3.send(
        new PutObjectCommand({
          Bucket: bucket,
          Key: object.name,
          Body: body,
          ContentType: object.mime ?? "application/octet-stream",
          CacheControl: "public, max-age=31536000, immutable",
        }),
      );
      report.avatars += 1;
    }
  }

  // --- team members --------------------------------------------------------
  for (const member of raw.team) {
    await db
      .insert(team)
      .values({
        id: member.id,
        name: member.name,
        role: member.role ?? "",
        initials: member.initials,
        gradient: member.gradient,
        bio: member.bio ?? "",
        imageUrl: rewrite(member.image_url),
        userId: member.user_id,
        sortOrder: member.sort_order,
        profileUrl: member.profile_url,
        linkedinUrl: member.linkedin_url,
        teamId: member.team_id,
        createdAt: new Date(member.created_at),
        updatedAt: new Date(member.updated_at),
      })
      .onConflictDoUpdate({
        target: team.id,
        set: {
          name: member.name,
          role: member.role ?? "",
          initials: member.initials,
          gradient: member.gradient,
          bio: member.bio ?? "",
          imageUrl: rewrite(member.image_url),
          userId: member.user_id,
          sortOrder: member.sort_order,
          profileUrl: member.profile_url,
          linkedinUrl: member.linkedin_url,
          teamId: member.team_id,
          updatedAt: new Date(member.updated_at),
        },
      });
    report.members += 1;
  }

  // Sanity: make sure no legacy Supabase URLs remain.
  const leftovers = await db
    .select({ id: team.id, imageUrl: team.imageUrl })
    .from(team)
    .where(sql`${team.imageUrl} like '%/storage/v1/object/%'`);

  await pool.end();

  console.log(
    JSON.stringify(
      { ...report, legacyUrlsRemaining: leftovers.length, legacyUrlRows: leftovers },
      null,
      2,
    ),
  );
}

void main();
