import { access, readFile, readdir, unlink, writeFile } from 'node:fs/promises';
import { extname, join, relative } from 'node:path';
import { randomUUID } from 'node:crypto';
import { config } from '../config.js';
import {
  db,
  dueMediaPlan,
  findMediaPlanBySource,
  insertMediaPlan,
  markMissedMedia,
  mediaFileInUse,
  nextFreeMediaDate,
  updateMediaPlan,
  type MediaPlan,
} from '../db.js';
import {
  addDays,
  isValidDate,
  naturalCompare,
  parseDateFromName,
  todayInTimeZone,
} from '../dates.js';
import { composePost } from './composer.js';
import { createDraft } from './drafter.js';
import { downloadDriveImage, listDriveImages } from './drive.js';
import { defaultTargets, publishPost } from './publisher.js';
import { notify } from './telegram.js';
import { describeImage } from './vision.js';

const IMAGE_EXTENSIONS = new Set([
  '.jpg',
  '.jpeg',
  '.png',
  '.webp',
  '.gif',
  '.bmp',
  '.tif',
  '.tiff',
]);

export type ImportJobStatus = 'listing' | 'downloading' | 'done' | 'failed';

export type ImportJob = {
  id: string;
  status: ImportJobStatus;
  total: number;
  processed: number;
  imported: number;
  updated: number;
  failed: number;
  errors: string[];
  message: string;
  startedAt: number;
  finishedAt: number | null;
};

const jobs = new Map<string, ImportJob>();

export function getImportJob(id: string): ImportJob | null {
  const job = jobs.get(id);
  return job ? { ...job, errors: [...job.errors] } : null;
}

function runningImport(): ImportJob | undefined {
  for (const job of jobs.values()) {
    if (job.status === 'listing' || job.status === 'downloading') return job;
  }
  return undefined;
}

function pruneJobs(): void {
  const cutoff = Date.now() - 6 * 60 * 60 * 1000;
  for (const [id, job] of jobs) {
    const ended = job.finishedAt ?? job.startedAt;
    if (job.status !== 'listing' && job.status !== 'downloading' && ended < cutoff) {
      jobs.delete(id);
    }
  }
}

export type DriveImportInput = {
  folderUrl: string;
  startDate?: string;
  topicHint?: string;
};

export function startDriveImport(input: DriveImportInput): ImportJob {
  const active = runningImport();
  if (active) {
    throw new Error(`An import is already running (${active.processed}/${active.total || '?'})`);
  }
  pruneJobs();

  const startDate = input.startDate?.trim() || todayInTimeZone(config.timezone);
  if (!isValidDate(startDate)) {
    throw new Error('startDate must be a valid YYYY-MM-DD date');
  }
  const job: ImportJob = {
    id: randomUUID(),
    status: 'listing',
    total: 0,
    processed: 0,
    imported: 0,
    updated: 0,
    failed: 0,
    errors: [],
    message: 'Listing Google Drive folder...',
    startedAt: Date.now(),
    finishedAt: null,
  };
  jobs.set(job.id, job);

  void runDriveImport(job, input.folderUrl, startDate, input.topicHint?.trim() || null);

  return { ...job, errors: [...job.errors] };
}

async function runDriveImport(
  job: ImportJob,
  folderUrl: string,
  startDate: string,
  topicHint: string | null,
): Promise<void> {
  try {
    const images = await listDriveImages(folderUrl);
    images.sort((a, b) => naturalCompare(a.name, b.name));
    job.total = images.length;
    job.status = 'downloading';
    job.message = `Found ${images.length} images`;

    if (images.length === 0) {
      job.status = 'done';
      job.finishedAt = Date.now();
      job.message = 'No images found in that folder';
      return;
    }

    let sequentialDate = startDate;
    for (const image of images) {
      job.message = `Importing ${image.name}`;
      try {
        const existing = findMediaPlanBySource('drive', image.id);
        const namedDate = parseDateFromName(image.name);
        const desiredDate = existing?.scheduledDate ?? namedDate ?? sequentialDate;

        const buffer = await downloadDriveImage(image);
        const result = await ingestImage({
          source: 'drive',
          sourceId: image.id,
          fileName: image.name,
          buffer,
          scheduledDate: desiredDate,
          topicHint,
          keepExistingDate: Boolean(existing),
        });

        /* Advance from the date the row actually got, not the requested one,
           so a collision does not queue the next image on the same day. */
        if (!existing && !namedDate) {
          sequentialDate = addDays(result.plan.scheduledDate, 1);
        }

        if (result.created) job.imported += 1;
        else job.updated += 1;
      } catch (error) {
        job.failed += 1;
        if (job.errors.length < 50) {
          job.errors.push(
            `${image.name}: ${error instanceof Error ? error.message : String(error)}`,
          );
        }
      }
      job.processed += 1;
    }

    job.status = 'done';
    job.finishedAt = Date.now();
    job.message = `Imported ${job.imported}, updated ${job.updated}, failed ${job.failed}`;
  } catch (error) {
    job.status = 'failed';
    job.finishedAt = Date.now();
    job.message = error instanceof Error ? error.message : String(error);
  }
}

