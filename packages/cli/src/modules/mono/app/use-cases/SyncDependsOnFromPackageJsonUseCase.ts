import { join } from 'node:path';
import { createAppEntry } from '../../domain/entities/AppEntry';
import { createPackageEntry } from '../../domain/entities/PackageEntry';
import { getWorkspaceById } from '../../domain/services/WorkspaceResolver';
import { workspacePath } from '../../domain/value-objects/ResolvedWorkspace';
import type { ResolveWorkspacesPort } from '../../domain/ports/ResolveWorkspaces.port';
import type { LoadConfigUseCase } from '../../../config-state/app/use-cases/LoadConfigUseCase';
import type { PatchConfigUseCase } from '../../../config-state/app/use-cases/PatchConfigUseCase';
import type { PackageJsonPort } from '../../../init/domain/ports/PackageJson.port';

export interface SyncDependsOnFromPackageJsonUseCaseProps {
	resolveWorkspaces: ResolveWorkspacesPort;
	loadConfig: LoadConfigUseCase;
	patchConfig: PatchConfigUseCase;
	packageJson: PackageJsonPort;
}

/**
 * Infers dependsOn for a workspace from its package.json dependencies/devDependencies
 * that reference other workspaces, then updates and saves config.
 */
export class SyncDependsOnFromPackageJsonUseCase {
	private readonly resolveWorkspaces: ResolveWorkspacesPort;
	private readonly loadConfig: LoadConfigUseCase;
	private readonly patchConfig: PatchConfigUseCase;
	private readonly packageJson: PackageJsonPort;

	constructor({
		resolveWorkspaces,
		loadConfig,
		patchConfig,
		packageJson
	}: SyncDependsOnFromPackageJsonUseCaseProps) {
		this.resolveWorkspaces = resolveWorkspaces;
		this.loadConfig = loadConfig;
		this.patchConfig = patchConfig;
		this.packageJson = packageJson;
	}

	async execute(cwd: string, workspaceId: string): Promise<void> {
		const workspaces = await this.resolveWorkspaces.resolve(cwd);
		const workspace = getWorkspaceById(workspaces, workspaceId);
		if (!workspace) {
			throw new Error(`Unknown workspace: ${workspaceId}`);
		}

		const pkgPath = join(cwd, workspacePath(workspace), 'package.json');
		let pkg: Record<string, unknown>;
		try {
			pkg = await this.packageJson.read(pkgPath);
		} catch {
			return; // no package.json or unreadable; skip sync
		}

		const nameToId = new Map(workspaces.map((w) => [w.name, w.id]));

		const depIds = new Set<string>();
		for (const key of [
			...(Object.keys((pkg.dependencies as Record<string, string>) ?? {}))
		]) {
			const id = nameToId.get(key);
			if (id && id !== workspaceId) depIds.add(id);
		}

		const newDependsOn = [...depIds];
		const newEntry =
			workspace.dir === 'apps'
				? createAppEntry(workspace.name, newDependsOn)
				: createPackageEntry(workspace.name, newDependsOn);

		const config = await this.loadConfig.execute(cwd);
		const repo = config?.repo ?? { apps: {}, packages: {} };

		const newApps = { ...repo.apps };
		const newPackages = { ...repo.packages };

		if (workspace.dir === 'apps') {
			newApps[workspaceId] = newEntry;
		} else {
			newPackages[workspaceId] = newEntry;
		}

		await this.patchConfig.execute(cwd, {
			repo: { apps: newApps, packages: newPackages }
		});
	}
}
