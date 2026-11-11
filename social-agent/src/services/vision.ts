import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { config } from '../config.js';

/* One vision call per planned image. The result is cached in media_plan so a
   regenerate does not re-bill the model, and so the same description is reused
   across LinkedIn/Facebook/Instagram captions. */

const PROMPT = `Describe this image for a social media post.
Give one compact paragraph covering: the main subject, the setting, the mood,
the dominant colours, and one concrete angle a business could write about.
Do not say "in this image". Do not use markdown. Maximum 90 words.`;

export async function describeImage(localFile: string): Promise<string | null> {
  if (config.media.visionProvider === 'none') return null;

  try {
    const buffer = await readFile(join(config.publicMediaDir, localFile));
    if (buffer.byteLength === 0) return null;

    switch (config.media.visionProvider) {
      case 'gemini':
        return await geminiDescribe(buffer);
      case 'openai':
        return await openaiDescribe(buffer);
      case 'cloudflare':
        return await cloudflareDescribe(buffer);
      default:
        return null;
    }
  } catch (error) {
    console.warn(
      '[vision] failed:',
      error instanceof Error ? error.message : String(error),
    );
    return null;
  }
}

function clean(value: string): string {
  return value
    .replace(/```[\s\S]*?```/g, '')
    .replace(/^#+\s*/gm, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 1200);
}

async function geminiDescribe(image: Buffer): Promise<string | null> {
  const url =
    `${config.llm.geminiBaseUrl}/models/${config.media.geminiVisionModel}:generateContent` +
    `?key=${config.llm.geminiApiKey}`;

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [
        {
          role: 'user',
          parts: [
            { text: PROMPT },
            {
              inline_data: {
                mime_type: 'image/jpeg',
                data: image.toString('base64'),
              },
            },
          ],
        },
      ],
      generationConfig: { temperature: 0.4, maxOutputTokens: 400 },
    }),
  });

  if (!res.ok) {
    throw new Error(`Gemini vision ${res.status} ${await res.text()}`.slice(0, 600));
  }

  const data = (await res.json()) as {
    candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
  };
  const text = (data.candidates?.[0]?.content?.parts ?? [])
    .map((part) => part.text ?? '')
    .join(' ');
  return clean(text) || null;
}

async function openaiDescribe(image: Buffer): Promise<string | null> {
  const res = await fetch(`${config.llm.baseUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${config.llm.apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: config.media.openaiVisionModel,
      temperature: 0.4,
      max_tokens: 400,
      messages: [
        {
          role: 'user',
          content: [
            { type: 'text', text: PROMPT },
            {
              type: 'image_url',
              image_url: { url: `data:image/jpeg;base64,${image.toString('base64')}` },
            },
          ],
        },
      ],
    }),
  });

  if (!res.ok) {
    throw new Error(`OpenAI vision ${res.status} ${await res.text()}`.slice(0, 600));
  }

  const data = (await res.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };
  return clean(data.choices?.[0]?.message?.content ?? '') || null;
}

async function cloudflareDescribe(image: Buffer): Promise<string | null> {
  const url =
    `${config.llm.cloudflareBaseUrl}/accounts/${config.llm.cloudflareAccountId}` +
    `/ai/run/${config.media.cloudflareVisionModel}`;

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      authorization: `Bearer ${config.llm.cloudflareApiToken}`,
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      prompt: PROMPT,
      image: [image.toString('base64')],
      max_tokens: 400,
    }),
  });

  if (!res.ok) {
    throw new Error(`Cloudflare vision ${res.status} ${await res.text()}`.slice(0, 600));
  }

  const data = (await res.json()) as {
    success?: boolean;
    errors?: Array<{ message?: string }>;
    result?: { description?: string; response?: string };
  };
  if (data.success === false) {
    throw new Error(`Cloudflare vision: ${data.errors?.[0]?.message ?? 'unknown'}`);
  }
  return clean(data.result?.description ?? data.result?.response ?? '') || null;
}
