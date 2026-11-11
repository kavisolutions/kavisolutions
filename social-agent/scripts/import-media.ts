/* Bulk import helper for a year of images.

   Usage:
     npm run import:media -- --dir ./drive-export --start 2026-01-01
     npm run import:media -- --drive "https://drive.google.com/drive/folders/..." --start 2026-01-01

   Filename dates (2026-01-01.jpg, 01-01-2026.jpg) win. Files without a date
   are laid out one per day from --start, skipping days already planned. */
import { importLocalFolder, getImportJob, startDriveImport } from '../src/services/media-plan.js';

type Args = {
  dir?: string;
  drive?: string;
  start?: string;
  hint?: string;
};

function parseArgs(argv: string[]): Args {
  const args: Args = {};
  for (let i = 0; i < argv.length; i += 1) {
    const key = argv[i];
    const value = argv[i + 1];
    if (!key?.startsWith('--') || value === undefined) continue;
    const name = key.slice(2);
    if (name === 'dir') args.dir = value;
    if (name === 'drive') args.drive = value;
    if (name === 'start') args.start = value;
    if (name === 'hint') args.hint = value;
    i += 1;
  }
  return args;
}

async function main(): Promise<void> {
  const args = parseArgs(process.argv.slice(2));

  if (args.dir) {
    const report = await importLocalFolder({
      dir: args.dir,
      startDate: args.start,
      topicHint: args.hint,
    });
    console.log(JSON.stringify(report, null, 2));
    return;
  }

  if (args.drive) {
    const job = startDriveImport({
      folderUrl: args.drive,
      startDate: args.start,
      topicHint: args.hint,
    });

    let lastProcessed = -1;
    for (;;) {
      await new Promise((resolve) => setTimeout(resolve, 2000));
      const current = getImportJob(job.id);
      if (!current) throw new Error('Import job disappeared');
      if (current.processed !== lastProcessed) {
        lastProcessed = current.processed;
        console.log(`${current.status}: ${current.processed}/${current.total} - ${current.message}`);
      }
      if (current.status === 'done' || current.status === 'failed') {
        console.log(JSON.stringify(current, null, 2));
        if (current.status === 'failed') process.exitCode = 1;
        return;
      }
    }
  }

  console.error(
    'Nothing to import. Pass --dir <folder> or --drive <folder-url>, optional --start YYYY-MM-DD.',
  );
  process.exitCode = 1;
}

void main();
