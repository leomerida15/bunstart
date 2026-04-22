import { describe, it, expect } from 'bun:test';
import { ExecuteBuildUseCase } from './ExecuteBuildUseCase';
import { BuildEnvironment } from '../../domain/value-objects/BuildEnvironment';
import { OutputFormat } from '../../domain/value-objects/OutputFormat';
import { EntryPoint } from '../../domain/entities/EntryPoint';
import type { BundlerPort } from '../../domain/ports/Bundler.port';
import type { BuildConfig } from '../../domain/entities/BuildConfig';
import type { BuildResult } from '../../domain/entities/BuildResult';
import { BuildError } from '../../../../shared/errors/BuildError';

/**
 * Mock implementation of BundlerPort for testing.
 */
class MockBundlerAdapter implements BundlerPort {
	constructor(private readonly result: BuildResult) {}
	async execute(_config: BuildConfig): Promise<BuildResult> {
		return this.result;
	}
}

function makeBuildConfig(): BuildConfig {
	return {
		entrypoints: [new EntryPoint('./src/index.ts', '/project/src/index.ts')],
		outdir: 'dist',
		environment: BuildEnvironment.fromString('development'),
		outputFormat: OutputFormat.fromString('esm'),
		externals: [],
		plugins: [],
		minify: false,
		sourcemap: false,
	};
}

describe('ExecuteBuildUseCase', () => {
	it('does not throw when build succeeds', async () => {
		const mockResult: BuildResult = {
			success: true,
			outputs: [{ path: 'dist/index.js', size: 1024 }],
			errors: [],
			durationMs: 150,
		};
		const bundler = new MockBundlerAdapter(mockResult);
		const sut = new ExecuteBuildUseCase({ bundler });

		await expect(sut.execute(makeBuildConfig())).resolves.toBeUndefined();
	});

	it('throws BuildError when build fails', async () => {
		const mockResult: BuildResult = {
			success: false,
			outputs: [],
			errors: [new BuildError('TypeScript error: cannot find module "./missing"')],
			durationMs: 50,
		};
		const bundler = new MockBundlerAdapter(mockResult);
		const sut = new ExecuteBuildUseCase({ bundler });

		await expect(sut.execute(makeBuildConfig())).rejects.toThrow('Build failed');
	});

	it('throws BuildError with all error messages concatenated', async () => {
		const mockResult: BuildResult = {
			success: false,
			outputs: [],
			errors: [new BuildError('Error 1'), new BuildError('Error 2')],
			durationMs: 50,
		};
		const bundler = new MockBundlerAdapter(mockResult);
		const sut = new ExecuteBuildUseCase({ bundler });

		await expect(sut.execute(makeBuildConfig())).rejects.toThrow('Error 1; Error 2');
	});

	it('calls bundler with the provided config', async () => {
		const mockResult: BuildResult = {
			success: true,
			outputs: [],
			errors: [],
			durationMs: 100,
		};
		let capturedConfig: BuildConfig | undefined;
		const bundler: BundlerPort = {
			async execute(config: BuildConfig): Promise<BuildResult> {
				capturedConfig = config;
				return mockResult;
			},
		};
		const sut = new ExecuteBuildUseCase({ bundler });
		const config = makeBuildConfig();

		await sut.execute(config);

		expect(capturedConfig).toBe(config);
	});
});
