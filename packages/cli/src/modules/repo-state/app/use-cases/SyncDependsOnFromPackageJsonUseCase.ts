import { join } from 'node:path';
import { createAppEntry } from '../../domain/entities/AppEntry';
import { createPackageEntry } from '../../domain/entities/PackageEntry';
import { createRepoState } from '../../domain/entities/RepoState';
import type { RepoState } from '../../domain/entities/RepoState';
import type { RepoStateStoragePort } from '../../domain/ports/RepoStateStorage.port';
import type { PackageJsonPort } from '../../../init/domain/ports/PackageJson.port';

export interface SyncDependsOnFromPackageJsonUseCaseProps {
	storage: RepoStateStoragePort;
	packageJson: PackageJsonPort;
}

/**
 * Infers dependsOn for a workspace from its package.json dependencies/devDependencies
 * that reference other workspaces, then updates and saves state.
 */
export class SyncDependsOnFromPackageJsonUseCase {
	private readonly storage: RepoStateStoragePort;
	private readonly packageJson: PackageJsonPort;

	constructor({ storage, packageJson }: SyncDependsOnFromPackageJsonUseCaseProps) {
		this.storage = storage;
		this.packageJson = packageJson;
	}

	async execute(cwd: string, workspaceId: string): Promise<void> {
		const state = await this.storage.load(cwd);
		if (!state) {
			throw new Error(`No bunstart.config.ts found in ${cwd}`);
		}

		const appEntry = state.apps[workspaceId];
		const pkgEntry = state.packages[workspaceId];
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

		// Map workspace package name -> workspace id
		const nameToId = new Map<string, string>();
		for (const [id, e] of Object.entries(state.apps)) {
			nameToId.set(e.name, id);
		}
		for (const [id, e] of Object.entries(state.packages)) {
			nameToId.set(e.name, id);
		}

		const depIds = new Set<string>();
		for (const key of [
			...(Object.keys((pkg.dependencies as Record<string, string>) ?? {})),
			...(Object.keys((pkg.devDependencies as Record<string, string>) ?? {}))
		]) {
			const id = nameToId.get(key);
			if (id && id !== workspaceId) depIds.add(id);
		}

		const newDependsOn = [...depIds];
		const newEntry = appEntry
			? createAppEntry(entry.name, newDependsOn)
			: createPackageEntry(entry.name, newDependsOn);

		const newApps = { ...state.apps };
		const newPackages = { ...state.packages };
		if (appEntry) {
			newApps[workspaceId] = newEntry;
		} else {
			newPackages[workspaceId] = newEntry;
		}
		await this.storage.save(cwd, createRepoState(newApps, newPackages));
	}
}
