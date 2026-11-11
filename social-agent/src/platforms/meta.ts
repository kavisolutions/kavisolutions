import { callbackUrl, config } from '../config.js';
import { getAccount, saveAccount, type Platform, type StoredAccount } from '../db.js';

const GRAPH = `https://graph.facebook.com/${config.meta.graphVersion}`;

export function metaAuthUrl(state: string): string {
  const params = new URLSearchParams({
    client_id: config.meta.appId,
    redirect_uri: callbackUrl('meta'),
    state,
    response_type: 'code',
    scope: config.meta.scopes.join(','),
  });
  return `https://www.facebook.com/${config.meta.graphVersion}/dialog/oauth?${params.toString()}`;
}

type FbPage = { id: string; name: string; access_token: string };
type IgAccount = { id: string; username?: string };

export async function metaExchangeCode(code: string): Promise<void> {
  const tokenParams = new URLSearchParams({
    client_id: config.meta.appId,
    client_secret: config.meta.appSecret,
    redirect_uri: callbackUrl('meta'),
    code,
  });
  const tokenRes = await fetch(`${GRAPH}/oauth/access_token?${tokenParams.toString()}`);
  if (!tokenRes.ok) {
    throw new Error(`Meta token exchange failed: ${tokenRes.status} ${await tokenRes.text()}`);
  }
  const shortToken = (await tokenRes.json()) as { access_token: string; expires_in?: number };

  const longParams = new URLSearchParams({
    grant_type: 'fb_exchange_token',
    client_id: config.meta.appId,
    client_secret: config.meta.appSecret,
    fb_exchange_token: shortToken.access_token,
  });
  const longRes = await fetch(`${GRAPH}/oauth/access_token?${longParams.toString()}`);
  if (!longRes.ok) {
    throw new Error(`Meta long-lived token failed: ${longRes.status} ${await longRes.text()}`);
  }
  const longToken = (await longRes.json()) as { access_token: string; expires_in?: number };

  const pagesRes = await fetch(
    `${GRAPH}/me/accounts?fields=id,name,access_token,instagram_business_account{id,username}&access_token=${longToken.access_token}`,
  );
  if (!pagesRes.ok) {
    throw new Error(`Meta pages fetch failed: ${pagesRes.status} ${await pagesRes.text()}`);
  }
  const pages = (await pagesRes.json()) as {
    data: Array<FbPage & { instagram_business_account?: IgAccount }>;
  };

  const first = pages.data[0];
  if (!first) throw new Error('No Facebook Page found for this account');

  const pageExpiry = longToken.expires_in
    ? Date.now() + longToken.expires_in * 1000
    : Date.now() + 60 * 24 * 60 * 60 * 1000;

  const fbAccount: StoredAccount = {
    platform: 'facebook',
    accessToken: first.access_token,
    refreshToken: longToken.access_token,
    expiresAt: pageExpiry,
    accountId: first.id,
    accountName: first.name,
    extra: {},
  };
  saveAccount(fbAccount);

  const ig = first.instagram_business_account;
  if (ig?.id) {
    const igAccount: StoredAccount = {
      platform: 'instagram',
      accessToken: first.access_token,
      refreshToken: longToken.access_token,
      expiresAt: pageExpiry,
      accountId: ig.id,
      accountName: ig.username ?? null,
      extra: { pageId: first.id },
    };
    saveAccount(igAccount);
  }
}

export async function facebookPublish(
  caption: string,
  imageUrl: string | null,
): Promise<{ externalId: string }> {
  const account = getAccount('facebook');
  if (!account) throw new Error('Facebook page not connected. Visit /auth/meta');

  const url = imageUrl
    ? `${GRAPH}/${account.accountId}/photos`
    : `${GRAPH}/${account.accountId}/feed`;

  const body = new URLSearchParams({ access_token: account.accessToken });
  if (imageUrl) {
    body.set('url', imageUrl);
    body.set('caption', caption);
  } else {
    body.set('message', caption);
  }

  const res = await fetch(url, { method: 'POST', body });
  if (!res.ok) {
    throw new Error(`Facebook publish failed: ${res.status} ${await res.text()}`);
  }
  const data = (await res.json()) as { id?: string; post_id?: string };
  return { externalId: data.post_id ?? data.id ?? 'unknown' };
}

export async function instagramPublish(
  caption: string,
  imageUrl: string | null,
): Promise<{ externalId: string }> {
  const account = getAccount('instagram');
  if (!account) throw new Error('Instagram account not connected. Visit /auth/meta');
  if (!imageUrl) throw new Error('Instagram requires a public image URL');

  const containerBody = new URLSearchParams({
    image_url: imageUrl,
    caption,
    access_token: account.accessToken,
  });
  const containerRes = await fetch(`${GRAPH}/${account.accountId}/media`, {
    method: 'POST',
    body: containerBody,
  });
  if (!containerRes.ok) {
    throw new Error(`Instagram container failed: ${containerRes.status} ${await containerRes.text()}`);
  }
  const container = (await containerRes.json()) as { id: string };

  await waitForContainerReady(account.accountId, container.id, account.accessToken);

  const publishBody = new URLSearchParams({
    creation_id: container.id,
    access_token: account.accessToken,
  });
  const publishRes = await fetch(`${GRAPH}/${account.accountId}/media_publish`, {
    method: 'POST',
    body: publishBody,
  });
  if (!publishRes.ok) {
    throw new Error(
      `Instagram publish failed: ${publishRes.status} ${await publishRes.text()}`,
    );
  }
  const published = (await publishRes.json()) as { id: string };
  return { externalId: published.id };
}

async function waitForContainerReady(
  igUserId: string,
  containerId: string,
  token: string,
  attempts = 20,
): Promise<void> {
  for (let i = 0; i < attempts; i++) {
    const res = await fetch(
      `${GRAPH}/${containerId}?fields=status_code&access_token=${token}`,
    );
    if (res.ok) {
      const data = (await res.json()) as { status_code?: string };
      if (data.status_code === 'FINISHED') return;
      if (data.status_code === 'ERROR') throw new Error('Instagram media container errored');
    }
    await new Promise((r) => setTimeout(r, 3000));
  }
  throw new Error('Instagram media container not ready in time');
}

export async function refreshMetaToken(): Promise<void> {
  const account = getAccount('facebook');
  if (!account?.refreshToken) return;

  const params = new URLSearchParams({
    grant_type: 'fb_exchange_token',
    client_id: config.meta.appId,
    client_secret: config.meta.appSecret,
    fb_exchange_token: account.refreshToken,
  });
  const res = await fetch(`${GRAPH}/oauth/access_token?${params.toString()}`);
  if (!res.ok) return;
  const data = (await res.json()) as { access_token: string; expires_in?: number };
  const expiresAt = Date.now() + (data.expires_in ?? 60 * 24 * 60 * 60) * 1000;

  for (const platform of ['facebook', 'instagram'] as Platform[]) {
    const existing = getAccount(platform);
    if (!existing) continue;
    saveAccount({ ...existing, refreshToken: data.access_token, expiresAt });
  }
}
