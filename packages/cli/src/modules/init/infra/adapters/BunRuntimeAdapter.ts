import type { BunRuntimePort } from '../../domain/ports/BunRuntime.port';

/**
 * Adapter for Bun runtime operations using Bun.spawn.
 *
 * @class BunRuntimeAdapter
 * @implements {BunRuntimePort}
 */
export class BunRuntimeAdapter implements BunRuntimePort {
	public async initBlank(cwd: string): Promise<void> {
		const proc = Bun.spawn(['bun', 'init', '-y'], {
			cwd,
			stdout: 'inherit',
			stderr: 'inherit'
		});

		const exitCode = await proc.exited;
		if (exitCode !== 0) {
			throw new Error(`bun init failed with exit code ${exitCode}`);
		}
	}

	public async initReact(
		cwd: string,
		variant: 'react' | 'tailwind' | 'shadcn'
	): Promise<void> {
		const flag =
			variant === 'react'
				? '--react'
				: `--react=${variant}`;
		const proc = Bun.spawn(['bun', 'init', flag, '-y'], {
			cwd,
			stdout: 'inherit',
			stderr: 'inherit'
		});

		const exitCode = await proc.exited;
		if (exitCode !== 0) {
			throw new Error(
				`bun init ${flag} failed with exit code ${exitCode}`
			);
		}
	}

	/**
	 * Library template: Bun does not document a --library flag; use blank init.
	 * If Bun adds e.g. `bun init --library -y`, switch to that spawn here.
	 */
	public async initLibrary(cwd: string): Promise<void> {
		await this.initBlank(cwd);
	}

	public async installDependencies(cwd: string): Promise<void> {
		const proc = Bun.spawn(['bun', 'install'], {
			cwd,
			stdout: 'inherit',
			stderr: 'inherit'
		});

		const exitCode = await proc.exited;
		if (exitCode !== 0) {
			throw new Error(`bun install failed with exit code ${exitCode}`);
		}
	}
}
