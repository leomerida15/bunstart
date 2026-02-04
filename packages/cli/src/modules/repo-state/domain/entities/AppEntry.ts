/**
 * Entry for an app in the repo state (bunstart.config apps record).
 */
export interface AppEntry {
	readonly name: string;
	readonly dependsOn: string[];
}

export function createAppEntry(name: string, dependsOn: string[] = []): AppEntry {
	return { name, dependsOn: [...dependsOn] };
}
