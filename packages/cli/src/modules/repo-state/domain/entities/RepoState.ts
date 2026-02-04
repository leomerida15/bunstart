import type { AppEntry } from './AppEntry';
import type { PackageEntry } from './PackageEntry';

/**
 * Aggregate root for the monorepo state (bunstart.config).
 * Immutable snapshot of apps and packages with their names and dependsOn.
 */
export interface RepoState {
	readonly apps: Record<string, AppEntry>;
	readonly packages: Record<string, PackageEntry>;
}

export function createRepoState(
	apps: Record<string, AppEntry>,
	packages: Record<string, PackageEntry>
): RepoState {
	return {
		apps: { ...apps },
		packages: { ...packages }
	};
}

/**
 * Returns the package name for a workspace alias (app or package), or null if not found.
 */
export function getPackageName(state: RepoState, alias: string): string | null {
	const app = state.apps[alias];
	if (app) return app.name;
	const pkg = state.packages[alias];
	if (pkg) return pkg.name;
	return null;
}

/**
 * Returns true if the given string is an alias of an app or package in state.
 */
export function isWorkspaceAlias(state: RepoState, alias: string): boolean {
	return getPackageName(state, alias) !== null;
}

/**
 * Returns the monorepo scope (e.g. 'types') from any workspace package name, or null if state is empty.
 */
export function getScope(state: RepoState): string | null {
	const firstApp = Object.values(state.apps)[0];
	if (firstApp?.name.startsWith('@')) {
		return firstApp.name.split('/')[0]?.slice(1) ?? null;
	}
	const firstPkg = Object.values(state.packages)[0];
	if (firstPkg?.name.startsWith('@')) {
		return firstPkg.name.split('/')[0]?.slice(1) ?? null;
	}
	return null;
}
