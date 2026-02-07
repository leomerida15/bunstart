import { join } from 'node:path';
import { createAppEntry } from '../../domain/entities/AppEntry';
import { createPackageEntry } from '../../domain/entities/PackageEntry';
import type { LoadConfigUseCase } from '../../../config-state/app/use-cases/LoadConfigUseCase';
import type { PatchConfigUseCase } from '../../../config-state/app/use-cases/PatchConfigUseCase';
import type { PackageJsonPort } from '../../../init/domain/ports/PackageJson.port';

export interface SyncDependsOnFromPackageJsonUseCaseProps {
	loadConfig: LoadConfigUseCase;
	patchConfig: PatchConfigUseCase;
	packageJson: PackageJsonPort;
}

/**
 * Infers dependsOn for a workspace from its package.json dependencies/devDependencies
 * that reference other workspaces, then updates and saves config.
 */
export class SyncDependsOnFromPackageJsonUseCase {
	private readonly loadConfig: LoadConfigUseCase;
	private readonly patchConfig: PatchConfigUseCase;
	private readonly packageJson: PackageJsonPort;

	constructor({
		loadConfig,
		patchConfig,
		packageJson
	}: SyncDependsOnFromPackageJsonUseCaseProps) {
		this.loadConfig = loadConfig;
		this.patchConfig = patchConfig;
		this.packageJson = packageJson;
	}

	async execute(cwd: string, workspaceId: string): Promise<void> {
		const config = await this.loadConfig.execute(cwd);
		if (!config) {
			throw new Error(`No bunstart.config.ts found in ${cwd}`);
		}
		const repo = config.repo ?? { apps: {}, packages: {} };

		const appEntry = repo.apps[workspaceId];
		const pkgEntry = repo.packages[workspaceId];
		const entry = appEntry ?? pkgEntry;
		if (!entry) {
			throw new Error(`Unknown workspace: ${workspaceId}`);
		}

		const dir = appEntry ? 'apps' : 'packages';
		const pkgPath = join(cwd, dir, workspaceId, 'package.json');
		let pkg: Record<string, unknown>;
		try {
			pkg = await this.packageJson.read(pkgPath);
		} catch {
			return; // no package.json or unreadable; skip sync
		}

		const nameToId = new Map<string, string>();
		for (const [id, e] of Object.entries(repo.apps)) {
			nameToId.set(e.name, id);
		}
		for (const [id, e] of Object.entries(repo.packages)) {
			nameToId.set(e.name, id);
		}

		const depIds = new Set<string>();
		for (const key of [
			...(Object.keys((pkg.dependencies as Record<string, string>) ?? {})),
			...(Object.keys((pkg.devDependencies as Record<string, string>) ?? {})),
			...(Object.keys((pkg.peerDependencies as Record<string, string>) ?? {})),
			...(Object.keys((pkg.optionalDependencies as Record<string, string>) ?? {}))
		]) {
			const id = nameToId.get(key);
			if (id && id !== workspaceId) depIds.add(id);
		}

		const newDependsOn = [...depIds];
		const newEntry = appEntry
			? createAppEntry(entry.name, newDependsOn)
			: createPackageEntry(entry.name, newDependsOn);

		const newApps = { ...repo.apps };
		const newPackages = { ...repo.packages };
		if (appEntry) {
			newApps[workspaceId] = newEntry;
		} else {
			newPackages[workspaceId] = newEntry;
		}
		await this.patchConfig.execute(cwd, {
			repo: { apps: newApps, packages: newPackages }
		});
	}
}
