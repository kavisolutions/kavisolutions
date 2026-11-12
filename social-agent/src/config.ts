import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

function loadDotEnv(path = '.env'): void {
  let raw: string;
  try {
    raw = readFileSync(path, 'utf8');
  } catch {
    return;
  }
  for (const line of raw.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (!(key in process.env)) process.env[key] = value;
  }
}

loadDotEnv();

function required(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required env var: ${name}`);
  return value;
}

function optional(name: string, fallback = ''): string {
  return process.env[name] ?? fallback;
}

type LlmProvider = 'openai' | 'gemini' | 'groq' | 'cloudflare' | 'pollinations' | 'none';
type ImageProvider =
  | 'openai'
  | 'gemini'
  | 'cloudflare'
  | 'pexels'
  | 'wikimedia'
  | 'pollinations'
  | 'none';
type VisionProvider = 'gemini' | 'openai' | 'cloudflare' | 'none';
export type MediaImageAspect = 'original' | 'portrait' | 'landscape';

function resolveProvider(
  explicit: string,
  openaiKey: string,
  geminiKey: string,
  groqKey: string,
  cfToken: string,
): LlmProvider {
  const value = explicit.trim();
  if (
    value === 'openai' ||
    value === 'gemini' ||
    value === 'groq' ||
    value === 'cloudflare' ||
    value === 'pollinations' ||
    value === 'none'
  ) {
    return value;
  }
  if (openaiKey) return 'openai';
  if (geminiKey) return 'gemini';
  if (groqKey) return 'groq';
  if (cfToken) return 'cloudflare';
  return 'pollinations';
}

function resolveImageProvider(
  explicit: string,
  openaiKey: string,
  geminiKey: string,
  cfToken: string,
  pexelsKey: string,
): ImageProvider {
  const value = explicit.trim();
  if (
    value === 'openai' ||
    value === 'gemini' ||
    value === 'cloudflare' ||
    value === 'pexels' ||
    value === 'wikimedia' ||
    value === 'pollinations' ||
    value === 'none'
  ) {
    return value;
  }
  if (openaiKey) return 'openai';
  if (geminiKey) return 'gemini';
  if (cfToken) return 'cloudflare';
  if (pexelsKey) return 'pexels';
  return 'pollinations';
}

function resolveVisionProvider(
  explicit: string,
  geminiKey: string,
  openaiKey: string,
  cfToken: string,
): VisionProvider {
  const value = explicit.trim();
  if (value === 'gemini' || value === 'openai' || value === 'cloudflare' || value === 'none') {
    return value;
  }
  if (geminiKey) return 'gemini';
  if (openaiKey) return 'openai';
  if (cfToken) return 'cloudflare';
  return 'none';
}

function resolveAspect(value: string): MediaImageAspect {
  return value === 'portrait' || value === 'landscape' ? value : 'original';
}

export const config = {
  port: Number(optional('PORT', '3000')),
  host: optional('HOST', '0.0.0.0'),
  publicBaseUrl: optional('PUBLIC_BASE_URL', 'http://localhost:3000').replace(/\/$/, ''),
  publicMediaBaseUrl: optional('PUBLIC_MEDIA_BASE_URL', '').replace(/\/$/, ''),
  encryptionKey: required('ENCRYPTION_KEY'),
  databasePath: resolve(optional('DATABASE_PATH', './data/app.db')),
  publicMediaDir: resolve(optional('PUBLIC_MEDIA_DIR', './data/public')),
  adminToken: required('ADMIN_TOKEN'),
  timezone: optional('TZ', 'Asia/Kolkata'),

  scheduler: {
    enabled: optional('ENABLE_SCHEDULER', 'false') === 'true',
    postSchedule: optional('POST_SCHEDULE', '0 9 * * *'),
    topicPool: optional('TOPIC_POOL')
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean),
    targets: optional('PUBLISH_TARGETS', 'linkedin')
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean) as Array<'linkedin' | 'facebook' | 'instagram'>,
  },

  linkedin: {
    clientId: optional('LINKEDIN_CLIENT_ID'),
    clientSecret: optional('LINKEDIN_CLIENT_SECRET'),
    version: optional('LINKEDIN_VERSION', '202501'),
    scopes: ['openid', 'profile', 'w_member_social'],
  },

  meta: {
    appId: optional('META_APP_ID'),
    appSecret: optional('META_APP_SECRET'),
    graphVersion: optional('META_GRAPH_VERSION', 'v21.0'),
    scopes: [
      'pages_show_list',
      'pages_manage_posts',
      'pages_read_engagement',
      'instagram_basic',
      'instagram_content_publish',
      'business_management',
    ],
  },

  media: {
    schedulerEnabled: optional('ENABLE_MEDIA_SCHEDULER', 'false') === 'true',
    schedule: optional('MEDIA_POST_SCHEDULE', '30 8 * * *'),
    catchupDays: Math.max(0, Number(optional('MEDIA_CATCHUP_DAYS', '7')) || 0),
    autoPublish: optional('MEDIA_AUTO_PUBLISH', 'false') === 'true',
    maxPerRun: Math.max(1, Number(optional('MEDIA_MAX_PER_RUN', '1')) || 1),
    aspect: resolveAspect(optional('MEDIA_IMAGE_ASPECT', 'original')),
    visionProvider: resolveVisionProvider(
      optional('VISION_PROVIDER', ''),
      optional('GEMINI_API_KEY'),
      optional('OPENAI_API_KEY'),
      optional('CLOUDFLARE_API_TOKEN'),
    ),
    geminiVisionModel: optional('GEMINI_VISION_MODEL', 'gemini-2.5-flash'),
    openaiVisionModel: optional('OPENAI_VISION_MODEL', 'gpt-4o-mini'),
    cloudflareVisionModel: optional('CLOUDFLARE_VISION_MODEL', '@cf/llava-hf/llava-1.5-7b-hf'),
  },

  drive: {
    /* One of: JSON blob, JSON key file, or email + private key. The API key
       path only works for folders shared as "anyone with the link". */
    serviceAccountJson: optional('GOOGLE_SERVICE_ACCOUNT_JSON'),
    serviceAccountFile: optional('GOOGLE_SERVICE_ACCOUNT_FILE'),
    serviceAccountEmail: optional('GOOGLE_SERVICE_ACCOUNT_EMAIL'),
    privateKey: optional('GOOGLE_PRIVATE_KEY').replace(/\\n/g, '\n'),
    privateKeyBase64: optional('GOOGLE_PRIVATE_KEY_BASE64'),
    apiKey: optional('GOOGLE_API_KEY'),
  },

  telegram: {
    botToken: optional('TELEGRAM_BOT_TOKEN'),
    chatId: optional('TELEGRAM_CHAT_ID'),
  },

  llm: {
    provider: resolveProvider(
      optional('LLM_PROVIDER', ''),
      optional('OPENAI_API_KEY'),
      optional('GEMINI_API_KEY'),
      optional('GROQ_API_KEY'),
      optional('CLOUDFLARE_API_TOKEN'),
    ),
    apiKey: optional('OPENAI_API_KEY'),
    baseUrl: optional('OPENAI_BASE_URL', 'https://api.openai.com/v1').replace(/\/$/, ''),
    model: optional('OPENAI_MODEL', 'gpt-4o-mini'),
    groqApiKey: optional('GROQ_API_KEY'),
    groqBaseUrl: optional('GROQ_BASE_URL', 'https://api.groq.com/openai/v1').replace(/\/$/, ''),
    groqModel: optional('GROQ_MODEL', 'llama-3.3-70b-versatile'),
    geminiApiKey: optional('GEMINI_API_KEY'),
    geminiModel: optional('GEMINI_MODEL', 'gemini-2.5-flash'),
    geminiImageModel: optional('GEMINI_IMAGE_MODEL', 'gemini-2.5-flash-image'),
    geminiBaseUrl: optional('GEMINI_BASE_URL', 'https://generativelanguage.googleapis.com/v1beta').replace(/\/$/, ''),
    imageProvider: resolveImageProvider(
      optional('IMAGE_PROVIDER', ''),
      optional('OPENAI_API_KEY'),
      optional('GEMINI_API_KEY'),
      optional('CLOUDFLARE_API_TOKEN'),
      optional('PEXELS_API_KEY'),
    ),
    imageModel: optional('IMAGE_MODEL', 'gpt-image-1'),
    cloudflareAccountId: optional('CLOUDFLARE_ACCOUNT_ID'),
    cloudflareApiToken: optional('CLOUDFLARE_API_TOKEN'),
    cloudflareImageModel: optional('CLOUDFLARE_IMAGE_MODEL', '@cf/black-forest-labs/flux-1-schnell'),
    cloudflareTextModel: optional('CLOUDFLARE_TEXT_MODEL', '@cf/meta/llama-3.3-70b-instruct-fp8-fast'),
    cloudflareImageSteps: Number(optional('CLOUDFLARE_IMAGE_STEPS', '6')),
    cloudflareBaseUrl: optional(
      'CLOUDFLARE_BASE_URL',
      'https://api.cloudflare.com/client/v4',
    ).replace(/\/$/, ''),
    pexelsApiKey: optional('PEXELS_API_KEY'),
    wikimediaBaseUrl: optional('WIKIMEDIA_BASE_URL', 'https://commons.wikimedia.org/w/api.php'),
    wikimediaUserAgent: optional('WIKIMEDIA_USER_AGENT', 'social-agent/1.0 (contact@example.com)'),
    wikimediaRequireAttribution: optional('WIKIMEDIA_ATTRIBUTION_ONLY', 'true') === 'true',
    pollinationsTextUrl: optional('POLLINATIONS_TEXT_URL', 'https://text.pollinations.ai').replace(/\/$/, ''),
    pollinationsImageUrl: optional('POLLINATIONS_IMAGE_URL', 'https://image.pollinations.ai').replace(/\/$/, ''),
    pollinationsModel: optional('POLLINATIONS_MODEL', 'openai'),
  },

  brand: {
    name: optional('BRAND_NAME', 'My brand'),
    audience: optional('BRAND_AUDIENCE', 'software engineers and startup founders'),
    tone: optional('BRAND_TONE', 'helpful, practical, confident, no hype, no emojis'),
  },
} as const;

export function callbackUrl(platform: string): string {
  return `${config.publicBaseUrl}/auth/${platform}/callback`;
}

export function publicMediaUrl(filename: string): string {
  /* PUBLIC_MEDIA_BASE_URL is the full public base for media (it may include a
     path such as /social-media), so only the filename is appended. */
  const base = config.publicMediaBaseUrl || `${config.publicBaseUrl}/media`;
  return `${base}/${filename}`;
}
