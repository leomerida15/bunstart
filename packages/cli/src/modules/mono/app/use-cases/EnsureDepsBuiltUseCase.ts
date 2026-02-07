import { resolveBuildOrder } from '../../domain/services/BuildOrderResolver';
import type { BuildWorkspacePort } from '../../domain/ports/BuildWorkspace.port';
import type { LoadConfigUseCase } from '../../../config-state/app/use-cases/LoadConfigUseCase';

export interface EnsureDepsBuiltUseCaseProps {
	loadConfig: LoadConfigUseCase;
	buildWorkspace: BuildWorkspacePort;
}

/**
 * Builds the given workspace and all its dependencies in topological order.
 * Call before running build/dev for an app or package.
 */
export class EnsureDepsBuiltUseCase {
	private readonly loadConfig: LoadConfigUseCase;
	private readonly buildWorkspace: BuildWorkspacePort;

	constructor({ loadConfig, buildWorkspace }: EnsureDepsBuiltUseCaseProps) {
		this.loadConfig = loadConfig;
		this.buildWorkspace = buildWorkspace;
	}

	async execute(cwd: string, workspaceId: string): Promise<void> {
		const config = await this.loadConfig.execute(cwd);
		if (!config) {
			throw new Error(`No bunstart.config.ts found in ${cwd}`);
		}
		const repo = config.repo ?? { apps: {}, packages: {} };

		const order = resolveBuildOrder(repo, workspaceId);
		for (const id of order) {
			const kind = id in repo.apps ? 'app' : 'package';
			await this.buildWorkspace.build(cwd, id, kind);
		}
	}
}
