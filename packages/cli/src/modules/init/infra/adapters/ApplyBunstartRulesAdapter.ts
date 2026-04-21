import { existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import type { FilesystemPort } from '../../domain/ports/Filesystem.port';
import type { PackageJsonPort } from '../../domain/ports/PackageJson.port';
import type { ApplyBunstartRulesPort } from '../../domain/ports/ApplyBunstartRules.port';

const adapterDir = dirname(fileURLToPath(import.meta.url));
const templatesInDist = join(adapterDir, 'utils', 'template', 'single-package');
const templatesInSrc = join(
	adapterDir,
	'..',
	'..',
	'..',
	'..',
	'utils',
	'template',
	'single-package'
);
const TEMPLATES_BASE = existsSync(templatesInDist)
	? templatesInDist
	: templatesInSrc;

export interface ApplyBunstartRulesAdapterProps {
	filesystem: FilesystemPort;
	packageJson: PackageJsonPort;
}

/**
 * Adapter that applies bunstart rules to a single-package project:
 * move entry to src/, add bunstart.build.ts and bunstart.watch.ts, patch package.json.
 *
 * @class ApplyBunstartRulesAdapter
 * @implements {ApplyBunstartRulesPort}
 */
export class ApplyBunstartRulesAdapter implements ApplyBunstartRulesPort {
	private readonly filesystem: FilesystemPort;
	private readonly packageJson: PackageJsonPort;

	constructor({ filesystem, packageJson }: ApplyBunstartRulesAdapterProps) {
		this.filesystem = filesystem;
		this.packageJson = packageJson;
	}

	public async execute(
		cwd: string,
		options?: {
			entryExt?: 'ts' | 'tsx';
			projectName?: string;
			projectType?: 'backend' | 'frontend';
			startCommand?: string;
		}
	): Promise<void> {
		const entryExt = options?.entryExt ?? 'ts';
		const entryPoint = entryExt === 'tsx' ? 'src/index.tsx' : 'src/index.ts';

		await this.moveEntryToSrc(cwd);
		await this.writeTemplates(cwd, entryPoint, options);
		await this.patchPackageJson(cwd, options);
	}

	private async moveEntryToSrc(cwd: string): Promise<void> {
		await this.filesystem.ensureDir(join(cwd, 'src'));

		const rootIndexTs = join(cwd, 'index.ts');
		const rootIndexTsx = join(cwd, 'index.tsx');
		const srcIndexTs = join(cwd, 'src', 'index.ts');
		const srcIndexTsx = join(cwd, 'src', 'index.tsx');

		if (!existsSync(srcIndexTs) && existsSync(rootIndexTs)) {
			const content = await Bun.file(rootIndexTs).text();
			await this.filesystem.writeFile(srcIndexTs, content);
			await this.filesystem.deleteFile(rootIndexTs);
		}
		if (!existsSync(srcIndexTsx) && existsSync(rootIndexTsx)) {
			const content = await Bun.file(rootIndexTsx).text();
			await this.filesystem.writeFile(srcIndexTsx, content);
			await this.filesystem.deleteFile(rootIndexTsx);
		}
	}

	private async writeTemplates(
		cwd: string,
		entryPoint: string,
		options?: { projectType?: 'backend' | 'frontend'; startCommand?: string }
	): Promise<void> {
		const watchSource = join(TEMPLATES_BASE, 'bunstart.watch.ts.template');
		const startSource = join(TEMPLATES_BASE, 'bunstart.start.ts.template');

		if (options?.projectType === 'frontend') {
			const buildSource = join(
				TEMPLATES_BASE,
				'bunstart.build.frontend.ts.template'
			);
			const buildContent = await Bun.file(buildSource).text();
			await this.filesystem.writeFile(
				join(cwd, 'bunstart.build.ts'),
				buildContent
			);
			const watchSource = join(
				TEMPLATES_BASE,
				'bunstart.watch.frontend.ts.template'
			);
			const watchContent = await Bun.file(watchSource).text();
			await this.filesystem.writeFile(
				join(cwd, 'bunstart.watch.ts'),
				watchContent
			);
		} else {
			const buildSource = join(TEMPLATES_BASE, 'bunstart.build.ts.template');
			const buildContent = (await Bun.file(buildSource).text()).replace(
				/\{\{ENTRYPOINT\}\}/g,
				entryPoint
			);
			await this.filesystem.writeFile(
				join(cwd, 'bunstart.build.ts'),
				buildContent
			);
			const watchContent = await Bun.file(watchSource).text();
			await this.filesystem.writeFile(
				join(cwd, 'bunstart.watch.ts'),
				watchContent
			);
		}

		if (options?.startCommand === undefined) {
			const startContent = await Bun.file(startSource).text();
			await this.filesystem.writeFile(
				join(cwd, 'bunstart.start.ts'),
				startContent
			);
		}
	}

	private async patchPackageJson(
		cwd: string,
		options?: {
			projectName?: string;
			projectType?: 'backend' | 'frontend';
			startCommand?: string;
			isMonorepoWorkspace?: boolean;
		}
	): Promise<void> {
		const pkgPath = join(cwd, 'package.json');
		const startScript =
			options?.startCommand ?? 'bun src/index.ts';
		const current = await this.packageJson.read(pkgPath);
		const existingDeps = (current.dependencies as Record<string, string>) ?? {};
		const existingDevDeps = (current.devDependencies as Record<string, string>) ?? {};
		
		const patch: Record<string, unknown> = {
			scripts: {
				build: 'bun run -b bunstart.build.ts',
				watch: 'bun run -b bunstart.watch.ts',
				dev: 'bun run watch',
				start: startScript
			},
			module: 'dist/index.js',
			main: 'dist/index.js',
			types: 'dist/index.d.ts',
			dependencies: {
				...existingDeps,
				'@bunstart/pack': options?.isMonorepoWorkspace ? 'workspace:*' : '^0.0.1'
			}
		};
		if (options?.projectName !== undefined) {
			patch.name = options.projectName;
			patch.version = '0.0.1';
		}
		if (options?.projectType === 'frontend') {
			const hasTailwindPlugin =
				'bun-plugin-tailwind' in existingDeps || 'bun-plugin-tailwind' in existingDevDeps;
			if (!hasTailwindPlugin) {
				patch.devDependencies = {
					...existingDevDeps,
					'bun-plugin-tailwind': '^0.1.0'
				};
			}
		}
		await this.packageJson.patch(pkgPath, patch);
	}
}
