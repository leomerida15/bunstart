import type { RepoConfig } from '../entities/RepoConfig';
import type { ResolvedWorkspace } from '../value-objects/ResolvedWorkspace';

/**
 * Returns workspace ids in topological order so that dependencies come before dependents.
 * If workspaceId is an app or package, returns [..., ...deps, workspaceId].
 * Handles transitive dependencies.
 */
export function resolveBuildOrder(
	state: RepoConfig,
	workspaceId: string
): string[];

/**
 * Returns workspace ids in topological order from ResolvedWorkspace[].
 */
export function resolveBuildOrder(
	workspaces: ResolvedWorkspace[],
	workspaceId: string
): string[];

export function resolveBuildOrder(
	stateOrWorkspaces: RepoConfig | ResolvedWorkspace[],
	workspaceId: string
): string[] {
	const byId = new Map<string, { dependsOn: string[] }>();

	if (Array.isArray(stateOrWorkspaces)) {
		for (const w of stateOrWorkspaces) {
			byId.set(w.id, { dependsOn: w.dependsOn });
		}
	} else {
		const state = stateOrWorkspaces;
		for (const [id, e] of Object.entries(state.apps)) {
			byId.set(id, { dependsOn: e.dependsOn });
		}
		for (const [id, e] of Object.entries(state.packages)) {
			byId.set(id, { dependsOn: e.dependsOn });
		}
	}

	const entry = byId.get(workspaceId);
	if (!entry) return [];

	const visited = new Set<string>();
	const result: string[] = [];

	function visit(id: string): void {
		if (visited.has(id)) return;
		visited.add(id);
		const e = byId.get(id);
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
