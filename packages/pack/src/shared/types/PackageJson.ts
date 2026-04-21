/**
 * Represents the parsed content of a package.json file.
 */
export interface PackageJson {
	name?: string;
	version?: string;
	dependencies?: Record<string, string>;
	devDependencies?: Record<string, string>;
}
