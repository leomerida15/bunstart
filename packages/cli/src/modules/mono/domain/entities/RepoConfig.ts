import type { AppEntry } from './AppEntry';
import type { PackageEntry } from './PackageEntry';

/**
 * Aggregate root for the monorepo repo section (bunstart.config.repo).
 * Immutable snapshot of apps and packages with their names and dependsOn.
 */
export interface RepoConfig {
	readonly apps: Record<string, AppEntry>;
	readonly packages: Record<string, PackageEntry>;
}

export function createRepoConfig(
	apps: Record<string, AppEntry>,
	packages: Record<string, PackageEntry>
): RepoConfig {
	return {
		apps: { ...apps },
		packages: { ...packages }
	};
}
