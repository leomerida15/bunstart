import { resolveBuildOrder } from '../../domain/services/BuildOrderResolver';
import { getWorkspaceById } from '../../domain/services/WorkspaceResolver';
import { workspacePath } from '../../domain/value-objects/ResolvedWorkspace';
import type { BuildWorkspacePort } from '../../domain/ports/BuildWorkspace.port';
import type { ResolveWorkspacesPort } from '../../domain/ports/ResolveWorkspaces.port';

export interface EnsureDepsBuiltUseCaseProps {
	resolveWorkspaces: ResolveWorkspacesPort;
	buildWorkspace: BuildWorkspacePort;
	checkIfRebuildNeeded: { execute: (packageName: string, entrypoints: string[]) => Promise<{ needsRebuild: boolean; changedFiles: string[] }> };
	updateCache: { execute: (packageName: string, entrypoints: string[]) => Promise<void> };
}

/**
 * Builds the given workspace and all its dependencies in topological order.
 * Call before running build/dev for an app or package.
 * Incorporates lazy build: skips build if content hasn't changed (via CheckIfRebuildNeeded).
 */
export class EnsureDepsBuiltUseCase {
	private readonly resolveWorkspaces: ResolveWorkspacesPort;
	private readonly buildWorkspace: BuildWorkspacePort;
	private readonly checkIfRebuildNeeded: { execute: (packageName: string, entrypoints: string[]) => Promise<{ needsRebuild: boolean; changedFiles: string[] }> };
	private readonly updateCache: { execute: (packageName: string, entrypoints: string[]) => Promise<void> };

	constructor({
		resolveWorkspaces,
		buildWorkspace,
		checkIfRebuildNeeded,
		updateCache
	}: EnsureDepsBuiltUseCaseProps) {
		this.resolveWorkspaces = resolveWorkspaces;
		this.buildWorkspace = buildWorkspace;
		this.checkIfRebuildNeeded = checkIfRebuildNeeded;
		this.updateCache = updateCache;
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
			
			// Lazy build: check if rebuild is needed
			try {
				const packageName = w.name;
				const entrypoints = [`${workspacePath(w)}/src/index.ts`]; // Default entrypoint
				const { needsRebuild } = await this.checkIfRebuildNeeded.execute(packageName, entrypoints);
				
				if (!needsRebuild) {
					console.log(`Skipping build for ${packageName}: no changes detected.`);
					continue;
				}
			} catch {
				// If cache check fails, proceed with build (fail-safe)
			}

			const workspaceDir = workspacePath(w);
			await this.buildWorkspace.build(cwd, workspaceDir);
			
			// Update cache after successful build
			try {
				const packageName = w.name;
				const entrypoints = [`${workspacePath(w)}/src/index.ts`];
				await this.updateCache.execute(packageName, entrypoints);
			} catch {
				// Cache update failure shouldn't fail the build
			}
		}
	}
}