export type IngestInput = {
  source: 'drive' | 'local' | 'upload' | 'manual';
  sourceId?: string | null;
  fileName: string;
  buffer: Buffer;
  scheduledDate: string;
  topicHint?: string | null;
  keepExistingDate?: boolean;
};

export type IngestResult = {
  plan: MediaPlan;
  created: boolean;
};

export async function ingestImage(input: IngestInput): Promise<IngestResult> {
  const existing =
    input.sourceId != null
      ? findMediaPlanBySource(input.source, input.sourceId)
      : null;

  const scheduledDate = existing
    ? input.keepExistingDate
      ? existing.scheduledDate
      : input.scheduledDate
    : nextFreeMediaDate(input.scheduledDate);

  const localFile = `plan-${scheduledDate}-${randomUUID().slice(0, 8)}.jpg`;
  const localPath = join(config.publicMediaDir, localFile);
  const normalized = await normalizeImage(input.buffer);
  await writeFile(localPath, normalized.data);

  try {
    if (existing) {
      const updated = updateMediaPlan(existing.id, {
        scheduledDate,
        fileName: input.fileName,
        localFile,
        mimeType: 'image/jpeg',
        size: normalized.size,
        width: normalized.width,
        height: normalized.height,
        description: null,
        error: null,
        status:
          existing.status === 'failed' || existing.status === 'missed'
            ? 'planned'
            : existing.status,
        ...(input.topicHint ? { topicHint: input.topicHint } : {}),
      });
      if (!updated) throw new Error('Failed to update media plan');

      /* A pending draft follows the new image; a published post never changes
         and keeps the old file alive. */
      if (existing.postId) {
        db.prepare(
          "UPDATE posts SET image_path = ? WHERE id = ? AND status = 'pending_approval'",
        ).run(localFile, existing.postId);
      }

      if (existing.localFile !== localFile && !mediaFileInUse(existing.localFile)) {
        await unlink(join(config.publicMediaDir, existing.localFile)).catch(() => undefined);
      }
      return { plan: updated, created: false };
    }

    const plan = insertMediaPlan({
      scheduledDate,
      source: input.source,
      sourceId: input.sourceId ?? null,
      fileName: input.fileName,
      localFile,
      mimeType: 'image/jpeg',
      size: normalized.size,
      width: normalized.width,
      height: normalized.height,
      topicHint: input.topicHint ?? null,
    });

    return { plan, created: true };
  } catch (error) {
    /* Do not leave an orphan file behind when the row cannot be written
       (invalid date, date collision, database error). */
    await unlink(localPath).catch(() => undefined);
    throw error;
  }
}

export async function uploadImage(input: {
  fileName: string;
  buffer: Buffer;
  date: string;
  topicHint?: string | null;
}): Promise<IngestResult> {
  return ingestImage({
    source: 'upload',
    fileName: input.fileName,
    buffer: input.buffer,
    scheduledDate: input.date,
    topicHint: input.topicHint ?? null,
  });
}

export type LocalImportReport = {
  total: number;
  imported: number;
  updated: number;
  failed: number;
  errors: string[];
};

export async function importLocalFolder(input: {
  dir: string;
  startDate?: string;
  topicHint?: string;
}): Promise<LocalImportReport> {
  const startDate = input.startDate?.trim() || todayInTimeZone(config.timezone);
  if (!isValidDate(startDate)) {
    throw new Error('startDate must be a valid YYYY-MM-DD date');
  }
  const entries = await readdir(input.dir, { recursive: true, withFileTypes: true });
  const files = entries
    .filter((entry) => entry.isFile() && IMAGE_EXTENSIONS.has(extname(entry.name).toLowerCase()))
    .map((entry) => entry)
    .sort((a, b) => naturalCompare(a.name, b.name));

  const report: LocalImportReport = {
    total: files.length,
    imported: 0,
    updated: 0,
    failed: 0,
    errors: [],
  };
  let sequentialDate = startDate;

  for (const file of files) {
    const fullPath = join(file.parentPath, file.name);
    const sourceId = relative(input.dir, fullPath).replaceAll('\\', '/');
    try {
      const existing = findMediaPlanBySource('local', sourceId);
      const namedDate = parseDateFromName(file.name);
      const desiredDate = existing?.scheduledDate ?? namedDate ?? sequentialDate;

      const buffer = await readFile(fullPath);
      const result = await ingestImage({
        source: 'local',
        sourceId,
        fileName: file.name,
        buffer,
        scheduledDate: desiredDate,
        topicHint: input.topicHint ?? null,
        keepExistingDate: Boolean(existing),
      });

      if (!existing && !namedDate) {
        sequentialDate = addDays(result.plan.scheduledDate, 1);
      }

      if (result.created) report.imported += 1;
      else report.updated += 1;
    } catch (error) {
      report.failed += 1;
      if (report.errors.length < 50) {
        report.errors.push(
          `${sourceId}: ${error instanceof Error ? error.message : String(error)}`,
        );
      }
    }
  }

  return report;
}

