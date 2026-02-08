import { resolveBuildOrder } from '../../domain/services/BuildOrderResolver';
import { getWorkspaceById } from '../../domain/services/WorkspaceResolver';
import { workspacePath } from '../../domain/value-objects/ResolvedWorkspace';
import type { BuildWorkspacePort } from '../../domain/ports/BuildWorkspace.port';
import type { ResolveWorkspacesPort } from '../../domain/ports/ResolveWorkspaces.port';

export interface EnsureDepsBuiltUseCaseProps {
	resolveWorkspaces: ResolveWorkspacesPort;
	buildWorkspace: BuildWorkspacePort;
}

/**
 * Builds the given workspace and all its dependencies in topological order.
 * Call before running build/dev for an app or package.
 */
export class EnsureDepsBuiltUseCase {
	private readonly resolveWorkspaces: ResolveWorkspacesPort;
	private readonly buildWorkspace: BuildWorkspacePort;

	constructor({
		resolveWorkspaces,
		buildWorkspace
	}: EnsureDepsBuiltUseCaseProps) {
		this.resolveWorkspaces = resolveWorkspaces;
		this.buildWorkspace = buildWorkspace;
	}

	async execute(cwd: string, workspaceId: string): Promise<void> {
		const workspaces = await this.resolveWorkspaces.resolve(cwd);
		if (workspaces.length === 0) {
			throw new Error(
				'No workspaces found. Ensure package.json has workspaces field.'
			);
		}

		const order = resolveBuildOrder(workspaces, workspaceId);
		for (const id of order) {
			const w = getWorkspaceById(workspaces, id);
			if (!w) continue;
			const workspaceDir = workspacePath(w);
			await this.buildWorkspace.build(cwd, workspaceDir);
		}
	}
}
