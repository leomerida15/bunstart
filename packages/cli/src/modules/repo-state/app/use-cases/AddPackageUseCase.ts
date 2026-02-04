import { createPackageEntry } from '../../domain/entities/PackageEntry';
import { createRepoState } from '../../domain/entities/RepoState';
import type { RepoState } from '../../domain/entities/RepoState';
import type { RepoStateStoragePort } from '../../domain/ports/RepoStateStorage.port';

export interface AddPackageUseCaseProps {
	storage: RepoStateStoragePort;
}

/**
 * Adds a new package to the repo state and persists bunstart.config.
 * Does not create files; callers are responsible for scaffolding the package directory.
 *
 * @param cwd - Monorepo root
 * @param name - Package id/alias (e.g. 'shared-utils')
 * @param packageName - Full package name (e.g. '@scope/shared-utils')
 * @param dependsOn - Optional workspace ids this package depends on
 */
export class AddPackageUseCase {
	private readonly storage: RepoStateStoragePort;

	constructor({ storage }: AddPackageUseCaseProps) {
		this.storage = storage;
	}

	async execute(
		cwd: string,
		name: string,
		packageName: string,
		dependsOn: string[] = []
	): Promise<RepoState> {
		const state = await this.storage.load(cwd);
		if (!state) {
			throw new Error(`No bunstart.config.ts found in ${cwd}`);
		}
		if (state.packages[name]) {
			throw new Error(`Package "${name}" already exists.`);
		}

		const newPackages = {
			...state.packages,
			[name]: createPackageEntry(packageName, dependsOn)
		};
		const newState = createRepoState(state.apps, newPackages);
		await this.storage.save(cwd, newState);
		return newState;
	}
}
