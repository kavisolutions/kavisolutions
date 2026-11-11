import { config, publicMediaUrl } from '../config.js';
import { db, type Platform } from '../db.js';
import { composeImagePrompt, composePost } from './composer.js';
import { generateImage } from './image.js';
import { composeCard } from './card.js';
import { defaultTargets } from './publisher.js';
import { notify, sendApprovalMessage, telegramConfigured } from './telegram.js';

export type DraftOptions = {
  caption?: string;
  /* Per-platform copy, used by the media-plan scheduler where one image is
     described once and each platform gets its own caption. */
  captions?: Partial<Record<Platform, string>>;
  /* Publish an image that is already on disk (media_plan) instead of
     generating one. Passing null explicitly means "no image". */
  imageFile?: string | null;
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

export async function createDraft(
  topic: string,
  targets = defaultTargets(),
  withImage = true,
  options: DraftOptions = {},
): Promise<number> {
  const captions: Partial<Record<Platform, string>> = {};
  if (options.captions) {
    for (const platform of targets) {
      const supplied = options.captions[platform];
      if (supplied) captions[platform] = supplied;
    }
  }

  if (Object.keys(captions).length === 0 && options.caption) {
    for (const platform of targets) captions[platform] = options.caption;
  }

  if (Object.keys(captions).length === 0) {
    for (const platform of targets) {
      captions[platform] = await composePost(topic, platform, options.instructions);
    }
  }

  const caption = captions[targets[0] ?? 'linkedin'] ?? topic;
  let imagePath: string | null = null;

  if ('imageFile' in options) {
    imagePath = options.imageFile ?? null;
    console.log('[drafter] using planned image:', imagePath);
  } else if (options.card) {
    let bgPath: string | null = null;
    if (options.card.backgroundPrompt !== null) {
      const prompt =
        options.card.backgroundPrompt ??
        'ornate traditional Indian festive background, deep navy blue with intricate golden floral mandala patterns, elegant symmetrical ornamental border, luxury wedding invitation style, no text';
      const bgFile = await generateImage(prompt);
      if (bgFile) bgPath = `${config.publicMediaDir}/${bgFile}`;
    }
    imagePath = await composeCard(
      {
        heading: options.card.heading,
        subheading: options.card.subheading,
        theme: options.card.theme ?? 'gold-navy',
        style: options.card.style ?? 'script',
        width: 1080,
        height: 1350,
      },
      bgPath,
    );
    console.log('[drafter] composed card:', imagePath);
  } else if (withImage) {
    const imagePrompt =
      options.imagePrompt ??
      (options.caption ? options.caption.slice(0, 200) : await composeImagePrompt(topic, caption));
    console.log('[drafter] image prompt:', imagePrompt);
    imagePath = await generateImage(imagePrompt);
  }

  const info = db
    .prepare(
      'INSERT INTO posts (topic, caption, captions, image_path, targets, status, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
    )
    .run(
      topic,
      caption,
      JSON.stringify(captions),
      imagePath,
      targets.join(','),
      'pending_approval',
      Date.now(),
    );

  const postId = Number(info.lastInsertRowid);
  const imageUrl = imagePath ? publicMediaUrl(imagePath) : null;

  if (telegramConfigured()) {
    const preview = describeCaptions(captions, targets);
    await sendApprovalMessage(postId, preview, imageUrl, targets);
  } else {
    await notify(`Draft #${postId} created (Telegram not configured).\n\n${caption}`);
  }
  return postId;
}

function describeCaptions(
  captions: Partial<Record<Platform, string>>,
  targets: Platform[],
): string {
  if (targets.length === 1) return captions[targets[0]!] ?? '';
  return targets
    .map((t) => `--- ${t.toUpperCase()} ---\n${captions[t] ?? ''}`)
    .join('\n\n');
}

export function pickRandomTopic(): string {
  const pool = config.scheduler.topicPool;
  if (pool.length === 0) throw new Error('TOPIC_POOL is empty');
  return pool[Math.floor(Math.random() * pool.length)]!;
}

export async function draftFromPool(): Promise<number> {
  return createDraft(pickRandomTopic());
}
