import type { RunBunInstallPort } from '../../domain/ports/RunBunInstall.port';

/**
 * Runs `bun install` in the given directory via Bun.spawn.
 */
export class BunRunBunInstallAdapter implements RunBunInstallPort {
	async execute(cwd: string): Promise<void> {
		console.log('[BunInstall] Running bun install...');
		const proc = Bun.spawn(['bun', 'install'], {
			cwd,
			stdout: 'inherit',
			stderr: 'inherit',
			stdin: 'ignore'
		});
		const exitCode = await proc.exited;
		if (exitCode !== 0) {
			process.exit(exitCode ?? 1);
		}
	}
}
