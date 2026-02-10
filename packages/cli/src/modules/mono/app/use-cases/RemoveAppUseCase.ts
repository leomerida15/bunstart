import { createAppEntry } from '../../domain/entities/AppEntry';
import { createPackageEntry } from '../../domain/entities/PackageEntry';
import type { RepoSection } from '../../../config-state/domain/entities/BunstartConfig';
import type { LoadConfigUseCase } from '../../../config-state/app/use-cases/LoadConfigUseCase';
import type { PatchConfigUseCase } from '../../../config-state/app/use-cases/PatchConfigUseCase';

export interface RemoveAppUseCaseProps {
	loadConfig: LoadConfigUseCase;
	patchConfig: PatchConfigUseCase;
}

function removeFromDependsOn(
	repo: RepoSection,
	removedId: string
): {
	newApps: Record<string, { name: string; dependsOn: string[] }>;
	newPackages: Record<string, { name: string; dependsOn: string[] }>;
} {
	const filterDep = (dep: string) => dep !== removedId;
	const newApps: Record<string, { name: string; dependsOn: string[] }> = {};
	for (const [id, e] of Object.entries(repo.apps)) {
		if (id !== removedId) {
			newApps[id] = createAppEntry(e.name, e.dependsOn.filter(filterDep));
		}
	}
	const newPackages: Record<string, { name: string; dependsOn: string[] }> = {};
	for (const [id, e] of Object.entries(repo.packages)) {
		newPackages[id] = createPackageEntry(e.name, e.dependsOn.filter(filterDep));
	}
	return { newApps, newPackages };
}

/**
 * Removes an app from the repo section, cleans dependsOn in all workspaces, and persists bunstart.config.
 */
export class RemoveAppUseCase {
	private readonly loadConfig: LoadConfigUseCase;
	private readonly patchConfig: PatchConfigUseCase;

	constructor({ loadConfig, patchConfig }: RemoveAppUseCaseProps) {
		this.loadConfig = loadConfig;
		this.patchConfig = patchConfig;
	}

	async execute(cwd: string, name: string): Promise<void> {
		const config = await this.loadConfig.execute(cwd);
		if (!config) {
			throw new Error(`No bunstart.config.ts found in ${cwd}`);
		}
		const repo = config.repo ?? { apps: {}, packages: {} };
		if (!repo.apps[name]) {
			throw new Error(`App "${name}" does not exist.`);
		}
		const { newApps, newPackages } = removeFromDependsOn(repo, name);
		await this.patchConfig.execute(cwd, {
			repo: { apps: newApps, packages: newPackages }
		});
	}
}
