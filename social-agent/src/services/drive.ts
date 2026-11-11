import { createSign } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { config } from '../config.js';

const DRIVE_API = 'https://www.googleapis.com/drive/v3';
const TOKEN_URL = 'https://oauth2.googleapis.com/token';
const MAX_FILE_BYTES = 40 * 1024 * 1024;

export type DriveImage = {
  id: string;
  name: string;
  mimeType: string;
  size: number | null;
  modifiedTime: string | null;
};

type ServiceAccount = {
  client_email: string;
  private_key: string;
};

type DriveFile = {
  id: string;
  name: string;
  mimeType: string;
  size?: string;
  modifiedTime?: string;
};

let cachedToken: { value: string; expiresAt: number } | null = null;

export function driveConfigured(): boolean {
  try {
    return Boolean(loadServiceAccount() || config.drive.apiKey);
  } catch {
    return false;
  }
}

/* Accepts a full Drive folder URL, a URL with ?id=, or the bare folder ID. */
export function parseDriveFolderId(input: string): string | null {
  const value = input.trim();
  if (!value) return null;

  const folders = /\/folders\/([a-zA-Z0-9_-]{10,})/.exec(value);
  if (folders?.[1]) return folders[1];

  const query = /[?&]id=([a-zA-Z0-9_-]{10,})/.exec(value);
  if (query?.[1]) return query[1];

  if (/^[a-zA-Z0-9_-]{10,}$/.test(value)) return value;
  return null;
}

