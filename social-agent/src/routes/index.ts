import { readFile, unlink } from 'node:fs/promises';
import { join } from 'node:path';
import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { config } from '../config.js';
import {
  consumeOAuthState,
  createOAuthState,
  db,
  deleteMediaPlan,
  getMediaPlan,
  listAccounts,
  listMediaPlan,
  MEDIA_PLAN_STATUSES,
  mediaFileInUse,
  mediaPlanCounts,
  updateMediaPlan,
  type MediaPlanStatus,
} from '../db.js';
import { linkedinAuthUrl, linkedinExchangeCode } from '../platforms/linkedin.js';
import { metaAuthUrl, metaExchangeCode } from '../platforms/meta.js';
import { createDraft } from '../services/drafter.js';
import { driveConfigured } from '../services/drive.js';
import {
  draftMediaPlan,
  getImportJob,
  runDueMedia,
  startDriveImport,
  uploadImage,
} from '../services/media-plan.js';
import { defaultTargets, parseTargets, publishPost } from '../services/publisher.js';
import { notify } from '../services/telegram.js';

function requireAdmin(req: FastifyRequest, reply: FastifyReply): boolean {
  const header = req.headers['x-admin-token'];
  if (header !== config.adminToken) {
    reply.code(401).send({ error: 'Unauthorized' });
    return false;
  }
  return true;
}

