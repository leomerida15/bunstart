import { describe, it, expect } from 'bun:test';
import { ExternalsResolver } from './ExternalsResolver';
import { BuildEnvironment } from '../value-objects/BuildEnvironment';
import { OutputFormat } from '../value-objects/OutputFormat';
import { EntryPoint } from '../entities/EntryPoint';
import type { BuildConfig } from '../entities/BuildConfig';
import type { PackageJson } from '../../../../shared/types/PackageJson';

describe('ExternalsResolver', () => {
	const resolver = new ExternalsResolver();

	function makeBuildConfig(environment: BuildEnvironment, externals: string[]): BuildConfig {
		return {
			environment,
			externals,
			entrypoints: [new EntryPoint('./src/index.ts', '/project/src/index.ts')],
			outdir: 'dist',
			outputFormat: OutputFormat.fromString('esm'),
			plugins: [],
			minify: false,
			sourcemap: false,
		};
	}

	it('marks all deps and devDeps as external in development', () => {
		const config = makeBuildConfig(BuildEnvironment.fromString('development'), []);
		const packageJson: PackageJson = {
			dependencies: { lodash: '^4.17.21', react: '^18.0.0' },
			devDependencies: { typescript: '^5.0.0', vitest: '^1.0.0' },
		};

		const result = resolver.resolve(config, packageJson);

		expect(result.externals).toContain('lodash');
		expect(result.externals).toContain('react');
		expect(result.externals).toContain('typescript');
		expect(result.externals).toContain('vitest');
	});

	it('marks only user-provided externals in production', () => {
		const config = makeBuildConfig(BuildEnvironment.fromString('production'), [
			'lodash',
			'express',
		]);
		const packageJson: PackageJson = {
			dependencies: { lodash: '^4.17.21' },
			devDependencies: { vitest: '^1.0.0' },
		};

		const result = resolver.resolve(config, packageJson);

		expect(result.externals).toEqual(['lodash', 'express']);
	});

	it('production with no user externals returns empty array', () => {
		const config = makeBuildConfig(BuildEnvironment.fromString('production'), []);
		const packageJson: PackageJson = {
			dependencies: { lodash: '^4.17.21' },
		};

		const result = resolver.resolve(config, packageJson);

		expect(result.externals).toEqual([]);
	});

	it('development with no package.json deps returns only user externals', () => {
		const config = makeBuildConfig(BuildEnvironment.fromString('development'), ['custom-pkg']);
		const packageJson: PackageJson = {};

		const result = resolver.resolve(config, packageJson);

		expect(result.externals).toEqual(['custom-pkg']);
	});
});
