/**
 * Port for running a command in a workspace (e.g. run from the workspace directory).
 */
export interface RunInWorkspacePort {
	/**
	 * Runs the given args in the context of the workspace.
	 * @param cwd - Monorepo root directory
	 * @param workspaceDir - Relative path to workspace (e.g. 'apps/app-example' or 'packages/pkg-example')
	 * @param args - Command and arguments (e.g. ['run', 'build'])
	 */
	run(cwd: string, workspaceDir: string, args: string[]): Promise<void>;
}
