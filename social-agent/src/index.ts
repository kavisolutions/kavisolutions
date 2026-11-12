import Fastify from 'fastify';
import fastifyStatic from '@fastify/static';
import { config } from './config.js';
import { db, getMediaPlan, type Platform } from './db.js';
import { registerRoutes } from './routes/index.js';
import { startScheduler } from './services/scheduler.js';
import { answerCallbackQuery, editMessageReplyMarkup, notify, telegramConfigured } from './services/telegram.js';
import { parseTargets, publishPost } from './services/publisher.js';
import { createDraft } from './services/drafter.js';

type UserRequest = {
  topic: string;
  targets: Platform[];
  withImage: boolean;
  instructions?: string;
  imagePrompt?: string;
  card?: {
    heading: string;
    subheading?: string;
    theme?: 'gold-maroon' | 'gold-navy';
    style?: 'script' | 'serif';
    backgroundPrompt?: string;
  };
};

function parseUserRequest(text: string): UserRequest {
  const lower = text.toLowerCase();
  const allTargets: Platform[] = ['linkedin', 'facebook', 'instagram'];

  const named = allTargets.filter((p) => lower.includes(p));
  const targets = named.length > 0 ? named : config.scheduler.targets;

  const withImage = !/\b(no image|without image|text only|no photo)\b/.test(lower);
  const noHashtags = /\b(no hashtags|without hashtags|no tags)\b/.test(lower);

  const instructions = noHashtags ? 'Do not include any hashtags in the output.' : undefined;

  const card = parseCardIntent(text);

  const cleanedTopic = text
    .replace(/\b(linkedin|facebook|instagram)\b/gi, '')
    .replace(/\b(no image|without image|text only|no photo|no hashtags|without hashtags|no tags)\b/gi, '')
    .replace(/\s+/g, ' ')
    .trim();

  const topic = cleanedTopic || text;

  const imagePrompt =
    !card && cleanedTopic.length > 140 ? cleanedTopic : undefined;

  return {
    topic,
    targets,
    withImage,
    instructions,
    imagePrompt,
    card,
  };
}

function parseCardIntent(text: string): UserRequest['card'] {
  const lower = text.toLowerCase();
  const isCard =
    /\b(greeting card|greeting|card|poster|invitation|wish(ing)?\b)/.test(lower) &&
    /\b(diwali|christmas|new year|eid|holi|pongal|onam|birthday|anniversary|festival|celebrat)/.test(lower);

  if (!isCard) return undefined;

  const quoted = [...text.matchAll(/"([^"]{2,80})"/g)]
    .map((m) => m[1]?.trim())
    .filter((s): s is string => Boolean(s));

  const heading =
    quoted[0] ??
    (/\badvance\s+happy/i.test(text) ? 'Advance Happy Diwali' : undefined) ??
    (/\bhappy\s+diwali/i.test(text) ? 'Happy Diwali' : undefined) ??
    extractFestivalHeading(text);

  const subheading =
    quoted[1] ??
    extractSubheading(text) ??
    defaultSubheading(lower);

  const theme: 'gold-maroon' | 'gold-navy' = /\b(maroon|wine|red|burgundy|crimson)\b/.test(lower)
    ? 'gold-maroon'
    : 'gold-navy';

  const style: 'script' | 'serif' = /\b(serif|typography|embossed|block|roman)\b/.test(lower)
    ? 'serif'
    : 'script';

  const bgMatch =
    /(?:background|design|scene|backdrop)\s*(?::|-)\s*([^\n]{20,400})/i.exec(text) ??
    /(?:background|backdrop)[^.\n]{20,200}/i.exec(text);

  const defaultBg =
    theme === 'gold-maroon'
      ? 'ornate traditional Indian festive background, deep maroon and wine tones with intricate antique golden floral mandala and paisley patterns, elegant symmetrical ornamental border, luxury wedding invitation craftsmanship, rich gold foil texture, no text, no letters, no words'
      : 'ornate traditional Indian festive background, deep navy blue with intricate golden floral mandala and paisley patterns, elegant symmetrical ornamental border, luxury wedding invitation craftsmanship, no text, no letters, no words';

  return {
    heading,
    subheading,
    theme,
    style,
    backgroundPrompt: bgMatch?.[1]?.trim() ?? defaultBg,
  };
}

