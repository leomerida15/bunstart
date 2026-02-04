import { getPackageName } from '../../domain/entities/RepoState';
import type { RunInWorkspacePort } from '../../domain/ports/RunInWorkspace.port';
import type { LoadRepoStateUseCase } from './LoadRepoStateUseCase';

export interface RunInWorkspaceUseCaseProps {
	loadRepoState: LoadRepoStateUseCase;
	runInWorkspace: RunInWorkspacePort;
}

/**
 * Resolves a workspace alias to its directory and runs the given command there.
 */
export class RunInWorkspaceUseCase {
	private readonly loadRepoState: LoadRepoStateUseCase;
	private readonly runInWorkspace: RunInWorkspacePort;

	constructor({ loadRepoState, runInWorkspace }: RunInWorkspaceUseCaseProps) {
		this.loadRepoState = loadRepoState;
		this.runInWorkspace = runInWorkspace;
	}

	async execute(cwd: string, alias: string, args: string[]): Promise<void> {
		const state = await this.loadRepoState.execute(cwd);
		if (!state) {
			throw new Error(`No bunstart.config.ts found in ${cwd}`);
		}

		const packageName = getPackageName(state, alias);
		if (!packageName) {
			throw new Error(`Unknown workspace alias: ${alias}`);
		}

		const workspaceDir =
			alias in state.apps ? `apps/${alias}` : `packages/${alias}`;
		await this.runInWorkspace.run(cwd, workspaceDir, args);
	}
}
