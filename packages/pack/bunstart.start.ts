/**
 * Start script: runs the built server from dist so chunk paths resolve correctly.
 */
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const __dirname = dirname(fileURLToPath(import.meta.url));
const coreDir = resolve(__dirname, 'core');
const result = spawnSync('bun', ['run', 'index.js'], {
  cwd: coreDir,
  stdio: 'inherit',
  shell: false
});
process.exit(result.status ?? 1);
