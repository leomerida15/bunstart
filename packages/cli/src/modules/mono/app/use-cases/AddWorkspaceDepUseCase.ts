import { getPackageName, isWorkspaceAlias } from '../../domain/services/WorkspaceResolver';
import type { LoadConfigUseCase } from '../../../config-state/app/use-cases/LoadConfigUseCase';
import type { RunInWorkspacePort } from '../../domain/ports/RunInWorkspace.port';
import type { SyncDependsOnFromPackageJsonUseCase } from './SyncDependsOnFromPackageJsonUseCase';

export interface AddWorkspaceDepOptions {
	dev: boolean;
	peer: boolean;
	optional: boolean;
	exact: boolean;
}

export interface AddWorkspaceDepUseCaseProps {
	loadConfig: LoadConfigUseCase;
	runInWorkspace: RunInWorkspacePort;
	syncDependsOn: SyncDependsOnFromPackageJsonUseCase;
}

/**
 * Adds a workspace from the monorepo as a dependency of another workspace.
 * Runs `bun add [flags] <packageName>@workspace:*` in the target workspace, then syncs config.
 */
export class AddWorkspaceDepUseCase {
	private readonly loadConfig: LoadConfigUseCase;
	private readonly runInWorkspace: RunInWorkspacePort;
	private readonly syncDependsOn: SyncDependsOnFromPackageJsonUseCase;

	constructor({
		loadConfig,
		runInWorkspace,
		syncDependsOn
	}: AddWorkspaceDepUseCaseProps) {
		this.loadConfig = loadConfig;
		this.runInWorkspace = runInWorkspace;
		this.syncDependsOn = syncDependsOn;
	}

	async execute(
		cwd: string,
		targetAlias: string,
		sourceAlias: string,
		options: AddWorkspaceDepOptions
	): Promise<void> {
		const config = await this.loadConfig.execute(cwd);
		if (!config) {
			throw new Error('No bunstart.config.ts found. Run this from the monorepo root.');
		}
		const repo = config.repo ?? { apps: {}, packages: {} };

		if (!isWorkspaceAlias(repo, targetAlias)) {
			throw new Error(`Unknown workspace: ${targetAlias}`);
		}
		if (!isWorkspaceAlias(repo, sourceAlias)) {
			throw new Error(`Unknown workspace: ${sourceAlias}`);
		}
		if (targetAlias === sourceAlias) {
			throw new Error('Target and source workspace must be different.');
		}

		const packageName = getPackageName(repo, sourceAlias);
		if (!packageName) {
			throw new Error(`Unknown workspace: ${sourceAlias}`);
		}

		const workspaceDir =
			targetAlias in repo.apps ? `apps/${targetAlias}` : `packages/${targetAlias}`;

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
