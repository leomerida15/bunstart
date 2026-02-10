import {
	getPackageName,
	getWorkspaceById,
	isWorkspaceAlias
} from '../../domain/services/WorkspaceResolver';
import { workspacePath } from '../../domain/value-objects/ResolvedWorkspace';
import type { ResolveWorkspacesPort } from '../../domain/ports/ResolveWorkspaces.port';
import type { RunInWorkspacePort } from '../../domain/ports/RunInWorkspace.port';
import type { SyncDependsOnFromPackageJsonUseCase } from './SyncDependsOnFromPackageJsonUseCase';

export interface AddWorkspaceDepOptions {
	dev: boolean;
	peer: boolean;
	optional: boolean;
	exact: boolean;
}

export interface AddWorkspaceDepUseCaseProps {
	resolveWorkspaces: ResolveWorkspacesPort;
	runInWorkspace: RunInWorkspacePort;
	syncDependsOn: SyncDependsOnFromPackageJsonUseCase;
}

/**
 * Adds a workspace from the monorepo as a dependency of another workspace.
 * Runs `bun add [flags] <packageName>@workspace:*` in the target workspace, then syncs config.
 */
export class AddWorkspaceDepUseCase {
	private readonly resolveWorkspaces: ResolveWorkspacesPort;
	private readonly runInWorkspace: RunInWorkspacePort;
	private readonly syncDependsOn: SyncDependsOnFromPackageJsonUseCase;

	constructor({
		resolveWorkspaces,
		runInWorkspace,
		syncDependsOn
	}: AddWorkspaceDepUseCaseProps) {
		this.resolveWorkspaces = resolveWorkspaces;
		this.runInWorkspace = runInWorkspace;
		this.syncDependsOn = syncDependsOn;
	}

	async execute(
		cwd: string,
		targetAlias: string,
		sourceAlias: string,
		options: AddWorkspaceDepOptions
	): Promise<void> {
		const workspaces = await this.resolveWorkspaces.resolve(cwd);
		if (workspaces.length === 0) {
			throw new Error(
				'No workspaces found. Ensure package.json has workspaces field.'
			);
		}

		if (!isWorkspaceAlias(workspaces, targetAlias)) {
			throw new Error(`Unknown workspace: ${targetAlias}`);
		}
		if (!isWorkspaceAlias(workspaces, sourceAlias)) {
			throw new Error(`Unknown workspace: ${sourceAlias}`);
		}
		if (targetAlias === sourceAlias) {
			throw new Error('Target and source workspace must be different.');
		}

		const packageName = getPackageName(workspaces, sourceAlias);
		if (!packageName) {
			throw new Error(`Unknown workspace: ${sourceAlias}`);
		}

		const targetWorkspace = getWorkspaceById(workspaces, targetAlias);
		if (!targetWorkspace) {
			throw new Error(`Unknown workspace: ${targetAlias}`);
		}
		const workspaceDir = workspacePath(targetWorkspace);

		const addArgs: string[] = ['add'];
		if (options.peer) addArgs.push('--peer');
		else if (options.optional) addArgs.push('--optional');
		else if (options.dev) addArgs.push('--dev');
		if (options.exact) addArgs.push('--exact');
		addArgs.push(`${packageName}@workspace:*`);

		await this.runInWorkspace.run(cwd, workspaceDir, addArgs);
		await this.syncDependsOn.execute(cwd, targetAlias);
	}
}
