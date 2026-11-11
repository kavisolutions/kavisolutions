import { config } from '../config.js';

const API = `https://api.telegram.org/bot${config.telegram.botToken}`;

export function telegramConfigured(): boolean {
  return Boolean(config.telegram.botToken && config.telegram.chatId);
}

type InlineButton = { text: string; callback_data: string };

export async function sendApprovalMessage(
  postId: number,
  caption: string,
  imageUrl: string | null,
  targets: string[],
): Promise<number | null> {
  if (!telegramConfigured()) return null;

  const keyboard = {
    inline_keyboard: [
      [
        { text: 'Approve', callback_data: `approve:${postId}` },
        { text: 'Reject', callback_data: `reject:${postId}` },
      ] as InlineButton[],
      [{ text: 'Regenerate', callback_data: `regen:${postId}` }] as InlineButton[],
    ],
  };
  const text = `Draft #${postId}\nTargets: ${targets.join(', ')}\n\n${caption}`;

  let res: Response;
  if (imageUrl) {
    res = await fetch(`${API}/sendPhoto`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: config.telegram.chatId,
        photo: imageUrl,
        caption: text.slice(0, 1024),
        reply_markup: keyboard,
      }),
    });
  } else {
    res = await fetch(`${API}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: config.telegram.chatId,
        text: text.slice(0, 4096),
        reply_markup: keyboard,
      }),
    });
  }

  if (!res.ok) return null;
  const data = (await res.json()) as { result?: { message_id: number } };
  return data.result?.message_id ?? null;
}

export async function editMessageReplyMarkup(
  messageId: number,
  statusText: string,
): Promise<void> {
  if (!telegramConfigured()) return;
  await fetch(`${API}/editMessageReplyMarkup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: config.telegram.chatId,
      message_id: messageId,
      reply_markup: { inline_keyboard: [] },
    }),
  });
  await fetch(`${API}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: config.telegram.chatId, text: statusText }),
  });
}

export async function answerCallbackQuery(id: string, text: string): Promise<void> {
  await fetch(`${API}/answerCallbackQuery`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ callback_query_id: id, text }),
  });
}

export async function notify(text: string): Promise<void> {
  if (!telegramConfigured()) return;
  await fetch(`${API}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: config.telegram.chatId, text: text.slice(0, 4096) }),
  });
}
