/**
 * Port for building a single workspace (e.g. run `bun run build` in its directory).
 */
export interface BuildWorkspacePort {
	/**
	 * Runs the build script for the given workspace.
	 * @param cwd - Monorepo root
	 * @param workspaceId - Alias (e.g. 'pkg-example')
	 * @param kind - 'app' or 'package' (directory under apps/ or packages/)
	 */
	build(cwd: string, workspaceId: string, kind: 'app' | 'package'): Promise<void>;
}
