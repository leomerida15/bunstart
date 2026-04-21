/**
 * Build script for the CLI package using @bunstart/pack.
 *
 * Usage:
 *   bun run bunstart.build.ts
 *   bun run build
 */
import { cpSync, existsSync, mkdirSync } from 'node:fs';
import { buildSetting } from '@bunstart/pack';

const outdir = 'dist';

async function build(): Promise<void> {
	console.log('🔨 Building CLI with @bunstart/pack...\n');

	// Build using pack
	const { build } = buildSetting({
		entrypoints: ['./src/index.ts'],
		outdir,
		target: 'bun',
		format: 'esm',
		minify: true,
		sourcemap: false,
	});

	await build();

	// Add shebang to the output file
	const outputFile = `${outdir}/index.js`;
	const file = Bun.file(outputFile);
	const content = await file.text();

	const contentWithShebang = content.startsWith('#!')
		? content
		: `#!/usr/bin/env bun\n${content}`;

	await Bun.write(outputFile, contentWithShebang);

	// Copy templates to dist for runtime resolution
	const templatesSrc = 'src/utils/template';
	const templatesDest = `${outdir}/utils/template`;
	if (!existsSync(templatesDest)) {
		mkdirSync(templatesDest, { recursive: true });
	}
	cpSync(templatesSrc, templatesDest, { recursive: true });

	console.log('✅ CLI build completed');
}

// Run if main
const isMain =
	process.argv[1]?.endsWith('bunstart.build.ts') ||
	process.argv[1]?.endsWith('bunstart.build.js');

if (isMain) {
	build().catch((e) => {
		console.error('❌ Build failed:', e);
		process.exit(1);
	});
}
