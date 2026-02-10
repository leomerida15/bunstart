/**
 * Entry for a package in the repo config (bunstart.config packages record).
 */
export interface PackageEntry {
	readonly name: string;
	readonly dependsOn: string[];
}

export function createPackageEntry(
	name: string,
	dependsOn: string[] = []
): PackageEntry {
	return { name, dependsOn: [...dependsOn] };
}
