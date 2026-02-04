import type { RepoState } from '../../domain/entities/RepoState';
import type { RepoStateStoragePort } from '../../domain/ports/RepoStateStorage.port';

export interface InitializeRepoStateUseCaseProps {
	storage: RepoStateStoragePort;
}

/**
 * Writes initial repo state (bunstart.config.ts) at the monorepo root.
 * Used after scaffolding a new monorepo.
 */
export class InitializeRepoStateUseCase {
	private readonly storage: RepoStateStoragePort;

	constructor({ storage }: InitializeRepoStateUseCaseProps) {
		this.storage = storage;
	}

	async execute(cwd: string, state: RepoState): Promise<void> {
		await this.storage.save(cwd, state);
	}
}
