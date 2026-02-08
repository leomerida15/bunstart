import { getWorkspaceById } from '../../domain/services/WorkspaceResolver';
import { workspacePath } from '../../domain/value-objects/ResolvedWorkspace';
import type { RunInWorkspacePort } from '../../domain/ports/RunInWorkspace.port';
import type { ResolveWorkspacesPort } from '../../domain/ports/ResolveWorkspaces.port';

export interface RunInWorkspaceUseCaseProps {
	resolveWorkspaces: ResolveWorkspacesPort;
	runInWorkspace: RunInWorkspacePort;
}

/**
 * Resolves a workspace alias to its directory and runs the given command there.
 */
export class RunInWorkspaceUseCase {
	private readonly resolveWorkspaces: ResolveWorkspacesPort;
	private readonly runInWorkspace: RunInWorkspacePort;

	constructor({ resolveWorkspaces, runInWorkspace }: RunInWorkspaceUseCaseProps) {
		this.resolveWorkspaces = resolveWorkspaces;
		this.runInWorkspace = runInWorkspace;
	}

	async execute(cwd: string, alias: string, args: string[]): Promise<void> {
		const workspaces = await this.resolveWorkspaces.resolve(cwd);
		if (workspaces.length === 0) {
			throw new Error(
				'No workspaces found. Ensure package.json has workspaces field.'
			);
		}

		const workspace = getWorkspaceById(workspaces, alias);
		if (!workspace) {
			throw new Error(`Unknown workspace alias: ${alias}`);
		}

		const workspaceDir = workspacePath(workspace);
		await this.runInWorkspace.run(cwd, workspaceDir, args);
	}
}
