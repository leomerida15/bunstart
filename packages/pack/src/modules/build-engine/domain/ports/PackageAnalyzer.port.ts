import type { PackageJson } from '../../../../shared/types/PackageJson';

/**
 * Port for loading and analyzing package.json files.
 */
export interface PackageAnalyzerPort {
	loadPackageJson(dir: string): Promise<PackageJson>;
}
