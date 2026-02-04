import type { RepoState } from '../../domain/entities/RepoState';
import type { RepoStateStoragePort } from '../../domain/ports/RepoStateStorage.port';

export interface LoadRepoStateUseCaseProps {
	storage: RepoStateStoragePort;
}

/**
 * Loads repo state from the monorepo root (bunstart.config.ts).
 */
export class LoadRepoStateUseCase {
	private readonly storage: RepoStateStoragePort;

	constructor({ storage }: LoadRepoStateUseCaseProps) {
		this.storage = storage;
	}

	async execute(cwd: string): Promise<RepoState | null> {
		return this.storage.load(cwd);
	}
}