export async function registerRoutes(app: FastifyInstance): Promise<void> {
  app.get('/health', async () => ({ ok: true }));

  app.get('/auth/linkedin', async (_req, reply) => {
    const state = createOAuthState('linkedin');
    return reply.redirect(linkedinAuthUrl(state));
  });

  app.get('/auth/linkedin/callback', async (req, reply) => {
    const query = req.query as { code?: string; state?: string; error?: string };
    if (query.error) return reply.code(400).send({ error: query.error });
    if (!query.code || !query.state || !consumeOAuthState(query.state, 'linkedin')) {
      return reply.code(400).send({ error: 'Invalid OAuth state or code' });
    }
    const account = await linkedinExchangeCode(query.code);
    await notify(`LinkedIn connected as ${account.accountName ?? account.accountId}`);
    return reply.type('text/html').send(successPage('LinkedIn connected'));
  });

  app.get('/auth/meta', async (_req, reply) => {
    const state = createOAuthState('facebook');
    return reply.redirect(metaAuthUrl(state));
  });

  app.get('/auth/meta/callback', async (req, reply) => {
    const query = req.query as { code?: string; state?: string; error?: string };
    if (query.error) return reply.code(400).send({ error: query.error });
    if (!query.code || !query.state || !consumeOAuthState(query.state, 'facebook')) {
      return reply.code(400).send({ error: 'Invalid OAuth state or code' });
    }
    await metaExchangeCode(query.code);
    await notify('Meta connected: Facebook Page (+Instagram if linked)');
    return reply.type('text/html').send(successPage('Facebook/Instagram connected'));
  });

  app.get('/admin/accounts', async (req, reply) => {
    if (!requireAdmin(req, reply)) return;
    return listAccounts();
  });

  /* --- media plan ------------------------------------------------------- */

  app.get('/admin/status', async (req, reply) => {
    if (!requireAdmin(req, reply)) return;
    return {
      ok: true,
      timezone: config.timezone,
      media: {
        counts: mediaPlanCounts(),
        schedulerEnabled: config.media.schedulerEnabled,
        schedule: config.media.schedule,
        autoPublish: config.media.autoPublish,
        catchupDays: config.media.catchupDays,
        visionProvider: config.media.visionProvider,
        aspect: config.media.aspect,
      },
      drive: { configured: driveConfigured() },
      telegram: Boolean(config.telegram.botToken && config.telegram.chatId),
      accounts: listAccounts(),
    };
  });

  app.get('/admin/media', async (req, reply) => {
    if (!requireAdmin(req, reply)) return;
    const query = req.query as { from?: string; to?: string; status?: string };
    return { items: listMediaPlan(query), counts: mediaPlanCounts() };
  });

  app.post('/admin/media/import/drive', async (req, reply) => {
    if (!requireAdmin(req, reply)) return;
    const body = req.body as {
      folderUrl?: string;
      startDate?: string;
      topicHint?: string;
    };
    if (!body?.folderUrl?.trim()) {
      return reply.code(400).send({ error: 'folderUrl required' });
    }
    try {
      const job = startDriveImport({
        folderUrl: body.folderUrl.trim(),
        startDate: body.startDate,
        topicHint: body.topicHint,
      });
      return reply.code(202).send({ job });
    } catch (error) {
      return reply.code(409).send({
        error: error instanceof Error ? error.message : String(error),
      });
    }
  });

  app.get('/admin/media/import/:jobId', async (req, reply) => {
    if (!requireAdmin(req, reply)) return;
    const job = getImportJob((req.params as { jobId: string }).jobId);
    if (!job) return reply.code(404).send({ error: 'job not found' });
    return { job };
  });

  app.post('/admin/media/upload', async (req, reply) => {
    if (!requireAdmin(req, reply)) return;
    const body = req.body as {
      fileName?: string;
      date?: string;
      topicHint?: string;
      dataBase64?: string;
    };
    if (!body?.fileName || !body.date || !body.dataBase64) {
      return reply.code(400).send({ error: 'fileName, date and dataBase64 are required' });
    }

    const base64 = body.dataBase64.replace(/^data:[^;]+;base64,/, '');
    const buffer = Buffer.from(base64, 'base64');
    if (buffer.byteLength === 0) {
      return reply.code(400).send({ error: 'Empty image' });
    }
    if (buffer.byteLength > 15 * 1024 * 1024) {
      return reply.code(413).send({ error: 'Image larger than 15MB' });
    }

    try {
      const result = await uploadImage({
        fileName: body.fileName,
        buffer,
        date: body.date,
        topicHint: body.topicHint,
      });
      return result;
    } catch (error) {
      return reply.code(400).send({
        error: error instanceof Error ? error.message : String(error),
      });
    }
  });

  app.post('/admin/media/run-due', async (req, reply) => {
    if (!requireAdmin(req, reply)) return;
    return runDueMedia();
  });

  app.patch('/admin/media/:id', async (req, reply) => {
    if (!requireAdmin(req, reply)) return;
    const id = Number((req.params as { id: string }).id);
    if (!Number.isInteger(id)) return reply.code(400).send({ error: 'bad id' });

    const body = req.body as {
      scheduledDate?: string;
      topicHint?: string;
      status?: string;
    };

    if (body.status && !MEDIA_PLAN_STATUSES.includes(body.status as MediaPlanStatus)) {
      return reply.code(400).send({ error: 'bad status' });
    }

    try {
      const updated = updateMediaPlan(id, {
        scheduledDate: body.scheduledDate,
        topicHint: body.topicHint,
        status: body.status as MediaPlanStatus | undefined,
      });
      if (!updated) return reply.code(404).send({ error: 'media plan not found' });
      return updated;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      return reply
        .code(message.includes('UNIQUE') ? 409 : 400)
        .send({ error: message.includes('UNIQUE') ? 'That date already has an image' : message });
    }
  });

  app.delete('/admin/media/:id', async (req, reply) => {
    if (!requireAdmin(req, reply)) return;
    const id = Number((req.params as { id: string }).id);
    if (!Number.isInteger(id)) return reply.code(400).send({ error: 'bad id' });

    const removed = deleteMediaPlan(id);
    if (!removed) return reply.code(404).send({ error: 'media plan not found' });
    if (!mediaFileInUse(removed.localFile)) {
      await unlink(join(config.publicMediaDir, removed.localFile)).catch(() => undefined);
    }
    return { ok: true };
  });

  app.post('/admin/media/:id/draft', async (req, reply) => {
    if (!requireAdmin(req, reply)) return;
    const id = Number((req.params as { id: string }).id);
    if (!Number.isInteger(id)) return reply.code(400).send({ error: 'bad id' });

    const plan = getMediaPlan(id);
    if (!plan) return reply.code(404).send({ error: 'media plan not found' });

    const body = (req.body ?? {}) as { force?: boolean };
    try {
      return await draftMediaPlan(plan, { force: body.force === true });
    } catch (error) {
      return reply.code(500).send({
        error: error instanceof Error ? error.message : String(error),
      });
    }
  });

  app.get('/admin/media/:id/image', async (req, reply) => {
    if (!requireAdmin(req, reply)) return;
    const id = Number((req.params as { id: string }).id);
    if (!Number.isInteger(id)) return reply.code(400).send({ error: 'bad id' });

    const plan = getMediaPlan(id);
    if (!plan) return reply.code(404).send({ error: 'media plan not found' });

    try {
      const buffer = await readFile(join(config.publicMediaDir, plan.localFile));
      return reply
        .type(plan.mimeType ?? 'image/jpeg')
        .header('Cache-Control', 'private, max-age=300')
        .send(buffer);
    } catch {
      return reply.code(404).send({ error: 'image file missing' });
    }
  });

  app.post('/admin/draft', async (req, reply) => {
    if (!requireAdmin(req, reply)) return;
    const body = req.body as {
      topic?: string;
      targets?: string;
      image?: boolean;
      caption?: string;
      instructions?: string;
      imagePrompt?: string;
      card?: {
        heading?: string;
        subheading?: string;
        theme?: 'gold-maroon' | 'gold-navy';
        style?: 'script' | 'serif';
        backgroundPrompt?: string;
      };
    };
    if (!body?.topic) return reply.code(400).send({ error: 'topic required' });
    const targets = body.targets ? parseTargets(body.targets) : defaultTargets();
    if (targets.length === 0) return reply.code(400).send({ error: 'no valid targets' });
    const postId = await createDraft(body.topic, targets, body.image ?? true, {
      caption: body.caption,
      instructions: body.instructions,
      imagePrompt: body.imagePrompt,
      card: body.card?.heading
        ? {
            heading: body.card.heading,
            subheading: body.card.subheading,
            theme: body.card.theme,
            style: body.card.style,
            backgroundPrompt: body.card.backgroundPrompt,
          }
        : undefined,
    });
    return { postId, targets };
  });

  app.post('/admin/publish/:id', async (req, reply) => {
    if (!requireAdmin(req, reply)) return;
    const id = Number((req.params as { id: string }).id);
    if (!Number.isInteger(id)) return reply.code(400).send({ error: 'bad id' });
    const row = db.prepare('SELECT targets FROM posts WHERE id = ?').get(id) as
      | { targets: string }
      | undefined;
    if (!row) return reply.code(404).send({ error: 'post not found' });
    const outcomes = await publishPost(id, parseTargets(row.targets));
    return { outcomes };
  });

  app.get('/admin/posts', async (req, reply) => {
    if (!requireAdmin(req, reply)) return;
    const posts = db
      .prepare(
        'SELECT id, topic, caption, image_path, targets, status, created_at, published_at FROM posts ORDER BY id DESC LIMIT 50',
      )
      .all();
    const results = db.prepare('SELECT * FROM post_results ORDER BY id DESC LIMIT 200').all();
    return { posts, results };
  });
}

function successPage(message: string): string {
  return `<!doctype html><html><body style="font-family:system-ui;padding:40px;text-align:center">
  <h2>${message}</h2><p>You can close this tab.</p></body></html>`;
}
