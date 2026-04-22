import { Glob } from 'bun';
import { join } from 'node:path';
import type { ResolvedWorkspace } from '../../domain/value-objects/ResolvedWorkspace';
import type { ResolveWorkspacesPort } from '../../domain/ports/ResolveWorkspaces.port';
import type { PackageJsonPort } from '../../../init/domain/ports/PackageJson.port';
import type { LoadConfigUseCase } from '../../../config-state/app/use-cases/LoadConfigUseCase';

export interface PackageJsonWorkspacesAdapterProps {
	packageJson: PackageJsonPort;
	loadConfig: LoadConfigUseCase;
}

/**
 * Normalizes a path to use forward slashes (Unix-style).
 * This ensures consistent path handling across Windows and Unix-like systems.
 */
function normalizePathToUnixSeparator(path: string): string {
	return path.replace(/\\/g, '/');
}

/**
 * Resolves workspaces from package.json workspaces field, merges dependsOn from bunstart.config.
 */
export class PackageJsonWorkspacesAdapter implements ResolveWorkspacesPort {
	private readonly packageJson: PackageJsonPort;
	private readonly loadConfig: LoadConfigUseCase;

	constructor({ packageJson, loadConfig }: PackageJsonWorkspacesAdapterProps) {
		this.packageJson = packageJson;
		this.loadConfig = loadConfig;
	}

	async resolve(cwd: string): Promise<ResolvedWorkspace[]> {
		const rootPkg = await this.readRootPackageJson(cwd);
		const patterns = this.extractWorkspacePatterns(rootPkg);
		if (patterns.length === 0) return [];

		const config = await this.loadConfig.execute(cwd);
		const dependsOnById = this.buildDependsOnMap(config);

		const workspacePaths = new Set<string>();

		for (const pattern of patterns) {
			const globPattern = this.toPackageJsonGlob(pattern);
			const glob = new Glob(globPattern);
			for await (const match of glob.scan({ cwd })) {
				// match is e.g. "apps/app-example/package.json" -> dir="apps", id="app-example"
				// Normalize to forward slashes for cross-platform compatibility
				const normalizedMatch = normalizePathToUnixSeparator(match);
				const relPath = normalizedMatch.replace(/\/package\.json$/, '');
				workspacePaths.add(relPath);
			}
		}

		const workspaces: ResolvedWorkspace[] = [];

		for (const relPath of [...workspacePaths].sort()) {
			const parts = relPath.split('/');
			const id = parts.at(-1) ?? relPath;
			const dir = parts.slice(0, -1).join('/') || relPath;

			let name: string;
			try {
				const pkg = await this.packageJson.read(join(cwd, relPath));
				name = (typeof pkg.name === 'string' ? pkg.name : relPath) as string;
			} catch {
				name = id;
			}

			const dependsOn = dependsOnById.get(id) ?? [];

			workspaces.push({ id, dir, name, dependsOn });
		}

		return workspaces.sort((a, b) => a.id.localeCompare(b.id));
	}

	private async readRootPackageJson(cwd: string): Promise<Record<string, unknown>> {
		try {
			return await this.packageJson.read(join(cwd, 'package.json'));
		} catch {
			return {};
		}
	}

	private extractWorkspacePatterns(rootPkg: Record<string, unknown>): string[] {
		const workspaces = rootPkg.workspaces;
		if (Array.isArray(workspaces)) {
			return workspaces.filter(
				(p): p is string => typeof p === 'string' && p.length > 0
			);
		}
		if (workspaces && typeof workspaces === 'object' && 'packages' in workspaces) {
			const packages = (workspaces as { packages?: unknown }).packages;
			if (Array.isArray(packages)) {
				return packages.filter(
					(p): p is string => typeof p === 'string' && p.length > 0
				);
			}
		}
		return [];
	}

	private toPackageJsonGlob(pattern: string): string {
		// "packages/*" -> "packages/*/package.json"
		// "packages/**" -> "packages/**/package.json"
		if (pattern.endsWith('/**')) {
			return `${pattern}/package.json`;
		}
		if (pattern.endsWith('/*')) {
			return `${pattern}/package.json`;
		}
		return `${pattern}/**/package.json`;
	}

	private buildDependsOnMap(
		config: { repo?: { apps?: Record<string, { dependsOn?: string[] }>; packages?: Record<string, { dependsOn?: string[] }> } } | null
	): Map<string, string[]> {
		const map = new Map<string, string[]>();
		if (!config?.repo) return map;
		const { apps = {}, packages = {} } = config.repo;
		for (const [id, entry] of Object.entries(apps)) {
			map.set(id, Array.isArray(entry?.dependsOn) ? entry.dependsOn : []);
		}
		for (const [id, entry] of Object.entries(packages)) {
			map.set(id, Array.isArray(entry?.dependsOn) ? entry.dependsOn : []);
		}
		return map;
	}
}
