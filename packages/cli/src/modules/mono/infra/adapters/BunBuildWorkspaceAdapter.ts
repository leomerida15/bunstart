import { join } from 'node:path';
import type { BuildWorkspacePort } from '../../domain/ports/BuildWorkspace.port';

/**
 * Runs `bun run build` in the workspace directory.
 */
export class BunBuildWorkspaceAdapter implements BuildWorkspacePort {
	async build(cwd: string, workspaceDir: string): Promise<void> {
		const fullPath = join(cwd, workspaceDir);
		const proc = Bun.spawn(['bun', 'run', 'build'], {
			cwd: fullPath,
			stdout: 'inherit',
			stderr: 'inherit'
		});
		const exitCode = await proc.exited;
		if (exitCode !== 0) {
			throw new Error(`Build failed for ${workspaceDir} (exit ${exitCode})`);
		}
	}
}