async function normalizeImage(buffer: Buffer): Promise<{
  data: Buffer;
  width: number;
  height: number;
  size: number;
}> {
  const sharp = (await import('sharp')).default;

  let pipeline = sharp(buffer, { failOn: 'none' }).rotate();

  if (config.media.aspect === 'portrait') {
    pipeline = pipeline.resize(1080, 1350, { fit: 'cover', position: 'attention' });
  } else if (config.media.aspect === 'landscape') {
    pipeline = pipeline.resize(1350, 1080, { fit: 'cover', position: 'attention' });
  } else {
    pipeline = pipeline.resize({
      width: 1600,
      height: 1600,
      fit: 'inside',
      withoutEnlargement: true,
    });
  }

  const { data, info } = await pipeline
    .flatten({ background: '#ffffff' })
    .jpeg({ quality: 85, mozjpeg: true })
    .toBuffer({ resolveWithObject: true });

  return {
    data,
    width: info.width,
    height: info.height,
    size: data.byteLength,
  };
}

export type DraftMediaResult = {
  plan: MediaPlan;
  postId: number;
  alreadyDrafted: boolean;
};

export async function draftMediaPlan(
  plan: MediaPlan,
  options: { force?: boolean; targets?: ReturnType<typeof defaultTargets> } = {},
): Promise<DraftMediaResult> {
  if (plan.postId && plan.status === 'drafted' && !options.force) {
    return { plan, postId: plan.postId, alreadyDrafted: true };
  }
  if (plan.status === 'published' && !options.force) {
    throw new Error('This image was already published. Move it to another date or use force.');
  }

  try {
    await access(join(config.publicMediaDir, plan.localFile)).catch(() => {
      throw new Error(`Image file is missing: ${plan.localFile}`);
    });

    const visionDescription = plan.description ?? (await describeImage(plan.localFile));
    const description = visionDescription ?? plan.topicHint ?? fileNameTopic(plan.fileName);

    if (!plan.description) {
      updateMediaPlan(plan.id, { description });
    }

    const targets = options.targets ?? defaultTargets();
    const instructions =
      'The post is published together with the planned photo. Write copy that fits the photo and the topic. ' +
      'Do not describe the photo literally and do not start with "In this image".';
    /* Only prepend the editor's hint when the description came from the photo;
       with no vision provider the hint already is the topic. */
    const topic =
      plan.topicHint && visionDescription
        ? `${plan.topicHint}. ${visionDescription}`
        : description;

    const captions: Partial<Record<(typeof targets)[number], string>> = {};
    for (const platform of targets) {
      captions[platform] = await composePost(topic, platform, instructions);
    }

    const postId = await createDraft(topic, targets, true, {
      captions,
      imageFile: plan.localFile,
      instructions,
    });

    const updated =
      updateMediaPlan(plan.id, {
        status: 'drafted',
        postId,
        description,
        error: null,
      }) ?? plan;

    return { plan: updated, postId, alreadyDrafted: false };
  } catch (error) {
    updateMediaPlan(plan.id, {
      status: 'failed',
      error: error instanceof Error ? error.message : String(error),
    });
    throw error;
  }
}

function fileNameTopic(fileName: string): string {
  return fileName
    .replace(/\.[^.]+$/, '')
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export async function runDueMedia(): Promise<{
  processed: number;
  posts: number[];
  missed: number;
}> {
  const today = todayInTimeZone(config.timezone);
  const from = addDays(today, -config.media.catchupDays);
  const missed = markMissedMedia(from);
  if (missed > 0) {
    await notify(`${missed} media plan item(s) older than ${config.media.catchupDays} days marked missed.`);
  }

  const posts: number[] = [];
  for (let i = 0; i < config.media.maxPerRun; i += 1) {
    const plan = dueMediaPlan(today, from);
    if (!plan) break;

    try {
      const result = await draftMediaPlan(plan);
      posts.push(result.postId);

      if (config.media.autoPublish) {
        const outcomes = await publishPost(result.postId, defaultTargets());
        const ok = outcomes.some((outcome) => outcome.ok);
        updateMediaPlan(plan.id, { status: ok ? 'published' : 'failed' });
      }
    } catch (error) {
      console.error('[media] draft failed', error);
      await notify(
        `Media plan #${plan.id} (${plan.scheduledDate}) failed: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
    }
  }

  return { processed: posts.length, posts, missed };
}
