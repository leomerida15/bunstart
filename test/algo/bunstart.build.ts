#!/usr/bin/env bun
/**
 * Frontend build script — run with Bun: `bun run bunstart.build.ts` or `bun bunstart.build.ts`
 */
import BunPluginTailwind from 'bun-plugin-tailwind';
import { existsSync } from 'node:fs';
import { rm } from 'node:fs/promises';
import path from 'node:path';

const formatFileSize = (bytes: number): string => {
  const units = ['B', 'KB', 'MB', 'GB'];
  let size = bytes;
  let unitIndex = 0;
  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }
  return `${size.toFixed(2)} ${units[unitIndex]}`;
};

export async function build(): Promise<void> {
  console.log('\nBuilding...\n');

  const outdir = path.join(process.cwd(), 'dist');

  if (existsSync(outdir)) {
    console.log(`Cleaning previous build at ${outdir}`);
    await rm(outdir, { recursive: true, force: true });
  }

  const start = performance.now();

  const entrypoints = [...new Bun.Glob('**.html').scanSync('src')]
    .map((a) => path.resolve('src', a))
    .filter((dir) => !dir.includes('node_modules'));

  console.log(`Found ${entrypoints.length} HTML ${entrypoints.length === 1 ? 'file' : 'files'} to process\n`);

  const result = await Bun.build({
    entrypoints,
    outdir,
    plugins: [BunPluginTailwind],
    minify: true,
    target: 'browser',
    sourcemap: 'linked',
    define: {
      'process.env.NODE_ENV': JSON.stringify('production'),
    },
  });

  const end = performance.now();

  const outputTable = result.outputs.map((output) => ({
    File: path.relative(process.cwd(), output.path),
    Type: output.kind,
    Size: formatFileSize(output.size),
  }));

  console.table(outputTable);
  console.log(`\nBuild completed in ${(end - start).toFixed(2)}ms\n`);
}

const isMain =
  process.argv[1]?.endsWith('bunstart.build.ts') ||
  process.argv[1]?.endsWith('bunstart.build.js');
if (isMain) {
  build().catch((e) => {
    console.error('Build failed', e);
    process.exit(1);
  });
}
