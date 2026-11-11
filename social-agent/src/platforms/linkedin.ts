import { callbackUrl, config } from '../config.js';
import { getAccount, saveAccount, type StoredAccount } from '../db.js';

const AUTH_URL = 'https://www.linkedin.com/oauth/v2/authorization';
const TOKEN_URL = 'https://www.linkedin.com/oauth/v2/accessToken';
const USERINFO_URL = 'https://api.linkedin.com/v2/userinfo';
const POSTS_URL = 'https://api.linkedin.com/rest/posts';

export function linkedinAuthUrl(state: string): string {
  const params = new URLSearchParams({
    response_type: 'code',
    client_id: config.linkedin.clientId,
    redirect_uri: callbackUrl('linkedin'),
    state,
    scope: config.linkedin.scopes.join(' '),
  });
  return `${AUTH_URL}?${params.toString()}`;
}

type TokenResponse = {
  access_token: string;
  expires_in: number;
  refresh_token?: string;
  refresh_token_expires_in?: number;
};

export async function linkedinExchangeCode(code: string): Promise<StoredAccount> {
  const body = new URLSearchParams({
    grant_type: 'authorization_code',
    code,
    client_id: config.linkedin.clientId,
    client_secret: config.linkedin.clientSecret,
    redirect_uri: callbackUrl('linkedin'),
  });

  const tokenRes = await fetch(TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  });
  if (!tokenRes.ok) {
    throw new Error(`LinkedIn token exchange failed: ${tokenRes.status} ${await tokenRes.text()}`);
  }
  const token = (await tokenRes.json()) as TokenResponse;

  const profileRes = await fetch(USERINFO_URL, {
    headers: { Authorization: `Bearer ${token.access_token}` },
  });
  if (!profileRes.ok) {
    throw new Error(`LinkedIn userinfo failed: ${profileRes.status} ${await profileRes.text()}`);
  }
  const profile = (await profileRes.json()) as { sub: string; name?: string };

  const account: StoredAccount = {
    platform: 'linkedin',
    accessToken: token.access_token,
    refreshToken: token.refresh_token ?? null,
    expiresAt: Date.now() + token.expires_in * 1000,
    accountId: `urn:li:person:${profile.sub}`,
    accountName: profile.name ?? null,
    extra: {},
  };
  saveAccount(account);
  return account;
}

export async function linkedinPublish(
  caption: string,
  imageUrl: string | null,
): Promise<{ externalId: string }> {
  const account = getAccount('linkedin');
  if (!account) throw new Error('LinkedIn account not connected. Visit /auth/linkedin');
  if (account.expiresAt < Date.now() + 60_000) {
    throw new Error('LinkedIn token expired or expiring. Re-authorize at /auth/linkedin');
  }

  const body: Record<string, unknown> = {
    author: account.accountId,
    commentary: caption,
    visibility: 'PUBLIC',
    distribution: {
      feedDistribution: 'MAIN_FEED',
      targetEntities: [],
      thirdPartyDistributionChannels: [],
    },
    lifecycleState: 'PUBLISHED',
    isReshareDisabledByAuthor: false,
  };

  if (imageUrl) {
    const imageUrn = await linkedinUploadImage(account, imageUrl);
    body.content = { media: { id: imageUrn, altText: 'Post image' } };
  }

  const res = await fetch(POSTS_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${account.accessToken}`,
      'Content-Type': 'application/json',
      'LinkedIn-Version': config.linkedin.version,
      'X-Restli-Protocol-Version': '2.0.0',
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    throw new Error(`LinkedIn publish failed: ${res.status} ${await res.text()}`);
  }

  return { externalId: res.headers.get('x-restli-id') ?? 'unknown' };
}

async function linkedinUploadImage(account: StoredAccount, imageUrl: string): Promise<string> {
  const initRes = await fetch('https://api.linkedin.com/rest/images?action=initializeUpload', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${account.accessToken}`,
      'Content-Type': 'application/json',
      'LinkedIn-Version': config.linkedin.version,
    },
    body: JSON.stringify({
      initializeUploadRequest: { owner: account.accountId },
    }),
  });
  if (!initRes.ok) {
    throw new Error(`LinkedIn image init failed: ${initRes.status} ${await initRes.text()}`);
  }
  const init = (await initRes.json()) as {
    value: { uploadUrl: string; image: string };
  };

  const imageRes = await fetch(imageUrl);
  if (!imageRes.ok) throw new Error(`Fetch local image failed: ${imageRes.status}`);
  const imageBuffer = Buffer.from(await imageRes.arrayBuffer());

  const uploadRes = await fetch(init.value.uploadUrl, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${account.accessToken}`,
      'Content-Type': 'application/octet-stream',
    },
    body: imageBuffer,
  });
  if (!uploadRes.ok) {
    throw new Error(`LinkedIn image upload failed: ${uploadRes.status} ${await uploadRes.text()}`);
  }
  return init.value.image;
}
