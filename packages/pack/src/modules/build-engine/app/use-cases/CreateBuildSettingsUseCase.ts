import type { PackageAnalyzerPort } from '../../domain/ports/PackageAnalyzer.port';
import type { BuildConfig } from '../../domain/entities/BuildConfig';
import { EntryPoint } from '../../domain/entities/EntryPoint';
import { BuildEnvironment } from '../../domain/value-objects/BuildEnvironment';
import { OutputFormat } from '../../domain/value-objects/OutputFormat';
import type { BunPlugin } from '../../../../shared/types/BunPlugin';

/**
 * Input configuration provided by the user when calling buildSetting().
 */
export interface UserBuildConfig {
	entrypoints: string[];
	outdir?: string;
	outputFormat?: string;
	environment?: 'development' | 'production';
	externals?: string[];
	minify?: boolean;
	sourcemap?: boolean;
	plugins?: BunPlugin[];
	/**
	 * Configuration for TypeScript declaration file emission.
	 */
	dts?: {
		/**
		 * Whether to emit .d.ts files during build.
		 */
		enable: boolean;
		/**
		 * Entry points to generate type declarations for.
		 * Defaults to ["./src/index.ts"] if not provided.
		 */
		entrypoints?: string[];
		/**
		 * Output directory for generated .d.ts files.
		 * Defaults to the build output directory if not provided.
		 */
		outDir?: string;
	};
}

/**
 * Props for CreateBuildSettingsUseCase.
 */
export interface CreateBuildSettingsUseCaseProps {
	packageAnalyzer: PackageAnalyzerPort;
}

/**
 * Use case that creates a resolved BuildConfig from user input.
 * Applies defaults and resolves entrypoints.
 */
export class CreateBuildSettingsUseCase {
	private readonly packageAnalyzer: PackageAnalyzerPort;

	public constructor({ packageAnalyzer }: CreateBuildSettingsUseCaseProps) {
		this.packageAnalyzer = packageAnalyzer;
	}

	async execute(userConfig: UserBuildConfig, cwd: string): Promise<BuildConfig> {
		const environment =
			userConfig.environment === 'production'
				? BuildEnvironment.fromString('production')
				: BuildEnvironment.fromString('development');

		const outputFormat = userConfig.outputFormat
			? OutputFormat.fromString(userConfig.outputFormat)
			: OutputFormat.fromString('esm');

		// TODO: resolve entrypoints with EntryPointResolver (Phase 4 service)
		const entrypoints: EntryPoint[] = userConfig.entrypoints.map(
			(path) => new EntryPoint(path, path),
		);

		const packageJson = await this.packageAnalyzer.loadPackageJson(cwd);

		return {
			entrypoints,
			outdir: userConfig.outdir ?? 'dist',
			environment,
			outputFormat,
			externals: userConfig.externals ?? [],
			plugins: userConfig.plugins ?? [],
			minify: userConfig.minify ?? false,
			sourcemap: userConfig.sourcemap ?? false,
			dts: userConfig.dts
				? {
						enable: userConfig.dts.enable ?? false,
						entrypoints: userConfig.dts.entrypoints ?? ['./src/index.ts'],
						outDir: userConfig.dts.outDir,
					}
				: undefined,
		};
	}
}
