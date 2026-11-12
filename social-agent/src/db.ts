import { mkdirSync } from 'node:fs';
import { dirname } from 'node:path';
import { getRandomValues } from 'node:crypto';
import Database from 'better-sqlite3';
import { config } from './config.js';
import { decrypt, encrypt } from './crypto.js';
import { addDays, isValidDate } from './dates.js';

mkdirSync(dirname(config.databasePath), { recursive: true });
mkdirSync(config.publicMediaDir, { recursive: true });

export const db = new Database(config.databasePath);
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

db.exec(`
  CREATE TABLE IF NOT EXISTS accounts (
    platform TEXT PRIMARY KEY,
    access_token TEXT NOT NULL,
    refresh_token TEXT,
    expires_at INTEGER NOT NULL,
    account_id TEXT NOT NULL,
    account_name TEXT,
    extra TEXT,
    updated_at INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS posts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    topic TEXT NOT NULL,
    caption TEXT NOT NULL,
    captions TEXT NOT NULL DEFAULT '{}',
    image_path TEXT,
    targets TEXT NOT NULL,
    status TEXT NOT NULL,
    created_at INTEGER NOT NULL,
    published_at INTEGER
  );

  CREATE TABLE IF NOT EXISTS post_results (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    post_id INTEGER NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    platform TEXT NOT NULL,
    status TEXT NOT NULL,
    external_id TEXT,
    error TEXT,
    created_at INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS oauth_state (
    state TEXT PRIMARY KEY,
    platform TEXT NOT NULL,
    created_at INTEGER NOT NULL
  );

  /* One image per calendar day. Rows are imported ahead of time (Drive folder,
     local folder or single upload) and the scheduler drafts the row whose date
     has arrived. */
  CREATE TABLE IF NOT EXISTS media_plan (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    scheduled_date TEXT NOT NULL,
    source TEXT NOT NULL DEFAULT 'manual'
      CHECK (source IN ('drive', 'local', 'upload', 'manual')),
    source_id TEXT,
    file_name TEXT NOT NULL,
    local_file TEXT NOT NULL,
    mime_type TEXT,
    size INTEGER,
    width INTEGER,
    height INTEGER,
    description TEXT,
    topic_hint TEXT,
    status TEXT NOT NULL DEFAULT 'planned'
      CHECK (status IN ('planned', 'drafted', 'published', 'skipped', 'missed', 'failed')),
    post_id INTEGER REFERENCES posts(id) ON DELETE SET NULL,
    error TEXT,
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL
  );

  CREATE UNIQUE INDEX IF NOT EXISTS media_plan_date_unique ON media_plan(scheduled_date);
  CREATE INDEX IF NOT EXISTS media_plan_status_idx ON media_plan(status, scheduled_date);
  CREATE UNIQUE INDEX IF NOT EXISTS media_plan_source_unique
    ON media_plan(source, source_id) WHERE source_id IS NOT NULL;
`);

export type Platform = 'linkedin' | 'facebook' | 'instagram';

export type AccountRow = {
  platform: Platform;
  access_token: string;
  refresh_token: string | null;
  expires_at: number;
  account_id: string;
  account_name: string | null;
  extra: string | null;
  updated_at: number;
};

export type StoredAccount = {
  platform: Platform;
  accessToken: string;
  refreshToken: string | null;
  expiresAt: number;
  accountId: string;
  accountName: string | null;
  extra: Record<string, string>;
};

const upsertAccountStmt = db.prepare(`
  INSERT INTO accounts (platform, access_token, refresh_token, expires_at, account_id, account_name, extra, updated_at)
  VALUES (@platform, @access_token, @refresh_token, @expires_at, @account_id, @account_name, @extra, @updated_at)
  ON CONFLICT(platform) DO UPDATE SET
    access_token = excluded.access_token,
    refresh_token = excluded.refresh_token,
    expires_at = excluded.expires_at,
    account_id = excluded.account_id,
    account_name = excluded.account_name,
    extra = excluded.extra,
    updated_at = excluded.updated_at
`);