function extractFestivalHeading(text: string): string {
  const match = /\b(happy|advance happy|wishing you a happy|warm wishes for|merry)\s+([A-Z][a-zA-Z]+(?:\s+[A-Z][a-zA-Z]+)?)/.exec(text);
  if (match?.[2]) {
    const prefix = /^advance/i.test(match[1] ?? '') ? 'Advance Happy' : 'Happy';
    return `${prefix} ${match[2]}`;
  }
  return 'Happy Celebrations';
}

function extractSubheading(text: string): string | undefined {
  const patterns = [
    /wishing you[^\n.]{3,90}/i,
    /may (?:this|the)[^\n.]{3,90}/i,
    /hoping your[^\n.]{3,90}/i,
  ];
  for (const p of patterns) {
    const m = p.exec(text);
    if (m?.[0]) return titleCaseSentence(m[0].trim());
  }
  return undefined;
}

function defaultSubheading(lower: string): string {
  if (/\bdiwali\b/.test(lower)) return 'Hoping your Diwali brings health, wealth and happiness';
  if (/\bchristmas\b/.test(lower)) return 'Wishing you joy, peace and a wonderful new year';
  if (/\bnew year\b/.test(lower)) return 'Wishing you a year of health, growth and happiness';
  return 'Wishing you happiness, prosperity and light';
}

function titleCaseSentence(value: string): string {
  const trimmed = value.replace(/\s+/g, ' ').trim();
  return trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
}

