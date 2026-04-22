import { join, isAbsolute } from 'node:path';
import type { LoadConfigUseCase } from '../../../config-state/app/use-cases/LoadConfigUseCase';
import type { PackageJsonPort } from '../../../init/domain/ports/PackageJson.port';
import type { FilesystemPort } from '../../../init/domain/ports/Filesystem.port';
import type { AddAppUseCase } from './AddAppUseCase';
import type { AddPackageUseCase } from './AddPackageUseCase';
import type { RunBunInstallPort } from '../../domain/ports/RunBunInstall.port';
import { getScope } from '../../domain/services/WorkspaceResolver';
import type { RepoConfig } from '../../domain/entities/RepoConfig';
import type { MigrateToPackUseCase } from './MigrateToPackUseCase';

export interface AdoptProjectUseCaseProps {
	loadConfig: LoadConfigUseCase;
	packageJson: PackageJsonPort;
	filesystem: FilesystemPort;
	addApp: AddAppUseCase;
	addPackage: AddPackageUseCase;
	runBunInstall: RunBunInstallPort;
	migrateToPack: MigrateToPackUseCase;
}

/**
 * Adopts an existing project into the monorepo: if sourcePath is given, copies from that path
 * to apps/ or packages/; then updates package.json name to @scope/name, registers in
 * bunstart.config, runs bun install.
 */
export class AdoptProjectUseCase {
	private readonly loadConfig: LoadConfigUseCase;
	private readonly packageJson: PackageJsonPort;
	private readonly filesystem: FilesystemPort;
	private readonly addApp: AddAppUseCase;
	private readonly addPackage: AddPackageUseCase;
	private readonly runBunInstall: RunBunInstallPort;
	private readonly migrateToPack: MigrateToPackUseCase;

	constructor({
		loadConfig,
		packageJson,
		filesystem,
		addApp,
		addPackage,
		runBunInstall,
		migrateToPack,
	}: AdoptProjectUseCaseProps) {
		this.loadConfig = loadConfig;
		this.packageJson = packageJson;
		this.filesystem = filesystem;
		this.addApp = addApp;
		this.addPackage = addPackage;
		this.runBunInstall = runBunInstall;
		this.migrateToPack = migrateToPack;
	}

	async execute(
		cwd: string,
		type: 'app' | 'pkg',
		name: string,
		sourcePath?: string,
		options?: { skipBuild?: boolean }
	): Promise<void> {
		console.log('[AdoptProject] Starting adoption...');
		const trimmedName = name?.trim();
		if (!trimmedName) {
			throw new Error('Workspace name is required.');
		}

		const dir = type === 'app' ? 'apps' : 'packages';
		const workspacePath = join(cwd, dir, trimmedName);

		if (sourcePath !== undefined && sourcePath !== '') {
			const sourceAbsolute = isAbsolute(sourcePath)
				? sourcePath
				: join(cwd, sourcePath);
			try {
				await this.packageJson.read(sourceAbsolute);
			} catch {
				throw new Error(
					`Source path ${sourceAbsolute} does not exist or has no package.json.`
				);
			}
			if (!(await this.filesystem.existsDir(workspacePath))) {
				await this.filesystem.ensureDir(join(cwd, dir));
				await this.filesystem.copyDirectory(sourceAbsolute, workspacePath);
			}
		} else {
			try {
				await this.packageJson.read(workspacePath);
			} catch {
				throw new Error(
					`Project path ${workspacePath} does not exist or has no package.json.`
				);
			}
		}

		console.log('[AdoptProject] Loading config...');
		const config = await this.loadConfig.execute(cwd);
		if (!config) {
			throw new Error(`No bunstart.config.ts found in ${cwd}`);
		}

		const repo = (config.repo ?? { apps: {}, packages: {} }) as RepoConfig;
		const scope = getScope(repo);
		if (!scope) {
			throw new Error('Could not determine monorepo scope from config.');
		}

		const packageName = `@${scope}/${trimmedName}`;

		console.log('[AdoptProject] Patching package.json...');
		await this.packageJson.patch(workspacePath, { name: packageName });

		console.log('[AdoptProject] Registering in config...');
		if (type === 'app') {
			await this.addApp.execute(cwd, trimmedName, packageName, []);
		} else {
			await this.addPackage.execute(cwd, trimmedName, packageName, []);
		}

		console.log('[AdoptProject] Migrating to @bunstart/pack...');
		await this.migrateToPack.execute(workspacePath, true);

		if (!options?.skipBuild) {
			console.log('[AdoptProject] Running bun install...');
			await this.runBunInstall.execute(cwd);
		} else {
			console.log('[AdoptProject] Skipping bun install.');
		}
		console.log('[AdoptProject] Adoption complete!');
	}
}
