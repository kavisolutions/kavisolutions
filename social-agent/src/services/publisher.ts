import { config, publicMediaUrl } from '../config.js';
import { db, type Platform } from '../db.js';
import { linkedinPublish } from '../platforms/linkedin.js';
import { facebookPublish, instagramPublish } from '../platforms/meta.js';
import { notify } from './telegram.js';

export type PublishOutcome = {
  platform: Platform;
  ok: boolean;
  externalId?: string;
  error?: string;
};

const publishers: Record<
  Platform,
  (caption: string, imageUrl: string | null) => Promise<{ externalId: string }>
> = {
  linkedin: linkedinPublish,
  facebook: facebookPublish,
  instagram: instagramPublish,
};

export async function publishPost(
  postId: number,
  targets: Platform[],
): Promise<PublishOutcome[]> {
  const row = db
    .prepare('SELECT caption, captions, image_path FROM posts WHERE id = ?')
    .get(postId) as
    | { caption: string; captions: string; image_path: string | null }
    | undefined;
  if (!row) throw new Error(`Post ${postId} not found`);

  const captions = safeCaptions(row.captions);
  const imageUrl = row.image_path ? publicMediaUrl(row.image_path) : null;
  const outcomes: PublishOutcome[] = [];

  for (const platform of targets) {
    try {
      const caption = captions[platform] ?? row.caption;
      const result = await publishers[platform](caption, imageUrl);
      outcomes.push({ platform, ok: true, externalId: result.externalId });
      recordResult(postId, platform, 'published', result.externalId, null);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      outcomes.push({ platform, ok: false, error: message });
      recordResult(postId, platform, 'failed', null, message);
    }
  }

  const anySuccess = outcomes.some((o) => o.ok);
  db.prepare('UPDATE posts SET status = ?, published_at = ? WHERE id = ?').run(
    anySuccess ? 'published' : 'failed',
    anySuccess ? Date.now() : null,
    postId,
  );

  /* Keep the calendar in sync when approval happens from Telegram rather than
     from the media-plan worker. */
  db.prepare(
    'UPDATE media_plan SET status = ?, updated_at = ? WHERE post_id = ?',
  ).run(anySuccess ? 'published' : 'failed', Date.now(), postId);

  const summary = outcomes
    .map((o) => `${o.platform}: ${o.ok ? `ok (${o.externalId})` : `FAILED - ${o.error}`}`)
    .join('\n');
  await notify(`Post #${postId} publish result:\n${summary}`);

  return outcomes;
}

function safeCaptions(raw: string): Partial<Record<Platform, string>> {
  try {
    const parsed = JSON.parse(raw) as Record<string, unknown>;
    const out: Partial<Record<Platform, string>> = {};
    for (const key of ['linkedin', 'facebook', 'instagram'] as Platform[]) {
      const value = parsed[key];
      if (typeof value === 'string') out[key] = value;
    }
    return out;
  } catch {
    return {};
  }
}

function recordResult(
  postId: number,
  platform: Platform,
  status: string,
  externalId: string | null,
  error: string | null,
): void {
  db.prepare(
    'INSERT INTO post_results (post_id, platform, status, external_id, error, created_at) VALUES (?, ?, ?, ?, ?, ?)',
  ).run(postId, platform, status, externalId, error, Date.now());
}

export function parseTargets(value: string): Platform[] {
  return value
    .split(',')
    .map((t) => t.trim())
    .filter((t): t is Platform => ['linkedin', 'facebook', 'instagram'].includes(t));
}

export function defaultTargets(): Platform[] {
  return config.scheduler.targets;
}
