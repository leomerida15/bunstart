import { getPackageName, isWorkspaceAlias } from '../../domain/services/WorkspaceResolver';
import type { LoadConfigUseCase } from '../../../config-state/app/use-cases/LoadConfigUseCase';
import type { RunInWorkspacePort } from '../../domain/ports/RunInWorkspace.port';
import type { SyncDependsOnFromPackageJsonUseCase } from './SyncDependsOnFromPackageJsonUseCase';

export interface RemoveWorkspaceDepUseCaseProps {
	loadConfig: LoadConfigUseCase;
	runInWorkspace: RunInWorkspacePort;
	syncDependsOn: SyncDependsOnFromPackageJsonUseCase;
}

/**
 * Removes a workspace from the monorepo as a dependency of another workspace.
 * Runs `bun remove <packageName>` in the target workspace, then syncs config.
 */
export class RemoveWorkspaceDepUseCase {
	private readonly loadConfig: LoadConfigUseCase;
	private readonly runInWorkspace: RunInWorkspacePort;
	private readonly syncDependsOn: SyncDependsOnFromPackageJsonUseCase;

	constructor({
		loadConfig,
		runInWorkspace,
		syncDependsOn
	}: RemoveWorkspaceDepUseCaseProps) {
		this.loadConfig = loadConfig;
		this.runInWorkspace = runInWorkspace;
		this.syncDependsOn = syncDependsOn;
	}

	async execute(
		cwd: string,
		targetAlias: string,
		sourceAlias: string
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

		await this.runInWorkspace.run(cwd, workspaceDir, ['remove', packageName]);
		await this.syncDependsOn.execute(cwd, targetAlias);
	}
}
