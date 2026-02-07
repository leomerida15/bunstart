import { getPackageName } from '../../domain/services/WorkspaceResolver';
import type { RunInWorkspacePort } from '../../domain/ports/RunInWorkspace.port';
import type { LoadConfigUseCase } from '../../../config-state/app/use-cases/LoadConfigUseCase';

export interface RunInWorkspaceUseCaseProps {
	loadConfig: LoadConfigUseCase;
	runInWorkspace: RunInWorkspacePort;
}

/**
 * Resolves a workspace alias to its directory and runs the given command there.
 */
export class RunInWorkspaceUseCase {
	private readonly loadConfig: LoadConfigUseCase;
	private readonly runInWorkspace: RunInWorkspacePort;

	constructor({ loadConfig, runInWorkspace }: RunInWorkspaceUseCaseProps) {
		this.loadConfig = loadConfig;
		this.runInWorkspace = runInWorkspace;
	}

	async execute(cwd: string, alias: string, args: string[]): Promise<void> {
		const config = await this.loadConfig.execute(cwd);
		if (!config) {
			throw new Error(`No bunstart.config.ts found in ${cwd}`);
		}
		const repo = config.repo ?? { apps: {}, packages: {} };

		const packageName = getPackageName(repo, alias);
		if (!packageName) {
			throw new Error(`Unknown workspace alias: ${alias}`);
		}

		const workspaceDir =
			alias in repo.apps ? `apps/${alias}` : `packages/${alias}`;
		await this.runInWorkspace.run(cwd, workspaceDir, args);
	}
}
