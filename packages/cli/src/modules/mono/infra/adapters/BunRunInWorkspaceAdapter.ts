import { join } from 'node:path';
import type { RunInWorkspacePort } from '../../domain/ports/RunInWorkspace.port';

/**
 * Runs commands in a workspace by executing bun from the workspace directory.
 */
export class BunRunInWorkspaceAdapter implements RunInWorkspacePort {
	async run(cwd: string, workspaceDir: string, args: string[]): Promise<void> {
		const workDir = join(cwd, workspaceDir);
		const proc = Bun.spawn(['bun', ...args], {
			cwd: workDir,
			stdout: 'inherit',
			stderr: 'inherit',
			stdin: 'inherit'
		});
		const exitCode = await proc.exited;
		if (exitCode !== 0) {
			process.exit(exitCode ?? 1);
		}
	}
}
