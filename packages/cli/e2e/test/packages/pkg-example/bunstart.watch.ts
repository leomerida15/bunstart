import { watch } from 'node:fs';
import { resolve } from 'node:path';
import { build } from './bunstart.build';

async function main(): Promise<void> {
  console.log('Initial build...');
  await build();

  const watchPath = resolve(process.cwd(), 'src');
  console.log(`Watching ${watchPath}...`);

  let timeout: ReturnType<typeof setTimeout> | null = null;

  const watcher = watch(watchPath, { recursive: true }, async (eventType, filename) => {
    if (eventType !== 'change') return;
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(async () => {
      console.log(`Change detected in ${filename ?? watchPath}`);
      try {
        await build();
      } catch {
        // build logs error
      }
    }, 100);
  });

  process.on('SIGINT', () => {
    watcher.close();
    if (timeout) clearTimeout(timeout);
    process.exit(0);
  });
}

main().catch((e) => {
  console.error('Fatal error:', e);
  process.exit(1);
});
