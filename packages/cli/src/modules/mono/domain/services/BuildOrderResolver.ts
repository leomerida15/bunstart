import type { RepoConfig } from '../entities/RepoConfig';

/**
 * Returns workspace ids in topological order so that dependencies come before dependents.
 * If workspaceId is an app or package, returns [..., ...deps, workspaceId].
 * Handles transitive dependencies.
 */
export function resolveBuildOrder(
	state: RepoConfig,
	workspaceId: string
): string[] {
	const entry = state.apps[workspaceId] ?? state.packages[workspaceId];
	if (!entry) return [];

	const visited = new Set<string>();
	const result: string[] = [];

	function visit(id: string): void {
		if (visited.has(id)) return;
		visited.add(id);
		const e = state.apps[id] ?? state.packages[id];
		if (e) {
			for (const dep of e.dependsOn) {
				visit(dep);
			}
		}
		result.push(id);
	}

	visit(workspaceId);
	return result;
}
