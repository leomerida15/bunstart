import { existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import type { MonorepoConfigProps } from '../../domain/entities/MonorepoConfig';
import type { FilesystemPort } from '../../domain/ports/Filesystem.port';
import type { PackageJsonPort } from '../../domain/ports/PackageJson.port';
import type { MonorepoScaffolderPort } from '../../domain/ports/MonorepoScaffolder.port';

const adapterDir = dirname(fileURLToPath(import.meta.url));
const templatesInDist = join(adapterDir, 'utils', 'template', 'monorepo');
const templatesInSrc = join(
	adapterDir,
	'..',
	'..',
	'..',
	'..',
	'utils',
	'template',
	'monorepo'
);
const TEMPLATES_BASE = existsSync(templatesInDist)
	? templatesInDist
	: templatesInSrc;

interface TemplateFile {
	source: string;
	target: string;
}

function interpolate(content: string, alias: string): string {
	return content.replace(/\{\{ALIAS\}\}/g, alias);
}

function interpolateWorkspace(
	content: string,
	alias: string,
	exampleId: string,
	workspaceId: string
): string {
	return interpolate(content, alias).replace(new RegExp(exampleId, 'g'), workspaceId);
}

export interface MonorepoScaffolderAdapterProps {
	filesystem: FilesystemPort;
	packageJson: PackageJsonPort;
}

/**
 * Adapter for scaffolding a monorepo structure from templates.
 *
 * @class MonorepoScaffolderAdapter
 * @implements {MonorepoScaffolderPort}
 */
export class MonorepoScaffolderAdapter implements MonorepoScaffolderPort {
	private readonly filesystem: FilesystemPort;
	private readonly packageJson: PackageJsonPort;

	constructor({ filesystem, packageJson }: MonorepoScaffolderAdapterProps) {
		this.filesystem = filesystem;
		this.packageJson = packageJson;
	}

	public async scaffold(config: MonorepoConfigProps, cwd: string): Promise<void> {
		const alias = config.alias.value;
		const rootPkgPath = join(cwd, 'package.json');

		// 1. Ensure apps/ and packages/ exist
		await this.filesystem.ensureDir(join(cwd, 'apps'));
		await this.filesystem.ensureDir(join(cwd, 'packages'));

		// 2. Patch root package.json (remove module/main, add workspaces)
		const rootPkg = await this.packageJson.read(rootPkgPath);
		const devDeps = (rootPkg.devDependencies as Record<string, string>) ?? {};
		const { module: _m, main: _main, ...rest } = rootPkg as Record<string, unknown>;
		await this.packageJson.write(rootPkgPath, {
			...rest,
			name: config.alias.value,
			workspaces: ['apps/*', 'packages/*'],
			devDependencies: {
				...devDeps,
				'@types/bun': 'latest',
				typescript: '^5'
			}
		});

		// 2b. Delete root index.ts created by bun init
		await this.filesystem.deleteFile(join(cwd, 'index.ts'));

		// 3. Scaffold packages/pkg-example
		const pkgExampleDir = join(cwd, 'packages', config.examplePackageName);
		await this.filesystem.ensureDir(join(pkgExampleDir, 'src'));

		const pkgExampleFiles: TemplateFile[] = [
			{ source: join(TEMPLATES_BASE, 'packages/pkg-example/package.json.template'), target: join(pkgExampleDir, 'package.json') },
			{ source: join(TEMPLATES_BASE, 'packages/pkg-example/src-index.ts.template'), target: join(pkgExampleDir, 'src', 'index.ts') },
			{ source: join(TEMPLATES_BASE, 'packages/pkg-example/bunstart.build.ts.template'), target: join(pkgExampleDir, 'bunstart.build.ts') },
			{ source: join(TEMPLATES_BASE, 'packages/pkg-example/bunstart.watch.ts.template'), target: join(pkgExampleDir, 'bunstart.watch.ts') },
			{ source: join(TEMPLATES_BASE, 'packages/pkg-example/tsconfig.json.template'), target: join(pkgExampleDir, 'tsconfig.json') }
		];

		for (const { source, target } of pkgExampleFiles) {
			const content = await Bun.file(source).text();
			await this.filesystem.writeFile(target, interpolate(content, alias));
		}

		// 4. Scaffold apps/app-example
		const appExampleDir = join(cwd, 'apps', config.exampleAppName);
		await this.filesystem.ensureDir(join(appExampleDir, 'src'));

		const appExampleFiles: TemplateFile[] = [
			{ source: join(TEMPLATES_BASE, 'apps/app-example/package.json.template'), target: join(appExampleDir, 'package.json') },
			{ source: join(TEMPLATES_BASE, 'apps/app-example/src-index.ts.template'), target: join(appExampleDir, 'src', 'index.ts') },
			{ source: join(TEMPLATES_BASE, 'apps/app-example/bunstart.build.ts.template'), target: join(appExampleDir, 'bunstart.build.ts') },
			{ source: join(TEMPLATES_BASE, 'apps/app-example/bunstart.watch.ts.template'), target: join(appExampleDir, 'bunstart.watch.ts') },
			{ source: join(TEMPLATES_BASE, 'apps/app-example/tsconfig.json.template'), target: join(appExampleDir, 'tsconfig.json') }
		];

		for (const { source, target } of appExampleFiles) {
			const content = await Bun.file(source).text();
			await this.filesystem.writeFile(target, interpolate(content, alias));
		}
	}

	public async scaffoldApp(cwd: string, appId: string, scope: string): Promise<void> {
		const appDir = join(cwd, 'apps', appId);
		await this.filesystem.ensureDir(join(appDir, 'src'));

		const templateFiles: TemplateFile[] = [
			{ source: join(TEMPLATES_BASE, 'apps/app-example/package.json.template'), target: join(appDir, 'package.json') },
			{ source: join(TEMPLATES_BASE, 'apps/app-example/src-index.ts.template'), target: join(appDir, 'src', 'index.ts') },
			{ source: join(TEMPLATES_BASE, 'apps/app-example/bunstart.build.ts.template'), target: join(appDir, 'bunstart.build.ts') },
			{ source: join(TEMPLATES_BASE, 'apps/app-example/bunstart.watch.ts.template'), target: join(appDir, 'bunstart.watch.ts') },
			{ source: join(TEMPLATES_BASE, 'apps/app-example/tsconfig.json.template'), target: join(appDir, 'tsconfig.json') }
		];

		for (const { source, target } of templateFiles) {
			const content = await Bun.file(source).text();
			await this.filesystem.writeFile(
				target,
				interpolateWorkspace(content, scope, 'app-example', appId)
			);
		}
	}

	public async scaffoldPackage(cwd: string, pkgId: string, scope: string): Promise<void> {
		const pkgDir = join(cwd, 'packages', pkgId);
		await this.filesystem.ensureDir(join(pkgDir, 'src'));

		const templateFiles: TemplateFile[] = [
			{ source: join(TEMPLATES_BASE, 'packages/pkg-example/package.json.template'), target: join(pkgDir, 'package.json') },
			{ source: join(TEMPLATES_BASE, 'packages/pkg-example/src-index.ts.template'), target: join(pkgDir, 'src', 'index.ts') },
			{ source: join(TEMPLATES_BASE, 'packages/pkg-example/bunstart.build.ts.template'), target: join(pkgDir, 'bunstart.build.ts') },
			{ source: join(TEMPLATES_BASE, 'packages/pkg-example/bunstart.watch.ts.template'), target: join(pkgDir, 'bunstart.watch.ts') },
			{ source: join(TEMPLATES_BASE, 'packages/pkg-example/tsconfig.json.template'), target: join(pkgDir, 'tsconfig.json') }
		];

		for (const { source, target } of templateFiles) {
			const content = await Bun.file(source).text();
			await this.filesystem.writeFile(
				target,
				interpolateWorkspace(content, scope, 'pkg-example', pkgId)
			);
		}
	}
}
