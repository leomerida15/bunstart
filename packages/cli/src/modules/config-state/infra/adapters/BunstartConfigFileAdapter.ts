import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import type { BunstartConfig, RepoSection } from '../../domain/entities/BunstartConfig';
import type { ConfigStoragePort } from '../../domain/ports/ConfigStorage.port';

const CONFIG_FILENAME = 'bunstart.config.ts';

function escapeSingleQuotes(s: string): string {
	return s.replace(/'/g, "\\'");
}

function serializeRepoSection(repo: RepoSection): string {
	const appsLines = Object.entries(repo.apps)
		.map(
			([id, e]) =>
				`            '${escapeSingleQuotes(id)}': { name: '${escapeSingleQuotes(e.name)}', dependsOn: ${JSON.stringify(e.dependsOn)} }`
		)
		.join(',\n');
	const packagesLines = Object.entries(repo.packages)
		.map(
			([id, e]) =>
				`            '${escapeSingleQuotes(id)}': { name: '${escapeSingleQuotes(e.name)}', dependsOn: ${JSON.stringify(e.dependsOn)} }`
		)
		.join(',\n');

	return `    repo: {
        apps: {
${appsLines}
        },
        packages: {
${packagesLines}
        }
    }`;
}

/**
 * Loads and saves full bunstart config from/to bunstart.config.ts at the monorepo root.
 * Uses dynamic import for loading (Bun supports TS); generates TS source for saving.
 */
export class BunstartConfigFileAdapter implements ConfigStoragePort {
	async load(cwd: string): Promise<BunstartConfig | null> {
		const configPath = join(cwd, CONFIG_FILENAME);
		if (!existsSync(configPath)) return null;

		try {
			const url = pathToFileURL(configPath).href;
			const mod = await import(url);
			const raw = mod?.default;
			if (!raw || typeof raw !== 'object') return null;

			return raw as BunstartConfig;
		} catch {
			return null;
		}
	}

	async save(cwd: string, config: BunstartConfig): Promise<void> {
		const configPath = join(cwd, CONFIG_FILENAME);
		const content = this.serialize(config);
		await Bun.write(configPath, content);
	}

	private serialize(config: BunstartConfig): string {
		const body = config.repo != null ? serializeRepoSection(config.repo) : '';
		return `const bunstartConfig = {
${body}
};

export default bunstartConfig;
`;
	}
}
