import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import type { AppEntry } from '../../domain/entities/AppEntry';
import type { PackageEntry } from '../../domain/entities/PackageEntry';
import {
	createRepoState,
	type RepoState
} from '../../domain/entities/RepoState';
import type { RepoStateStoragePort } from '../../domain/ports/RepoStateStorage.port';

const CONFIG_FILENAME = 'bunstart.config.ts';

function normalizeEntry(raw: unknown): { name: string; dependsOn: string[] } {
	if (raw && typeof raw === 'object' && 'name' in raw && typeof (raw as { name: unknown }).name === 'string') {
		const obj = raw as { name: string; dependsOn?: unknown };
		const dependsOn = Array.isArray(obj.dependsOn)
			? (obj.dependsOn as unknown[]).filter((d): d is string => typeof d === 'string')
			: [];
		return { name: obj.name, dependsOn };
	}
	throw new Error('Invalid entry: expected { name: string, dependsOn?: string[] }');
}

function normalizeRecord(
	raw: unknown
): Record<string, { name: string; dependsOn: string[] }> {
	if (!raw || typeof raw !== 'object') return {};
	const acc: Record<string, { name: string; dependsOn: string[] }> = {};
	for (const [key, value] of Object.entries(raw)) {
		if (typeof key === 'string' && key.length > 0) {
			acc[key] = normalizeEntry(value);
		}
	}
	return acc;
}

/**
 * Loads and saves repo state from/to bunstart.config.ts at the monorepo root.
 * Uses dynamic import for loading (Bun supports TS); generates TS source for saving.
 */
export class BunstartConfigFileAdapter implements RepoStateStoragePort {
	async load(cwd: string): Promise<RepoState | null> {
		const configPath = join(cwd, CONFIG_FILENAME);
		if (!existsSync(configPath)) return null;

		try {
			const url = pathToFileURL(configPath).href;
			const mod = await import(url);
			const raw = mod?.default;
			if (!raw || typeof raw !== 'object') return null;

			const appsRaw = normalizeRecord((raw as { apps?: unknown }).apps);
			const packagesRaw = normalizeRecord((raw as { packages?: unknown }).packages);

			const apps: Record<string, AppEntry> = {};
			for (const [id, e] of Object.entries(appsRaw)) {
				apps[id] = { name: e.name, dependsOn: e.dependsOn };
			}
			const packages: Record<string, PackageEntry> = {};
			for (const [id, e] of Object.entries(packagesRaw)) {
				packages[id] = { name: e.name, dependsOn: e.dependsOn };
			}

			return createRepoState(apps, packages);
		} catch {
			return null;
		}
	}

	async save(cwd: string, state: RepoState): Promise<void> {
		const configPath = join(cwd, CONFIG_FILENAME);
		const content = this.serialize(state);
		await Bun.write(configPath, content);
	}

	private serialize(state: RepoState): string {
		const appsLines = Object.entries(state.apps)
			.map(
				([id, e]) =>
					`        '${id.replace(/'/g, "\\'")}': { name: '${e.name.replace(/'/g, "\\'")}', dependsOn: ${JSON.stringify(e.dependsOn)} }`
			)
			.join(',\n');
		const packagesLines = Object.entries(state.packages)
			.map(
				([id, e]) =>
					`        '${id.replace(/'/g, "\\'")}': { name: '${e.name.replace(/'/g, "\\'")}', dependsOn: ${JSON.stringify(e.dependsOn)} }`
			)
			.join(',\n');

		return `const bunstartConfig = {
    apps: {
${appsLines}
    },
    packages: {
${packagesLines}
    }
};

export default bunstartConfig;
`;
	}
}
