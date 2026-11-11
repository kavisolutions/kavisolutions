import cron from 'node-cron';
import { config } from '../config.js';
import { listAccounts } from '../db.js';
import { refreshMetaToken } from '../platforms/meta.js';
import { draftFromPool } from '../services/drafter.js';
import { runDueMedia } from '../services/media-plan.js';
import { notify } from '../services/telegram.js';

export function startScheduler(): void {
  const topicEnabled = config.scheduler.enabled;
  const mediaEnabled = config.media.schedulerEnabled;

  if (!topicEnabled && !mediaEnabled) {
    console.log('[scheduler] disabled (ENABLE_SCHEDULER and ENABLE_MEDIA_SCHEDULER are false)');
    return;
  }

  if (topicEnabled) {
    cron.schedule(
      config.scheduler.postSchedule,
      async () => {
        console.log('[scheduler] creating draft');
        try {
          await draftFromPool();
        } catch (error) {
          console.error('[scheduler] draft failed', error);
          await notify(`Scheduler draft failed: ${error instanceof Error ? error.message : error}`);
        }
      },
      { timezone: config.timezone },
    );
    console.log(
      `[scheduler] daily draft at "${config.scheduler.postSchedule}" (${config.timezone})`,
    );
  }

  if (mediaEnabled) {
    cron.schedule(
      config.media.schedule,
      async () => {
        console.log('[scheduler] media plan run');
        try {
          const result = await runDueMedia();
          if (result.processed > 0) {
            console.log(
              `[scheduler] media drafts: ${result.posts.join(', ')} (missed ${result.missed})`,
            );
          }
        } catch (error) {
          console.error('[scheduler] media plan failed', error);
          await notify(
            `Media plan failed: ${error instanceof Error ? error.message : String(error)}`,
          );
        }
      },
      { timezone: config.timezone },
    );
    console.log(
      `[scheduler] media post at "${config.media.schedule}" (${config.timezone}, ` +
        `autoPublish=${config.media.autoPublish})`,
    );
  }

  cron.schedule('0 3 * * *', async () => {
    console.log('[scheduler] refreshing Meta tokens');
    await refreshMetaToken();
  });

  cron.schedule('0 8 * * *', async () => {
    await checkTokenExpiry();
  });
}

async function checkTokenExpiry(): Promise<void> {
  const rows = listAccounts();
  const soon = rows.filter((r) => r.expiresAt - Date.now() < 7 * 24 * 60 * 60 * 1000);
  if (soon.length === 0) return;
  const lines = soon.map((r) => {
    const days = Math.floor((r.expiresAt - Date.now()) / (24 * 60 * 60 * 1000));
    return `${r.platform}: expires in ${days} day(s) - re-auth needed`;
  });
  await notify(`Token expiry warning:\n${lines.join('\n')}`);
}
