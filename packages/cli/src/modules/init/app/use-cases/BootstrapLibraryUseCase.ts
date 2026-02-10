import type { BunRuntimePort } from '../../domain/ports/BunRuntime.port';
import type { ApplyBunstartRulesUseCase } from './ApplyBunstartRulesUseCase';

export interface BootstrapLibraryUseCaseProps {
	bunRuntime: BunRuntimePort;
	applyBunstartRules: ApplyBunstartRulesUseCase;
}

/**
 * Use case for bootstrapping a Library single-package project:
 * bun init (library/blank), apply bunstart rules, bun install.
 *
 * @class BootstrapLibraryUseCase
 */
export class BootstrapLibraryUseCase {
	private readonly bunRuntime: BunRuntimePort;
	private readonly applyBunstartRules: ApplyBunstartRulesUseCase;

	constructor({
		bunRuntime,
		applyBunstartRules
	}: BootstrapLibraryUseCaseProps) {
		this.bunRuntime = bunRuntime;
		this.applyBunstartRules = applyBunstartRules;
	}

	public async execute(cwd: string, projectName: string): Promise<void> {
		console.log('\nRunning bun init (Library)...');
		await this.bunRuntime.initLibrary(cwd);

		console.log('\nApplying bunstart rules...');
		await this.applyBunstartRules.execute(cwd, { projectName });

		console.log('\nInstalling dependencies...');
		await this.bunRuntime.installDependencies(cwd);

		console.log('\nLibrary project bootstrapped successfully.');
	}
}
