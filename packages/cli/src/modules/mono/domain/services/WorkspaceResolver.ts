import type { RepoConfig } from '../entities/RepoConfig';
import type { BunstartConfig } from '../../../config-state/domain/entities/BunstartConfig';

/**
 * Returns the package name for a workspace alias (app or package), or null if not found.
 */
export function getPackageName(repo: RepoConfig, alias: string): string | null {
	const app = repo.apps[alias];
	if (app) return app.name;
	const pkg = repo.packages[alias];
	if (pkg) return pkg.name;
	return null;
}

/**
 * Returns true if the given string is an alias of an app or package in repo.
 */
export function isWorkspaceAlias(repo: RepoConfig, alias: string): boolean {
	return getPackageName(repo, alias) !== null;
}

/**
 * Returns the monorepo scope (e.g. 'types') from any workspace package name, or null if repo is empty.
 */
export function getScope(repo: RepoConfig): string | null {
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