function loadServiceAccount(): ServiceAccount | null {
  const rawJson = config.drive.serviceAccountJson.trim();
  if (rawJson) {
    try {
      const parsed = JSON.parse(rawJson) as Partial<ServiceAccount>;
      if (parsed.client_email && parsed.private_key) {
        return { client_email: parsed.client_email, private_key: parsed.private_key };
      }
    } catch {
      throw new Error('GOOGLE_SERVICE_ACCOUNT_JSON is not valid JSON');
    }
  }

  const file = config.drive.serviceAccountFile.trim();
  if (file) {
    try {
      const parsed = JSON.parse(readFileSync(file, 'utf8')) as Partial<ServiceAccount>;
      if (parsed.client_email && parsed.private_key) {
        return { client_email: parsed.client_email, private_key: parsed.private_key };
      }
      throw new Error('file is missing client_email/private_key');
    } catch (error) {
      throw new Error(
        `Could not read GOOGLE_SERVICE_ACCOUNT_FILE: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
    }
  }

  let privateKey = config.drive.privateKey;
  if (!privateKey && config.drive.privateKeyBase64) {
    privateKey = Buffer.from(config.drive.privateKeyBase64, 'base64').toString('utf8');
  }
  privateKey = privateKey.replace(/\\n/g, '\n').trim();

  if (config.drive.serviceAccountEmail && privateKey) {
    return { client_email: config.drive.serviceAccountEmail, private_key: privateKey };
  }
  return null;
}

async function accessToken(): Promise<string | null> {
  const account = loadServiceAccount();
  if (!account) return null;

  if (cachedToken && cachedToken.expiresAt > Date.now() + 60_000) {
    return cachedToken.value;
  }

  const now = Math.floor(Date.now() / 1000);
  const header = base64Url(JSON.stringify({ alg: 'RS256', typ: 'JWT' }));
  const claims = base64Url(
    JSON.stringify({
      iss: account.client_email,
      scope: 'https://www.googleapis.com/auth/drive.readonly',
      aud: TOKEN_URL,
      iat: now,
      exp: now + 3600,
    }),
  );

  const signer = createSign('RSA-SHA256');
  signer.update(`${header}.${claims}`);
  const signature = signer.sign(account.private_key).toString('base64url');
  const assertion = `${header}.${claims}.${signature}`;

  const res = await fetch(TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion,
    }),
  });

  if (!res.ok) {
    throw new Error(
      `Google service-account auth failed: ${res.status} ${await res.text()}`.slice(0, 600),
    );
  }

  const data = (await res.json()) as { access_token?: string; expires_in?: number };
  if (!data.access_token) throw new Error('Google returned no access token');

  cachedToken = {
    value: data.access_token,
    expiresAt: Date.now() + (data.expires_in ?? 3600) * 1000,
  };
  return cachedToken.value;
}

async function driveFetch(path: string, params: URLSearchParams): Promise<Response> {
  const token = await accessToken();
  if (token) {
    return fetch(`${DRIVE_API}${path}?${params.toString()}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
  }

  if (!config.drive.apiKey) {
    throw new Error(
      'Google Drive is not configured. Set GOOGLE_SERVICE_ACCOUNT_FILE (or GOOGLE_API_KEY for a link-shared folder).',
    );
  }
  params.set('key', config.drive.apiKey);
  return fetch(`${DRIVE_API}${path}?${params.toString()}`);
}

async function listFolder(folderId: string, pageToken?: string): Promise<{
  files: DriveFile[];
  nextPageToken?: string;
}> {
  const params = new URLSearchParams({
    q: `'${folderId}' in parents and trashed = false`,
    fields: 'nextPageToken,files(id,name,mimeType,size,modifiedTime)',
    pageSize: '1000',
    supportsAllDrives: 'true',
    includeItemsFromAllDrives: 'true',
  });
  if (pageToken) params.set('pageToken', pageToken);

  const res = await driveFetch('/files', params);
  if (!res.ok) {
    throw new Error(
      `Drive list failed: ${res.status} ${await res.text()}`.slice(0, 800),
    );
  }
  return (await res.json()) as { files: DriveFile[]; nextPageToken?: string };
}

/* Walk the folder tree. Year folders are usually flat, but a few subfolders
   (months, events) are common, so recurse a few levels and ignore the rest. */
async function walkFolder(
  folderId: string,
  depth: number,
  images: DriveImage[],
): Promise<void> {
  let pageToken: string | undefined;
  const folders: string[] = [];

  do {
    const page = await listFolder(folderId, pageToken);
    for (const file of page.files) {
      if (file.mimeType === 'application/vnd.google-apps.folder') {
        if (depth < 4) folders.push(file.id);
        continue;
      }
      if (!file.mimeType.startsWith('image/')) continue;
      images.push({
        id: file.id,
        name: file.name,
        mimeType: file.mimeType,
        size: file.size ? Number(file.size) : null,
        modifiedTime: file.modifiedTime ?? null,
      });
    }
    pageToken = page.nextPageToken;
  } while (pageToken);

  for (const child of folders) {
    await walkFolder(child, depth + 1, images);
  }
}

export async function listDriveImages(folderInput: string): Promise<DriveImage[]> {
  const folderId = parseDriveFolderId(folderInput);
  if (!folderId) {
    throw new Error('That does not look like a Google Drive folder link or ID');
  }

  const images: DriveImage[] = [];
  await walkFolder(folderId, 0, images);
  return images;
}

export async function downloadDriveImage(file: DriveImage): Promise<Buffer> {
  if (file.size && file.size > MAX_FILE_BYTES) {
    throw new Error(`${file.name} is larger than ${MAX_FILE_BYTES / 1024 / 1024}MB`);
  }

  const params = new URLSearchParams({ alt: 'media', supportsAllDrives: 'true' });
  const res = await driveFetch(`/files/${encodeURIComponent(file.id)}`, params);
  if (!res.ok) {
    throw new Error(
      `Drive download failed for ${file.name}: ${res.status} ${await res.text()}`.slice(0, 500),
    );
  }

  const buffer = Buffer.from(await res.arrayBuffer());
  if (buffer.byteLength > MAX_FILE_BYTES) {
    throw new Error(`${file.name} is larger than ${MAX_FILE_BYTES / 1024 / 1024}MB`);
  }
  return buffer;
}

function base64Url(value: string): string {
  return Buffer.from(value, 'utf8').toString('base64url');
}
