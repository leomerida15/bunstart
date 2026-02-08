/**
 * Value object for a workspace resolved from package.json workspaces.
 * Supports arbitrary directories (apps, packages, libs, etc.).
 */
export interface ResolvedWorkspace {
	readonly id: string;
	readonly dir: string;
	readonly name: string;
	readonly dependsOn: string[];
}

/**
 * Returns the relative path to the workspace (e.g. 'packages/pkg-a').
 */
export function workspacePath(w: ResolvedWorkspace): string {
	return `${w.dir}/${w.id}`;
}
