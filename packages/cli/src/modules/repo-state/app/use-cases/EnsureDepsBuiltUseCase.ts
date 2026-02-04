import { resolveBuildOrder } from '../../domain/services/BuildOrderResolver';
import type { RepoState } from '../../domain/entities/RepoState';
import type { BuildWorkspacePort } from '../../domain/ports/BuildWorkspace.port';
import type { LoadRepoStateUseCase } from './LoadRepoStateUseCase';

export interface EnsureDepsBuiltUseCaseProps {
	loadRepoState: LoadRepoStateUseCase;
	buildWorkspace: BuildWorkspacePort;
}

/**
 * Builds the given workspace and all its dependencies in topological order.
 * Call before running build/dev for an app or package.
 */
export class EnsureDepsBuiltUseCase {
	private readonly loadRepoState: LoadRepoStateUseCase;
	private readonly buildWorkspace: BuildWorkspacePort;

	constructor({ loadRepoState, buildWorkspace }: EnsureDepsBuiltUseCaseProps) {
		this.loadRepoState = loadRepoState;
		this.buildWorkspace = buildWorkspace;
	}

	async execute(cwd: string, workspaceId: string): Promise<void> {
		const state = await this.loadRepoState.execute(cwd);
		if (!state) {
			throw new Error(`No bunstart.config.ts found in ${cwd}`);
		}

		const order = resolveBuildOrder(state, workspaceId);
		for (const id of order) {
			const kind = id in state.apps ? 'app' : 'package';
			await this.buildWorkspace.build(cwd, id, kind);
		}
	}
}
