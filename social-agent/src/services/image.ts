import { writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { randomUUID } from 'node:crypto';
import { config } from '../config.js';

export async function generateImage(query: string): Promise<string | null> {
  if (config.llm.imageProvider === 'none') return null;

  try {
    switch (config.llm.imageProvider) {
      case 'cloudflare':
        return await cloudflareImage(query);
      case 'gemini':
        return await geminiImage(query);
      case 'pexels':
        return await pexelsImage(query);
      case 'wikimedia':
        return await wikimediaImage(query);
      case 'openai':
        return await openaiImage(query);
      case 'pollinations':
        return await pollinationsImage(query);
      default:
        return null;
    }
  } catch (error) {
    console.warn('[image] failed:', error instanceof Error ? error.message : error);
    return null;
  }
}

async function cloudflareImage(prompt: string): Promise<string | null> {
  const model = config.llm.cloudflareImageModel;
  const url = `${config.llm.cloudflareBaseUrl}/accounts/${config.llm.cloudflareAccountId}/ai/run/${model}`;

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      authorization: `Bearer ${config.llm.cloudflareApiToken}`,
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      prompt: `${prompt}. Professional editorial photograph, high quality, no text, no watermark, no logos.`,
      steps: config.llm.cloudflareImageSteps,
    }),
  });

  if (!res.ok) {
    throw new Error(`Cloudflare image ${res.status} ${await res.text()}`);
  }

  const contentType = res.headers.get('content-type') ?? '';
  if (contentType.startsWith('image/')) {
    const ext = contentType.includes('png') ? 'png' : 'jpg';
    const filename = `${randomUUID()}.${ext}`;
    await writeFile(join(config.publicMediaDir, filename), Buffer.from(await res.arrayBuffer()));
    return filename;
  }

  const data = (await res.json()) as {
    success?: boolean;
    errors?: Array<{ message?: string }>;
    result?: { image?: string };
  };
  if (data.success === false) {
    throw new Error(`Cloudflare image error: ${data.errors?.[0]?.message ?? 'unknown'}`);
  }
  const b64 = data.result?.image;
  if (!b64) throw new Error('Cloudflare returned no image data');

  const filename = `${randomUUID()}.png`;
  await writeFile(join(config.publicMediaDir, filename), Buffer.from(b64, 'base64'));
  return filename;
}

type WikimediaPage = {
  title: string;
  imageinfo?: Array<{
    thumburl?: string;
    url?: string;
    mime?: string;
    extmetadata?: Record<string, { value?: string }>;
  }>;
};

async function wikimediaImage(query: string): Promise<string | null> {
  const keywords = query
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 2)
    .slice(0, 5)
    .join(' ');

  const attempts = [
    `filetype:bitmap ${keywords}`,
    `filetype:bitmap ${keywords.split(' ').slice(0, 2).join(' ')}`,
    'filetype:bitmap workspace laptop',
  ];

  for (const search of attempts) {
    const found = await searchWikimedia(search);
    if (found) return found;
  }
  return null;
}

async function searchWikimedia(search: string): Promise<string | null> {
  const params = new URLSearchParams({
    action: 'query',
    generator: 'search',
    gsrsearch: search,
    gsrnamespace: '6',
    gsrlimit: '20',
    prop: 'imageinfo',
    iiprop: 'url|mime|extmetadata',
    iiurlwidth: '1200',
    format: 'json',
    origin: '*',
  });

  const res = await fetch(`${config.llm.wikimediaBaseUrl}?${params}`, {
    headers: { 'User-Agent': config.llm.wikimediaUserAgent },
  });
  if (!res.ok) return null;

  const data = (await res.json()) as { query?: { pages?: Record<string, WikimediaPage> } };
  const pages = Object.values(data.query?.pages ?? {});

  const candidates = pages.filter((page) => {
    const info = page.imageinfo?.[0];
    if (!info?.thumburl || !info.mime?.startsWith('image/')) return false;
    if (info.mime === 'image/svg+xml') return false;
    if (config.llm.wikimediaRequireAttribution) {
      const license = info.extmetadata?.LicenseShortName?.value ?? '';
      if (!/cc0|public domain|cc by(?!-nc)/i.test(license)) return false;
    }
    return true;
  });

  if (candidates.length === 0) return null;

  const pick = candidates[Math.floor(Math.random() * Math.min(candidates.length, 8))]!;
  const info = pick.imageinfo![0]!;
  const imageRes = await fetch(info.thumburl!, {
    headers: { 'User-Agent': config.llm.wikimediaUserAgent },
  });
  if (!imageRes.ok) return null;

  const filename = `${randomUUID()}.jpg`;
  await writeFile(join(config.publicMediaDir, filename), Buffer.from(await imageRes.arrayBuffer()));

  const attribution = info.extmetadata?.Artist?.value?.replace(/<[^>]*>/g, '').trim();
  const license = info.extmetadata?.LicenseShortName?.value ?? '';
  console.log(
    `[image] wikimedia: ${pick.title} | license=${license}${attribution ? ` | ${attribution}` : ''}`,
  );
  return filename;
}