export function saveAccount(account: StoredAccount): void {
  upsertAccountStmt.run({
    platform: account.platform,
    access_token: encrypt(account.accessToken),
    refresh_token: account.refreshToken ? encrypt(account.refreshToken) : null,
    expires_at: account.expiresAt,
    account_id: account.accountId,
    account_name: account.accountName,
    extra: JSON.stringify(account.extra),
    updated_at: Date.now(),
  });
}

const getAccountStmt = db.prepare<[string], AccountRow>('SELECT * FROM accounts WHERE platform = ?');

export function getAccount(platform: Platform): StoredAccount | null {
  const row = getAccountStmt.get(platform);
  if (!row) return null;
  return {
    platform: row.platform,
    accessToken: decrypt(row.access_token),
    refreshToken: row.refresh_token ? decrypt(row.refresh_token) : null,
    expiresAt: row.expires_at,
    accountId: row.account_id,
    accountName: row.account_name,
    extra: row.extra ? (JSON.parse(row.extra) as Record<string, string>) : {},
  };
}

export function listAccounts(): Array<Omit<StoredAccount, 'accessToken' | 'refreshToken'>> {
  return (db.prepare('SELECT * FROM accounts').all() as AccountRow[]).map((row) => ({
    platform: row.platform,
    expiresAt: row.expires_at,
    accountId: row.account_id,
    accountName: row.account_name,
    extra: row.extra ? (JSON.parse(row.extra) as Record<string, string>) : {},
  }));
}

export function createOAuthState(platform: Platform): string {
  const state = randomState();
  db.prepare('INSERT INTO oauth_state (state, platform, created_at) VALUES (?, ?, ?)').run(
    state,
    platform,
    Date.now(),
  );
  return state;
}

export function consumeOAuthState(state: string, platform: Platform): boolean {
  const row = db
    .prepare('SELECT platform, created_at FROM oauth_state WHERE state = ?')
    .get(state) as { platform: string; created_at: number } | undefined;
  if (!row) return false;
  db.prepare('DELETE FROM oauth_state WHERE state = ?').run(state);
  const fresh = Date.now() - row.created_at < 10 * 60 * 1000;
  return row.platform === platform && fresh;
}

function randomState(): string {
  return randomBytesHex(24);
}

