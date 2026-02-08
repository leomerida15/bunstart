import type { RepoConfig } from '../entities/RepoConfig';
import type { BunstartConfig } from '../../../config-state/domain/entities/BunstartConfig';
import type { ResolvedWorkspace } from '../value-objects/ResolvedWorkspace';

/**
 * Returns the package name for a workspace alias (app or package), or null if not found.
 */
export function getPackageName(repo: RepoConfig, alias: string): string | null;

/**
 * Returns the package name for a workspace alias from ResolvedWorkspace[], or null if not found.
 */
export function getPackageName(
	workspaces: ResolvedWorkspace[],
	alias: string
): string | null;

export function getPackageName(
	repoOrWorkspaces: RepoConfig | ResolvedWorkspace[],
	alias: string
): string | null {
	if (Array.isArray(repoOrWorkspaces)) {
		const w = repoOrWorkspaces.find((x) => x.id === alias);
		return w?.name ?? null;
	}
	const repo = repoOrWorkspaces;
	const app = repo.apps[alias];
	if (app) return app.name;
	const pkg = repo.packages[alias];
	if (pkg) return pkg.name;
	return null;
}

/**
 * Returns true if the given string is an alias of an app or package in repo.
 */
export function isWorkspaceAlias(repo: RepoConfig, alias: string): boolean;

/**
 * Returns true if the given string is an alias in ResolvedWorkspace[].
 */
export function isWorkspaceAlias(
	workspaces: ResolvedWorkspace[],
	alias: string
): boolean;

export function isWorkspaceAlias(
	repoOrWorkspaces: RepoConfig | ResolvedWorkspace[],
	alias: string
): boolean {
	return getPackageName(repoOrWorkspaces, alias) !== null;
}

/**
 * Returns the monorepo scope (e.g. 'types') from any workspace package name, or null if repo is empty.
 */
export function getScope(repo: RepoConfig): string | null;

/**
 * Returns the monorepo scope from ResolvedWorkspace[], or null if empty.
 */
export function getScope(workspaces: ResolvedWorkspace[]): string | null;

export function getScope(
	repoOrWorkspaces: RepoConfig | ResolvedWorkspace[]
): string | null {
	if (Array.isArray(repoOrWorkspaces)) {
		const first = repoOrWorkspaces[0];
		if (first?.name.startsWith('@')) {
			return first.name.split('/')[0]?.slice(1) ?? null;
		}
		return null;
	}
	const repo = repoOrWorkspaces;
	const firstApp = Object.values(repo.apps)[0];
	if (firstApp?.name.startsWith('@')) {
		return firstApp.name.split('/')[0]?.slice(1) ?? null;
	}
	const firstPkg = Object.values(repo.packages)[0];
	if (firstPkg?.name.startsWith('@')) {
		return firstPkg.name.split('/')[0]?.slice(1) ?? null;
	}
	return null;
}

/**
 * Returns the ResolvedWorkspace for the given alias, or null if not found.
 */
export function getWorkspaceById(
	workspaces: ResolvedWorkspace[],
	alias: string
): ResolvedWorkspace | null {
	return workspaces.find((w) => w.id === alias) ?? null;
}

const emptyRepo: RepoConfig = { apps: {}, packages: {} };

/**
 * Returns true if the given alias exists in the config's repo section.
 * Use from index.ts for run routing when you only have BunstartConfig.
 */
export function isWorkspaceAliasFromConfig(
	config: BunstartConfig | null,
	alias: string
): boolean {
	const repo = config?.repo ?? emptyRepo;
	return isWorkspaceAlias(repo, alias);
}