async function geminiImage(prompt: string): Promise<string | null> {
  const url = `${config.llm.geminiBaseUrl}/models/${config.llm.geminiImageModel}:generateContent?key=${config.llm.geminiApiKey}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [
        {
          role: 'user',
          parts: [
            {
              text: `Generate a photorealistic editorial photograph for a social media post. No text, no logos, no watermarks. ${prompt}`,
            },
          ],
        },
      ],
      generationConfig: {
        responseModalities: ['IMAGE'],
        imageConfig: { aspectRatio: '4:3' },
      },
    }),
  });

  if (!res.ok) throw new Error(`Gemini image failed: ${res.status} ${await res.text()}`);

  const data = (await res.json()) as {
    candidates?: Array<{
      content?: {
        parts?: Array<{ inlineData?: { mimeType?: string; data?: string } }>;
      };
    }>;
  };

  const parts = data.candidates?.[0]?.content?.parts ?? [];
  for (const part of parts) {
    if (part.inlineData?.data) {
      const ext = part.inlineData.mimeType === 'image/png' ? 'png' : 'jpg';
      const filename = `${randomUUID()}.${ext}`;
      await writeFile(
        join(config.publicMediaDir, filename),
        Buffer.from(part.inlineData.data, 'base64'),
      );
      return filename;
    }
  }
  throw new Error('Gemini returned no image data');
}

type PexelsPhoto = {
  id: number;
  width: number;
  height: number;
  src: { original: string; large2x: string; large: string; landscape: string };
  alt?: string;
};

async function pexelsImage(query: string): Promise<string | null> {
  const keywords = query
    .replace(/[^\p{L}\p{N}\s,]/gu, ' ')
    .split(/[,\s]+/)
    .filter((w) => w.length > 2)
    .slice(0, 6)
    .join(' ');

  const params = new URLSearchParams({
    query: keywords || 'workspace',
    per_page: '15',
    orientation: 'landscape',
    size: 'large',
  });

  const res = await fetch(`https://api.pexels.com/v1/search?${params}`, {
    headers: { Authorization: config.llm.pexelsApiKey },
  });
  if (!res.ok) throw new Error(`Pexels ${res.status} ${await res.text()}`);

  const data = (await res.json()) as { photos?: PexelsPhoto[] };
  const photos = data.photos ?? [];
  if (photos.length === 0) return null;

  const pick = photos[Math.floor(Math.random() * Math.min(photos.length, 10))]!;
  const imageRes = await fetch(pick.src.large2x, {
    headers: { Authorization: config.llm.pexelsApiKey },
  });
  if (!imageRes.ok) throw new Error(`Pexels image download ${imageRes.status}`);

  const filename = `${randomUUID()}.jpg`;
  await writeFile(join(config.publicMediaDir, filename), Buffer.from(await imageRes.arrayBuffer()));
  return filename;
}

async function openaiImage(prompt: string): Promise<string | null> {
  const res = await fetch(`${config.llm.baseUrl}/images/generations`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${config.llm.apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: config.llm.imageModel,
      prompt,
      size: '1024x1024',
      n: 1,
    }),
  });
  if (!res.ok) throw new Error(`Image API ${res.status}`);

  const data = (await res.json()) as { data?: Array<{ b64_json?: string; url?: string }> };
  const first = data.data?.[0];
  if (!first) return null;

  const filename = `${randomUUID()}.png`;
  const path = join(config.publicMediaDir, filename);

  if (first.b64_json) {
    await writeFile(path, Buffer.from(first.b64_json, 'base64'));
    return filename;
  }
  if (first.url) {
    const imageRes = await fetch(first.url);
    if (!imageRes.ok) return null;
    await writeFile(path, Buffer.from(await imageRes.arrayBuffer()));
    return filename;
  }
  return null;
}

async function pollinationsImage(prompt: string): Promise<string | null> {
  const encoded = encodeURIComponent(
    `photorealistic professional photograph, no text, no watermark. ${prompt}`,
  );
  const seed = Math.floor(Math.random() * 1_000_000);
  const url =
    `${config.llm.pollinationsImageUrl}/prompt/${encoded}` +
    `?width=1200&height=900&nologo=true&seed=${seed}&referrer=social-agent`;

  const imageBuffer = await fetchPollinationsImage(url);
  const stripWatermark = await cropWatermark(imageBuffer);

  const filename = `${randomUUID()}.jpg`;
  await writeFile(join(config.publicMediaDir, filename), stripWatermark);
  return filename;
}

async function fetchPollinationsImage(url: string, attempts = 3): Promise<Buffer> {
  for (let i = 0; i < attempts; i++) {
    const res = await fetch(url);
    if (res.ok) {
      const type = res.headers.get('content-type') ?? '';
      if (type.startsWith('image/')) {
        return Buffer.from(await res.arrayBuffer());
      }
      throw new Error(`Unexpected content type: ${type}`);
    }
    if (res.status === 402 || res.status === 429) {
      const body = await res.text();
      const match = /retry after (\d+)s/i.exec(body);
      const waitMs = match?.[1] ? Number(match[1]) * 1000 : 50_000;
      console.warn(`[image] rate limited, waiting ${Math.round(waitMs / 1000)}s`);
      await new Promise((r) => setTimeout(r, Math.min(waitMs + 2000, 70_000)));
      continue;
    }
    throw new Error(`Pollinations image ${res.status}`);
  }
  throw new Error('Pollinations image rate limit not cleared');
}

async function cropWatermark(jpeg: Buffer): Promise<Buffer> {
  try {
    const sharp = (await import('sharp')).default;
    const meta = await sharp(jpeg).metadata();
    const width = meta.width ?? 1200;
    const height = meta.height ?? 900;
    return await sharp(jpeg)
      .extract({ left: 0, top: 0, width, height: Math.floor(height * 0.9) })
      .jpeg({ quality: 88 })
      .toBuffer();
  } catch {
    return jpeg;
  }
}
