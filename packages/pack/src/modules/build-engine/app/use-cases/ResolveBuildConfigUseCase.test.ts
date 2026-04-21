import { describe, it, expect } from 'bun:test';
import { ResolveBuildConfigUseCase } from './ResolveBuildConfigUseCase';
import { BuildEnvironment } from '../../domain/value-objects/BuildEnvironment';
import { OutputFormat } from '../../domain/value-objects/OutputFormat';
import { EntryPoint } from '../../domain/entities/EntryPoint';
import type { PackageAnalyzerPort } from '../../domain/ports/PackageAnalyzer.port';
import type { PackageJson } from '../../../../shared/types/PackageJson';
import type { UserBuildConfig } from './CreateBuildSettingsUseCase';
import type { BunPlugin } from '../../../../shared/types/BunPlugin';

/**
 * Mock implementation of PackageAnalyzerPort for testing.
 */
class MockPackageAnalyzerAdapter implements PackageAnalyzerPort {
	constructor(private readonly pkgJson: PackageJson = {}) {}
	async loadPackageJson(_dir: string): Promise<PackageJson> {
		return this.pkgJson;
	}
}

describe('ResolveBuildConfigUseCase', () => {
	function makeSut(pkgJson: PackageJson = {}) {
		const packageAnalyzer = new MockPackageAnalyzerAdapter(pkgJson);
		return new ResolveBuildConfigUseCase({ packageAnalyzer });
	}

	function makePartialConfig() {
		return {
			entrypoints: [new EntryPoint('./src/index.ts', './src/index.ts')],
			outdir: 'dist',
			environment: BuildEnvironment.fromString('development'),
			outputFormat: OutputFormat.fromString('esm'),
			externals: [] as string[],
			plugins: [] as unknown as BunPlugin[],
			minify: false,
			sourcemap: false,
		};
	}

	it('resolves entrypoint paths to absolute paths', async () => {
		const sut = makeSut();
		const partialConfig = makePartialConfig();
		const userConfig: UserBuildConfig = { entrypoints: ['./src/index.ts'] };

		const result = await sut.execute(partialConfig, userConfig, '/project');

		expect(result.entrypoints).toHaveLength(1);
		expect(result.entrypoints[0]?.resolvedPath).toBe('/project/src/index.ts');
	});

	it('resolves externals from package.json dependencies in development', async () => {
		const sut = makeSut({
			dependencies: { lodash: '^4.17.21' },
			devDependencies: { vitest: '^1.0.0' },
		});
		const partialConfig = makePartialConfig();
		partialConfig.environment = BuildEnvironment.fromString('development');
		const userConfig: UserBuildConfig = { entrypoints: ['./src/index.ts'] };

		const result = await sut.execute(partialConfig, userConfig, '/project');

		expect(result.externals).toContain('lodash');
		expect(result.externals).toContain('vitest');
	});

	it('resolves externals from package.json dependencies in production', async () => {
		const sut = makeSut({
			dependencies: { lodash: '^4.17.21' },
			devDependencies: { vitest: '^1.0.0' },
		});
		const partialConfig = makePartialConfig();
		partialConfig.environment = BuildEnvironment.fromString('production');
		partialConfig.externals = ['custom-pkg'];
		const userConfig: UserBuildConfig = { entrypoints: ['./src/index.ts'] };

		const result = await sut.execute(partialConfig, userConfig, '/project');

		// In production, only user-provided externals are included
		expect(result.externals).toEqual(['custom-pkg']);
	});

	it('preserves non-entrypoint fields from partial config', async () => {
		const sut = makeSut();
		const partialConfig = makePartialConfig();
		partialConfig.outdir = 'custom-out';
		partialConfig.minify = true;
		const userConfig: UserBuildConfig = { entrypoints: ['./src/index.ts'] };

		const result = await sut.execute(partialConfig, userConfig, '/project');

		expect(result.outdir).toBe('custom-out');
		expect(result.minify).toBe(true);
	});

	it('uses cwd for resolving entrypoint paths', async () => {
		const sut = makeSut();
		const partialConfig = makePartialConfig();
		const userConfig: UserBuildConfig = { entrypoints: ['./app.ts'] };

		const result = await sut.execute(partialConfig, userConfig, '/my/project');

		expect(result.entrypoints[0]?.resolvedPath).toBe('/my/project/app.ts');
	});
});
