import type { LoadConfigUseCase } from '../../../config-state/app/use-cases/LoadConfigUseCase';
import type { SyncDependsOnFromPackageJsonUseCase } from './SyncDependsOnFromPackageJsonUseCase';
import type { SyncStatePort } from '../../domain/ports/SyncState.port';

export interface EnsureConfigSyncedUseCaseProps {
	loadConfig: LoadConfigUseCase;
	syncDependsOn: SyncDependsOnFromPackageJsonUseCase;
	syncState: SyncStatePort;
}

/**
 * Ensures bunstart.config.ts dependsOn are in sync with workspace package.json files.
 * Runs sync for all workspaces only when: no previous sync state, or any package.json
 * was modified since last sync. Called before build/dev/start.
 */
export class EnsureConfigSyncedUseCase {
	private readonly loadConfig: LoadConfigUseCase;
	private readonly syncDependsOn: SyncDependsOnFromPackageJsonUseCase;
	private readonly syncState: SyncStatePort;

	constructor({
		loadConfig,
		syncDependsOn,
		syncState
	}: EnsureConfigSyncedUseCaseProps) {
		this.loadConfig = loadConfig;
		this.syncDependsOn = syncDependsOn;
		this.syncState = syncState;
	}

	async execute(cwd: string): Promise<void> {
		const config = await this.loadConfig.execute(cwd);
		if (!config) return;

		const apps = Object.keys(config.repo?.apps ?? {});
		const packages = Object.keys(config.repo?.packages ?? {});
		if (apps.length === 0 && packages.length === 0) return;

		const should = await this.syncState.shouldSync(cwd, { apps, packages });
		if (!should) return;

		for (const id of [...apps, ...packages]) {
			try {
				await this.syncDependsOn.execute(cwd, id);
			} catch {
				// Skip workspace if sync fails (e.g. no package.json)
			}
		}
		await this.syncState.recordSync(cwd);
	}
}
