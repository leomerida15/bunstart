import { join } from 'node:path';
import type { PackageJsonPort } from '../../../init/domain/ports/PackageJson.port';
import type { FilesystemPort } from '../../../init/domain/ports/Filesystem.port';

export interface MigrateToPackUseCaseProps {
	packageJson: PackageJsonPort;
	filesystem: FilesystemPort;
}

/**
 * Use case for migrating a workspace to use @bunstart/pack.
 * Adds pack as dependency and creates bunstart.config.ts with pack section.
 *
 * @class MigrateToPackUseCase
 */
export class MigrateToPackUseCase {
	private readonly packageJson: PackageJsonPort;
	private readonly filesystem: FilesystemPort;

	constructor({ packageJson, filesystem }: MigrateToPackUseCaseProps) {
		this.packageJson = packageJson;
		this.filesystem = filesystem;
	}

	/**
	 * Migrates a workspace to use @bunstart/pack.
	 *
	 * @param {string} workspacePath - Path to the workspace directory
	 * @param {boolean} isMonorepoWorkspace - Whether this is a monorepo workspace (uses workspace:*)
	 * @returns {Promise<void>}
	 */
	public async execute(
		workspacePath: string,
		isMonorepoWorkspace: boolean = true
	): Promise<void> {
		console.log('[MigrateToPack] Starting migration to pack...');

		const pkgPath = join(workspacePath, 'package.json');
		const pkg = await this.packageJson.read(pkgPath);

		// 1. Add @bunstart/pack as dependency
		await this.addPackDependency(pkgPath, isMonorepoWorkspace);

		// 2. Create/update bunstart.config.ts with pack section
		await this.createPackConfig(workspacePath, pkg);

		console.log('[MigrateToPack] Migration complete!');
	}

	private async addPackDependency(
		pkgPath: string,
		isMonorepoWorkspace: boolean
	): Promise<void> {
		const existingPkg = await this.packageJson.read(pkgPath);
		const existingDeps = (existingPkg.dependencies as Record<string, string>) ?? {};

		// Skip if already has @bunstart/pack
		if (existingDeps['@bunstart/pack']) {
			console.log('[MigrateToPack] @bunstart/pack already in dependencies, skipping...');
			return;
		}

		const packVersion = isMonorepoWorkspace ? 'workspace:*' : '^0.0.1';

		await this.packageJson.patch(pkgPath, {
			dependencies: {
				...existingDeps,
				'@bunstart/pack': packVersion
			}
		});

		console.log(`[MigrateToPack] Added @bunstart/pack@${packVersion} to dependencies`);
	}

	private async createPackConfig(
		workspacePath: string,
		pkg: Record<string, unknown>
	): Promise<void> {
		const configPath = join(workspacePath, 'bunstart.config.ts');

		// Get existing scripts
		const scripts = (pkg.scripts as Record<string, string>) ?? {};

		// Build pack config that wraps existing scripts
		const packConfig = this.buildPackConfig(scripts);

		// Check if config already exists
		const configExists = await this.fileExists(configPath);

		if (configExists) {
			// Read existing config and merge pack section
			const existingConfig = await Bun.file(configPath).text();
			const mergedConfig = this.mergePackIntoConfig(existingConfig, packConfig);
			await this.filesystem.writeFile(configPath, mergedConfig);
			console.log('[MigrateToPack] Updated existing bunstart.config.ts with pack section');
		} else {
			// Create new config
			const newConfig = this.generateNewConfig(packConfig);
			await this.filesystem.writeFile(configPath, newConfig);
			console.log('[MigrateToPack] Created new bunstart.config.ts with pack section');
		}
	}

	private buildPackConfig(scripts: Record<string, string>): Record<string, { script: string }> {
		const packConfig: Record<string, { script: string }> = {};

		// Wrap common scripts if they exist
		const scriptMappings = [
			{ scriptKey: 'build', packKey: 'build' },
			{ scriptKey: 'dev', packKey: 'dev' },
			{ scriptKey: 'start', packKey: 'start' },
			{ scriptKey: 'watch', packKey: 'watch' }
		];

		for (const { scriptKey, packKey } of scriptMappings) {
			if (scripts[scriptKey]) {
				packConfig[packKey] = { script: `bun run ${scriptKey}` };
			}
		}

		return packConfig;
	}

	private generateNewConfig(packConfig: Record<string, { script: string }>): string {
		const packSection = Object.entries(packConfig)
			.map(([key, value]) => `    ${key}: { script: '${value.script}' }`)
			.join(',\n');

		return `export default {
  pack: {
${packSection}
  }
};
`;
	}

	private mergePackIntoConfig(
		existingConfig: string,
		packConfig: Record<string, { script: string }>
	): string {
		// Check if config already has pack section
		if (existingConfig.includes('pack:')) {
			console.log('[MigrateToPack] Config already has pack section, skipping merge');
			return existingConfig;
		}

		// Simple approach: add pack section before the closing brace
		const packSection = Object.entries(packConfig)
			.map(([key, value]) => `    ${key}: { script: '${value.script}' }`)
			.join(',\n');

		// Find the last closing brace and insert pack section before it
		const lastBraceIndex = existingConfig.lastIndexOf('}');
		if (lastBraceIndex === -1) {
			// Invalid config, return as-is
			return existingConfig;
		}

		const beforeBrace = existingConfig.slice(0, lastBraceIndex);
		const afterBrace = existingConfig.slice(lastBraceIndex);

		// Check if we need a comma
		const needsComma = beforeBrace.trim().length > 0 && !beforeBrace.trim().endsWith(',');
		const separator = needsComma ? ',\n' : '\n';

		return `${beforeBrace}${separator}  pack: {
${packSection}
  }${afterBrace}`;
	}

	private async fileExists(path: string): Promise<boolean> {
		try {
			await this.filesystem.existsFile(path);
			return true;
		} catch {
			return false;
		}
	}
}
