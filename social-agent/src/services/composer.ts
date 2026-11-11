import { config } from '../config.js';
import type { Platform } from '../db.js';

const PLATFORM_GUIDE: Record<Platform, string> = {
  linkedin: `Write for LinkedIn. 120-220 words. Start with a strong first line (no 'I am excited to share').
Structure: hook, 2-3 short paragraphs or lines, takeaway, one question at the end.
Use line breaks for readability. Max 3 hashtags at the very end. No emojis unless brand tone allows.`,
  facebook: `Write for a Facebook Page. 60-120 words. Conversational, one idea, one clear takeaway.
Ask a question at the end. Max 2 hashtags. No emojis unless brand tone allows.`,
  instagram: `Write an Instagram caption. 60-120 words. First line must hook in under 8 words.
Line breaks allowed. End with a call to action and 5-8 relevant hashtags on separate lines.`,
};

export async function composePost(
  topic: string,
  platform: Platform,
  instructions?: string,
): Promise<string> {
  if (config.llm.provider === 'none') {
    return fallbackCaption(topic, platform);
  }

  const system = `You write social media posts for ${config.brand.name}.
Audience: ${config.brand.audience}.
Tone: ${config.brand.tone}.
Rules: never invent statistics, never claim credentials, no corporate buzzwords, no engagement bait.`;

  const user = `Topic: ${topic}

Platform guidance:
${PLATFORM_GUIDE[platform]}
${instructions ? `\nExtra instructions from the user (follow these exactly):\n${instructions}\n` : ''}
Return ONLY the final post text. No preamble, no markdown fences, no explanations.`;

  try {
    const text = await chatByProvider(system, user);
    if (text) return text;
  } catch (error) {
    console.warn('[composer] LLM failed, using fallback:', error instanceof Error ? error.message : error);
  }
  return fallbackCaption(topic, platform);
}

async function chatByProvider(system: string, user: string): Promise<string> {
  switch (config.llm.provider) {
    case 'openai':
      return openaiChat(system, user);
    case 'gemini':
      return geminiChat(system, user);
    case 'groq':
      return groqChat(system, user);
    case 'cloudflare':
      return cloudflareChat(system, user);
    case 'pollinations':
      return pollinationsChat(system, user);
    default:
      return '';
  }
}

async function cloudflareChat(system: string, user: string): Promise<string> {
  const url = `${config.llm.cloudflareBaseUrl}/accounts/${config.llm.cloudflareAccountId}/ai/run/${config.llm.cloudflareTextModel}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      authorization: `Bearer ${config.llm.cloudflareApiToken}`,
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: user },
      ],
      temperature: 0.8,
      max_tokens: 1024,
    }),
  });
  if (!res.ok) throw new Error(`Cloudflare AI ${res.status} ${await res.text()}`);

  const data = (await res.json()) as {
    success?: boolean;
    errors?: Array<{ message?: string }>;
    result?: { response?: string };
  };
  if (data.success === false) {
    throw new Error(`Cloudflare AI error: ${data.errors?.[0]?.message ?? 'unknown'}`);
  }
  return data.result?.response?.trim() ?? '';
}

async function geminiChat(system: string, user: string): Promise<string> {
  const url = `${config.llm.geminiBaseUrl}/models/${config.llm.geminiModel}:generateContent?key=${config.llm.geminiApiKey}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: system }] },
      contents: [{ role: 'user', parts: [{ text: user }] }],
      generationConfig: { temperature: 0.8, maxOutputTokens: 2048 },
    }),
  });
  if (!res.ok) throw new Error(`Gemini request failed: ${res.status} ${await res.text()}`);

  const data = (await res.json()) as {
    candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
  };
  const parts = data.candidates?.[0]?.content?.parts ?? [];
  return parts
    .map((p) => p.text ?? '')
    .join('')
    .trim();
}

async function groqChat(system: string, user: string): Promise<string> {
  const res = await fetch(`${config.llm.groqBaseUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${config.llm.groqApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: config.llm.groqModel,
      temperature: 0.8,
      max_tokens: 800,
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: user },
      ],
    }),
  });
  if (!res.ok) throw new Error(`Groq request failed: ${res.status} ${await res.text()}`);
  const data = (await res.json()) as { choices: Array<{ message: { content: string } }> };
  return data.choices[0]?.message.content?.trim() ?? '';
}

async function openaiChat(system: string, user: string): Promise<string> {
  const res = await fetch(`${config.llm.baseUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${config.llm.apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: config.llm.model,
      temperature: 0.8,
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: user },
      ],
    }),
  });
  if (!res.ok) throw new Error(`LLM request failed: ${res.status} ${await res.text()}`);
  const data = (await res.json()) as { choices: Array<{ message: { content: string } }> };
  return data.choices[0]?.message.content?.trim() ?? '';
}

async function pollinationsChat(system: string, user: string, attempts = 3): Promise<string> {
  for (let i = 0; i < attempts; i++) {
    const res = await fetch(`${config.llm.pollinationsTextUrl}/openai`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: config.llm.pollinationsModel,
        messages: [
          { role: 'system', content: system },
          { role: 'user', content: user },
        ],
      }),
    });
    if (res.ok) {
      const data = (await res.json()) as { choices?: Array<{ message?: { content?: string } }> };
      return data.choices?.[0]?.message?.content?.trim() ?? '';
    }
    if (res.status === 402 || res.status === 429) {
      const body = await res.text();
      const match = /retry after (\d+)s/i.exec(body);
      const waitMs = match?.[1] ? Number(match[1]) * 1000 + 2000 : 48_000;
      console.warn(`[composer] rate limited, waiting ${Math.round(waitMs / 1000)}s`);
      await new Promise((r) => setTimeout(r, Math.min(waitMs, 70_000)));
      continue;
    }
    throw new Error(`Pollinations text failed: ${res.status} ${await res.text()}`);
  }
  throw new Error('Pollinations text rate limit not cleared');
}

export async function composeImagePrompt(topic: string, caption: string): Promise<string> {
  const system = `You output 2-4 plain English search keywords describing a concrete photograph that fits a social media post.
Rules: only common nouns and adjectives separated by spaces. No sentences, no punctuation, no quotes, no camera or style words.
Good: "developer laptop desk". Bad: "A developer working late at night with a warm lamp".`;

  const user = `Topic: ${topic}
Excerpt: ${caption.slice(0, 200)}

Keywords:`;

  try {
    const text = await chatByProvider(system, user);
    const cleaned = text
      .replace(/^["'`]|["'`]$/g, '')
      .replace(/[^\p{L}\p{N}\s]/gu, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .split(' ')
      .filter((w) => w.length > 2)
      .slice(0, 4)
      .join(' ');
    if (cleaned.length > 3) {
      return cleaned;
    }
  } catch (error) {
    console.warn('[composer] image prompt failed:', error instanceof Error ? error.message : error);
  }
  return 'workspace laptop desk';
}

function fallbackCaption(topic: string, platform: Platform): string {
  const base = `${topic}\n\nWhat's your take?`;
  return platform === 'instagram'
    ? `${base}\n\n#buildinpublic #software #startup #engineering`
    : base;
}
