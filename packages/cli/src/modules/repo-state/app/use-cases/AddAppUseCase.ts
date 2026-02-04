import { createAppEntry } from '../../domain/entities/AppEntry';
import { createRepoState } from '../../domain/entities/RepoState';
import type { RepoState } from '../../domain/entities/RepoState';
import type { RepoStateStoragePort } from '../../domain/ports/RepoStateStorage.port';

export interface AddAppUseCaseProps {
	storage: RepoStateStoragePort;
}

/**
 * Adds a new app to the repo state and persists bunstart.config.
 * Does not create files; callers are responsible for scaffolding the app directory.
 *
 * @param cwd - Monorepo root
 * @param name - App id/alias (e.g. 'my-app')
 * @param packageName - Full package name (e.g. '@scope/my-app')
 * @param dependsOn - Optional workspace ids this app depends on
 */
export class AddAppUseCase {
	private readonly storage: RepoStateStoragePort;

	constructor({ storage }: AddAppUseCaseProps) {
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
		if (state.apps[name]) {
			throw new Error(`App "${name}" already exists.`);
		}

		const newApps = { ...state.apps, [name]: createAppEntry(packageName, dependsOn) };
		const newState = createRepoState(newApps, state.packages);
		await this.storage.save(cwd, newState);
		return newState;
	}
}
