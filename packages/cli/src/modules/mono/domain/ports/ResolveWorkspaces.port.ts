import type { ResolvedWorkspace } from '../value-objects/ResolvedWorkspace';

/**
 * Port for resolving workspaces from package.json (and optionally bunstart.config for dependsOn).
 * Implementations read package.json workspaces field, resolve globs, and merge with config.
 */
export interface ResolveWorkspacesPort {
	/**
	 * Resolves all workspaces in the monorepo.
	 * @param cwd - Monorepo root directory
	 * @returns List of resolved workspaces (id, dir, name, dependsOn)
	 */
	resolve(cwd: string): Promise<ResolvedWorkspace[]>;
}
