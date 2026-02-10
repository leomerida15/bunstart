import { createAppEntry } from '../../domain/entities/AppEntry';
import { isReserved } from '../../domain/services/ReservedNames';
import type { LoadConfigUseCase } from '../../../config-state/app/use-cases/LoadConfigUseCase';
import type { PatchConfigUseCase } from '../../../config-state/app/use-cases/PatchConfigUseCase';

export interface AddAppUseCaseProps {
	loadConfig: LoadConfigUseCase;
	patchConfig: PatchConfigUseCase;
}

/**
 * Adds a new app to the repo section and persists bunstart.config.
 * Does not create files; callers are responsible for scaffolding the app directory.
 */
export class AddAppUseCase {
	private readonly loadConfig: LoadConfigUseCase;
	private readonly patchConfig: PatchConfigUseCase;

	constructor({ loadConfig, patchConfig }: AddAppUseCaseProps) {
		this.loadConfig = loadConfig;
		this.patchConfig = patchConfig;
	}

	async execute(
		cwd: string,
		name: string,
		packageName: string,
		dependsOn: string[] = []
	): Promise<void> {
		const config = await this.loadConfig.execute(cwd);
		if (!config) {
			throw new Error(`No bunstart.config.ts found in ${cwd}`);
		}
		if (isReserved(name)) {
			throw new Error(`"${name}" is a reserved name. Choose a different workspace name.`);
		}
		const repo = config.repo ?? { apps: {}, packages: {} };
		if (repo.apps[name]) {
			throw new Error(`App "${name}" already exists.`);
		}

		const newApps = { ...repo.apps, [name]: createAppEntry(packageName, dependsOn) };
		await this.patchConfig.execute(cwd, {
			repo: { apps: newApps, packages: repo.packages }
		});
	}
}
