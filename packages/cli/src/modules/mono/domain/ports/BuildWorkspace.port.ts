/**
 * Port for building a single workspace (e.g. run `bun run build` in its directory).
 */
export interface BuildWorkspacePort {
	/**
	 * Runs the build script for the given workspace.
	 * @param cwd - Monorepo root
	 * @param workspaceDir - Relative path to workspace (e.g. 'packages/pkg-a')
	 */
	build(cwd: string, workspaceDir: string): Promise<void>;
}
