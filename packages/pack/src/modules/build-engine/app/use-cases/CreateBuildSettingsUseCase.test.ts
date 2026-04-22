import { describe, it, expect } from 'bun:test';
import { CreateBuildSettingsUseCase } from './CreateBuildSettingsUseCase';
import { BuildEnvironment } from '../../domain/value-objects/BuildEnvironment';
import { OutputFormat } from '../../domain/value-objects/OutputFormat';
import type { PackageAnalyzerPort } from '../../domain/ports/PackageAnalyzer.port';
import type { PackageJson } from '../../../../shared/types/PackageJson';

/**
 * Mock implementation of PackageAnalyzerPort for testing.
 */
class MockPackageAnalyzerAdapter implements PackageAnalyzerPort {
	constructor(private readonly pkgJson: PackageJson = {}) {}
	async loadPackageJson(_dir: string): Promise<PackageJson> {
		return this.pkgJson;
	}
}

describe('CreateBuildSettingsUseCase', () => {
	function makeSut(pkgJson: PackageJson = {}) {
		const packageAnalyzer = new MockPackageAnalyzerAdapter(pkgJson);
		return new CreateBuildSettingsUseCase({ packageAnalyzer });
	}

	it('applies defaults when no optional config provided', async () => {
		const sut = makeSut();
		const userConfig = { entrypoints: ['./src/index.ts'] };

		const result = await sut.execute(userConfig, '/project');

		expect(result.outdir).toBe('dist');
		expect(result.environment.equals(BuildEnvironment.fromString('development'))).toBe(true);
		expect(result.outputFormat.equals(OutputFormat.fromString('esm'))).toBe(true);
		expect(result.externals).toEqual([]);
		expect(result.plugins).toEqual([]);
		expect(result.minify).toBe(false);
		expect(result.sourcemap).toBe(false);
	});

	it('uses production environment when specified', async () => {
		const sut = makeSut();
		const userConfig = { entrypoints: ['./src/index.ts'], environment: 'production' as const };

		const result = await sut.execute(userConfig, '/project');

		expect(result.environment.equals(BuildEnvironment.fromString('production'))).toBe(true);
	});

	it('uses development environment when specified', async () => {
		const sut = makeSut();
		const userConfig = { entrypoints: ['./src/index.ts'], environment: 'development' as const };

		const result = await sut.execute(userConfig, '/project');

		expect(result.environment.equals(BuildEnvironment.fromString('development'))).toBe(true);
	});

	it('uses provided outdir instead of default', async () => {
		const sut = makeSut();
		const userConfig = { entrypoints: ['./src/index.ts'], outdir: 'build/output' };

		const result = await sut.execute(userConfig, '/project');

		expect(result.outdir).toBe('build/output');
	});

	it('uses provided outputFormat instead of default esm', async () => {
		const sut = makeSut();
		const userConfig = { entrypoints: ['./src/index.ts'], outputFormat: 'cjs' };

		const result = await sut.execute(userConfig, '/project');

		expect(result.outputFormat.equals(OutputFormat.fromString('cjs'))).toBe(true);
	});

	it('throws on invalid outputFormat', async () => {
		const sut = makeSut();
		const userConfig = { entrypoints: ['./src/index.ts'], outputFormat: 'invalid' };

		await expect(sut.execute(userConfig, '/project')).rejects.toThrow('Invalid output format');
	});

	it('applies user-provided externals', async () => {
		const sut = makeSut();
		const userConfig = { entrypoints: ['./src/index.ts'], externals: ['lodash', 'express'] };

		const result = await sut.execute(userConfig, '/project');

		expect(result.externals).toEqual(['lodash', 'express']);
	});

	it('maps entrypoints to EntryPoint instances', async () => {
		const sut = makeSut();
		const userConfig = { entrypoints: ['./src/index.ts', './src/cli.ts'] };

		const result = await sut.execute(userConfig, '/project');

		expect(result.entrypoints).toHaveLength(2);
		const [first, second] = result.entrypoints;
		expect(first?.originalPath).toBe('./src/index.ts');
		expect(second?.originalPath).toBe('./src/cli.ts');
	});
});