async function main(): Promise<void> {
  const app = Fastify({ logger: true, bodyLimit: 24 * 1024 * 1024 });

  await app.register(fastifyStatic, {
    root: config.publicMediaDir,
    prefix: '/media/',
  });

  await registerRoutes(app);

  const webhookSecret = process.env.TELEGRAM_WEBHOOK_SECRET ?? '';
  app.post<{ Params: { secret: string } }>(
    '/telegram/webhook/:secret',
    async (req, reply) => {
      if (!webhookSecret || req.params.secret !== webhookSecret) {
        return reply.code(403).send({ error: 'forbidden' });
      }

      const update = req.body as {
        callback_query?: {
          id: string;
          data?: string;
          message?: { message_id: number };
        };
        message?: { text?: string; chat?: { id: number } };
      };

      const cq = update.callback_query;
      if (cq?.data) {
        const [action, idRaw] = cq.data.split(':');
        const postId = Number(idRaw);
        if (action === 'approve' && Number.isInteger(postId)) {
          await answerCallbackQuery(cq.id, 'Approved, publishing...');
          const row = db
            .prepare('SELECT targets, status FROM posts WHERE id = ?')
            .get(postId) as { targets: string; status: string } | undefined;
          if (!row) {
            if (cq.message) await editMessageReplyMarkup(cq.message.message_id, `Post #${postId} not found`);
          } else if (row.status !== 'pending_approval') {
            if (cq.message) await editMessageReplyMarkup(cq.message.message_id, `Post #${postId} already ${row.status}`);
          } else {
            if (cq.message) await editMessageReplyMarkup(cq.message.message_id, `Approved. Publishing #${postId}...`);
            await publishPost(postId, parseTargets(row.targets));
          }
        } else if (action === 'reject' && Number.isInteger(postId)) {
          db.prepare('UPDATE posts SET status = ? WHERE id = ?').run('rejected', postId);
          /* Return the calendar row to "planned" so the day can be drafted
             again instead of looking finished forever. */
          db.prepare(
            "UPDATE media_plan SET status = 'planned', post_id = NULL, updated_at = ? WHERE post_id = ?",
          ).run(Date.now(), postId);
          await answerCallbackQuery(cq.id, 'Rejected');
          if (cq.message) await editMessageReplyMarkup(cq.message.message_id, `Post #${postId} rejected`);
        } else if (action === 'regen' && Number.isInteger(postId)) {
          await answerCallbackQuery(cq.id, 'Regenerating...');
          const row = db
            .prepare('SELECT topic, targets, status FROM posts WHERE id = ?')
            .get(postId) as { topic: string; targets: string; status: string } | undefined;
          if (!row) {
            if (cq.message) await editMessageReplyMarkup(cq.message.message_id, `Post #${postId} not found`);
          } else if (row.status !== 'pending_approval') {
            if (cq.message) await editMessageReplyMarkup(cq.message.message_id, `Post #${postId} already ${row.status}`);
          } else {
            db.prepare('UPDATE posts SET status = ? WHERE id = ?').run('superseded', postId);
            if (cq.message) await editMessageReplyMarkup(cq.message.message_id, `Regenerating from #${postId}...`);
            try {
              /* Media-plan drafts must keep their photo; regenerate through
                 the plan so the image and cached description are reused. */
              const linked = db
                .prepare('SELECT id FROM media_plan WHERE post_id = ?')
                .get(postId) as { id: number } | undefined;
              const plan = linked ? getMediaPlan(linked.id) : null;

              if (plan) {
                const { draftMediaPlan } = await import('./services/media-plan.js');
                const result = await draftMediaPlan(plan, { force: true });
                await notify(`New draft #${result.postId} ready.`);
              } else {
                const newId = await createDraft(row.topic, parseTargets(row.targets), true);
                await notify(`New draft #${newId} ready.`);
              }
            } catch (error) {
              await notify(`Regenerate failed: ${error instanceof Error ? error.message : error}`);
            }
          }
        }
        return { ok: true };
      }

      const text = update.message?.text?.trim();
      const chatId = update.message?.chat?.id;

      if (!text || !chatId || String(chatId) !== config.telegram.chatId) {
        return { ok: true };
      }

      if (text === '/start' || text === '/help') {
        await notify(
          [
            'Send me any instruction and I will draft a post for you.',
            '',
            'Examples:',
            '  diwali greeting with diyas and marigold',
            '  post about microservices tradeoffs, no hashtags',
            '  linkedin + instagram: our new launch next week',
            '',
            'Prefix with platform names to target them: linkedin, facebook, instagram.',
            'Reply "no image" to skip the picture. "no hashtags" to drop tags.',
            '',
            'Commands:',
            '  /start or /help - this message',
            '  /accounts - connected accounts',
          ].join('\n'),
        );
        return { ok: true };
      }

      if (text === '/accounts') {
        const { listAccounts } = await import('./db.js');
        const accounts = listAccounts();
        if (accounts.length === 0) {
          await notify('No accounts connected yet.');
        } else {
          const lines = accounts.map((a) => {
            const days = Math.floor((a.expiresAt - Date.now()) / 86_400_000);
            return `${a.platform}: ${a.accountName ?? a.accountId} (expires in ${days}d)`;
          });
          await notify(`Connected:\n${lines.join('\n')}`);
        }
        return { ok: true };
      }

      if (text.startsWith('/')) {
        await notify(`Unknown command. Send /help.`);
        return { ok: true };
      }

      await notify('Writing your post...');

      try {
        const request = parseUserRequest(text);
        const postId = await createDraft(request.topic, request.targets, request.withImage, {
          instructions: request.instructions,
          imagePrompt: request.imagePrompt,
          card: request.card,
        });
        console.log(`[telegram] created draft ${postId} from prompt: ${text.slice(0, 80)}`);
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        await notify(`Failed to create draft: ${message}`);
      }

      return { ok: true };
    },
  );

  await app.listen({ port: config.port, host: config.host });

  startScheduler();

  if (telegramConfigured()) {
    await notify('social-agent started');
  } else {
    app.log.warn('Telegram not configured, approvals will be skipped');
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
