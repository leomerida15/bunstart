import { join } from 'node:path';
import type { BuildWorkspacePort } from '../../domain/ports/BuildWorkspace.port';

/**
 * Runs `bun run build` in the workspace directory.
 */
export class BunBuildWorkspaceAdapter implements BuildWorkspacePort {
	async build(
		cwd: string,
		workspaceId: string,
		kind: 'app' | 'package'
	): Promise<void> {
		const dir = kind === 'app' ? 'apps' : 'packages';
		const workspaceDir = join(cwd, dir, workspaceId);
		const proc = Bun.spawn(['bun', 'run', 'build'], {
			cwd: workspaceDir,
			stdout: 'inherit',
			stderr: 'inherit'
		});
		const exitCode = await proc.exited;
		if (exitCode !== 0) {
			throw new Error(`Build failed for ${workspaceId} (exit ${exitCode})`);
		}
	}
}
