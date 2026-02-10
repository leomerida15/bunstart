import { workspacePath } from '../../domain/value-objects/ResolvedWorkspace';
import type { ResolveWorkspacesPort } from '../../domain/ports/ResolveWorkspaces.port';
import type { SyncDependsOnFromPackageJsonUseCase } from './SyncDependsOnFromPackageJsonUseCase';
import type { SyncStatePort } from '../../domain/ports/SyncState.port';

export interface EnsureConfigSyncedUseCaseProps {
	resolveWorkspaces: ResolveWorkspacesPort;
	syncDependsOn: SyncDependsOnFromPackageJsonUseCase;
	syncState: SyncStatePort;
}

/**
 * Ensures bunstart.config.ts dependsOn are in sync with workspace package.json files.
 * Runs sync for all workspaces only when: no previous sync state, or any package.json
 * was modified since last sync. Called before build/dev/start.
 */
export class EnsureConfigSyncedUseCase {
	private readonly resolveWorkspaces: ResolveWorkspacesPort;
	private readonly syncDependsOn: SyncDependsOnFromPackageJsonUseCase;
	private readonly syncState: SyncStatePort;

	constructor({
		resolveWorkspaces,
		syncDependsOn,
		syncState
	}: EnsureConfigSyncedUseCaseProps) {
		this.resolveWorkspaces = resolveWorkspaces;
		this.syncDependsOn = syncDependsOn;
		this.syncState = syncState;
	}

	async execute(cwd: string): Promise<void> {
		const workspaces = await this.resolveWorkspaces.resolve(cwd);
		if (workspaces.length === 0) return;

		const workspacePaths = workspaces.map((w) => workspacePath(w));
		const should = await this.syncState.shouldSync(cwd, workspacePaths);
		if (!should) return;

		for (const w of workspaces) {
			try {
				await this.syncDependsOn.execute(cwd, w.id);
			} catch {
				// Skip workspace if sync fails (e.g. no package.json)
			}
		}
		await this.syncState.recordSync(cwd);
	}
}
