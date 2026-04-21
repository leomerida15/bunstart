import type { BuildEnvironment } from '../value-objects/BuildEnvironment';
import type { OutputFormat } from '../value-objects/OutputFormat';
import type { EntryPoint } from './EntryPoint';
import type { BunPlugin } from '../../../../shared/types/BunPlugin';
import type { DtsConfig } from '../../../dts-emitter/domain/value-objects/DtsConfig';
import type { AssetsConfig } from '../../../asset-pipeline/domain/ports/AssetCopier.port';

/**
 * Resolved build configuration ready for execution.
 */
export interface BuildConfig {
	entrypoints: EntryPoint[];
	outdir: string;
	environment: BuildEnvironment;
	outputFormat: OutputFormat;
	externals: string[];
	plugins: BunPlugin[]; // eslint-disable-line @typescript-eslint/no-explicit-any
	minify: boolean;
	sourcemap: boolean;
	dts?: DtsConfig;
	/**
	 * Whether to enable incremental builds with content hashing cache.
	 */
	incremental?: boolean;
	/**
	 * Configuration for asset pipeline.
	 */
	assets?: AssetsConfig;
}