function randomBytesHex(bytes: number): string {
  return Array.from(getRandomValues(new Uint8Array(bytes)))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

/* --------------------------------------------------------------------------
   Media plan
   -------------------------------------------------------------------------- */

export const MEDIA_PLAN_STATUSES = [
  'planned',
  'drafted',
  'published',
  'skipped',
  'missed',
  'failed',
] as const;

export type MediaPlanStatus = (typeof MEDIA_PLAN_STATUSES)[number];
export type MediaPlanSource = 'drive' | 'local' | 'upload' | 'manual';

export type MediaPlan = {
  id: number;
  scheduledDate: string;
  source: MediaPlanSource;
  sourceId: string | null;
  fileName: string;
  localFile: string;
  mimeType: string | null;
  size: number | null;
  width: number | null;
  height: number | null;
  description: string | null;
  topicHint: string | null;
  status: MediaPlanStatus;
  postId: number | null;
  error: string | null;
  createdAt: number;
  updatedAt: number;
};

type MediaPlanRow = {
  id: number;
  scheduled_date: string;
  source: MediaPlanSource;
  source_id: string | null;
  file_name: string;
  local_file: string;
  mime_type: string | null;
  size: number | null;
  width: number | null;
  height: number | null;
  description: string | null;
  topic_hint: string | null;
  status: MediaPlanStatus;
  post_id: number | null;
  error: string | null;
  created_at: number;
  updated_at: number;
};

export type MediaPlanInput = {
  scheduledDate: string;
  source: MediaPlanSource;
  sourceId?: string | null;
  fileName: string;
  localFile: string;
  mimeType?: string | null;
  size?: number | null;
  width?: number | null;
  height?: number | null;
  topicHint?: string | null;
};

function mapMediaPlan(row: MediaPlanRow): MediaPlan {
  return {
    id: row.id,
    scheduledDate: row.scheduled_date,
    source: row.source,
    sourceId: row.source_id,
    fileName: row.file_name,
    localFile: row.local_file,
    mimeType: row.mime_type,
    size: row.size,
    width: row.width,
    height: row.height,
    description: row.description,
    topicHint: row.topic_hint,
    status: row.status,
    postId: row.post_id,
    error: row.error,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function listMediaPlan(filter: {
  from?: string;
  to?: string;
  status?: string;
} = {}): MediaPlan[] {
  const clauses: string[] = [];
  const params: unknown[] = [];

  if (filter.from) {
    clauses.push('scheduled_date >= ?');
    params.push(filter.from);
  }
  if (filter.to) {
    clauses.push('scheduled_date <= ?');
    params.push(filter.to);
  }
  if (filter.status && filter.status !== 'all') {
    clauses.push('status = ?');
    params.push(filter.status);
  }

  const where = clauses.length > 0 ? `WHERE ${clauses.join(' AND ')}` : '';
  const rows = db
    .prepare(
      `SELECT * FROM media_plan ${where} ORDER BY scheduled_date ASC, id ASC LIMIT 1000`,
    )
    .all(...params) as MediaPlanRow[];

  return rows.map(mapMediaPlan);
}

export function getMediaPlan(id: number): MediaPlan | null {
  const row = db.prepare('SELECT * FROM media_plan WHERE id = ?').get(id) as
    | MediaPlanRow
    | undefined;
  return row ? mapMediaPlan(row) : null;
}

export function findMediaPlanBySource(
  source: MediaPlanSource,
  sourceId: string,
): MediaPlan | null {
  const row = db
    .prepare('SELECT * FROM media_plan WHERE source = ? AND source_id = ?')
    .get(source, sourceId) as MediaPlanRow | undefined;
  return row ? mapMediaPlan(row) : null;
}

export function insertMediaPlan(input: MediaPlanInput): MediaPlan {
  if (!isValidDate(input.scheduledDate)) {
    throw new Error(`Invalid media date: ${input.scheduledDate}`);
  }

  const now = Date.now();
  const info = db
    .prepare(
      `INSERT INTO media_plan
        (scheduled_date, source, source_id, file_name, local_file, mime_type, size,
         width, height, topic_hint, status, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'planned', ?, ?)`,
    )
    .run(
      input.scheduledDate,
      input.source,
      input.sourceId ?? null,
      input.fileName,
      input.localFile,
      input.mimeType ?? null,
      input.size ?? null,
      input.width ?? null,
      input.height ?? null,
      input.topicHint ?? null,
      now,
      now,
    );

  const created = getMediaPlan(Number(info.lastInsertRowid));
  if (!created) throw new Error('Failed to insert media plan');
  return created;
}

export type MediaPlanPatch = {
  scheduledDate?: string;
  topicHint?: string | null;
  description?: string | null;
  status?: MediaPlanStatus;
  postId?: number | null;
  error?: string | null;
  localFile?: string;
  fileName?: string;
  mimeType?: string | null;
  size?: number | null;
  width?: number | null;
  height?: number | null;
};

export function updateMediaPlan(id: number, patch: MediaPlanPatch): MediaPlan | null {
  const columns: string[] = [];
  const values: unknown[] = [];

  if (patch.scheduledDate !== undefined) {
    if (!isValidDate(patch.scheduledDate)) throw new Error('Invalid media date');
    columns.push('scheduled_date = ?');
    values.push(patch.scheduledDate);
  }
  if (patch.topicHint !== undefined) {
    columns.push('topic_hint = ?');
    values.push(patch.topicHint);
  }
  if (patch.description !== undefined) {
    columns.push('description = ?');
    values.push(patch.description);
  }
  if (patch.status !== undefined) {
    columns.push('status = ?');
    values.push(patch.status);
  }
  if (patch.postId !== undefined) {
    columns.push('post_id = ?');
    values.push(patch.postId);
  }
  if (patch.error !== undefined) {
    columns.push('error = ?');
    values.push(patch.error);
  }
  if (patch.localFile !== undefined) {
    columns.push('local_file = ?');
    values.push(patch.localFile);
  }
  if (patch.fileName !== undefined) {
    columns.push('file_name = ?');
    values.push(patch.fileName);
  }
  if (patch.mimeType !== undefined) {
    columns.push('mime_type = ?');
    values.push(patch.mimeType);
  }
  if (patch.size !== undefined) {
    columns.push('size = ?');
    values.push(patch.size);
  }
  if (patch.width !== undefined) {
    columns.push('width = ?');
    values.push(patch.width);
  }
  if (patch.height !== undefined) {
    columns.push('height = ?');
    values.push(patch.height);
  }

  if (columns.length === 0) return getMediaPlan(id);

  columns.push('updated_at = ?');
  values.push(Date.now(), id);

  db.prepare(`UPDATE media_plan SET ${columns.join(', ')} WHERE id = ?`).run(...values);
  return getMediaPlan(id);
}

export function deleteMediaPlan(id: number): MediaPlan | null {
  const existing = getMediaPlan(id);
  if (!existing) return null;
  db.prepare('DELETE FROM media_plan WHERE id = ?').run(id);
  return existing;
}

/* A draft or published post keeps its own image_path, so an image file must
   not be deleted while a post still points at it. */
export function mediaFileInUse(localFile: string): boolean {
  const row = db
    .prepare('SELECT 1 AS used FROM posts WHERE image_path = ? LIMIT 1')
    .get(localFile) as { used: number } | undefined;
  return Boolean(row);
}

export function mediaDateTaken(date: string, exceptId = 0): boolean {
  const row = db
    .prepare('SELECT id FROM media_plan WHERE scheduled_date = ? AND id != ?')
    .get(date, exceptId) as { id: number } | undefined;
  return Boolean(row);
}

/* Walk forward until an empty day is found. Used when importing a folder whose
   filenames have no dates: images are laid out one per day from a start date. */
export function nextFreeMediaDate(startDate: string, exceptId = 0): string {
  let date = startDate;
  for (let i = 0; i < 3650; i += 1) {
    if (!mediaDateTaken(date, exceptId)) return date;
    date = addDays(date, 1);
  }
  throw new Error('No free media date found within 10 years');
}

export function dueMediaPlan(today: string, from: string): MediaPlan | null {
  const row = db
    .prepare(
      `SELECT * FROM media_plan
       WHERE status = 'planned' AND scheduled_date <= ? AND scheduled_date >= ?
       ORDER BY scheduled_date ASC, id ASC
       LIMIT 1`,
    )
    .get(today, from) as MediaPlanRow | undefined;
  return row ? mapMediaPlan(row) : null;
}

export function markMissedMedia(beforeDate: string): number {
  const info = db
    .prepare(
      `UPDATE media_plan SET status = 'missed', updated_at = ?
       WHERE status = 'planned' AND scheduled_date < ?`,
    )
    .run(Date.now(), beforeDate);
  return info.changes;
}

export function mediaPlanCounts(): Record<string, number> {
  const rows = db
    .prepare('SELECT status, COUNT(*) AS count FROM media_plan GROUP BY status')
    .all() as Array<{ status: string; count: number }>;
  const counts: Record<string, number> = {};
  for (const row of rows) counts[row.status] = row.count;
  return counts;
}
