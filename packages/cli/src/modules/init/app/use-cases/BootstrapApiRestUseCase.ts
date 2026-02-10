import type { BunRuntimePort } from '../../domain/ports/BunRuntime.port';
import type { ApplyBunstartRulesUseCase } from './ApplyBunstartRulesUseCase';

export interface BootstrapApiRestUseCaseProps {
	bunRuntime: BunRuntimePort;
	applyBunstartRules: ApplyBunstartRulesUseCase;
}

/**
 * Use case for bootstrapping an API REST single-package project:
 * bun init -y, apply bunstart rules, bun install.
 *
 * @class BootstrapApiRestUseCase
 */
export class BootstrapApiRestUseCase {
	private readonly bunRuntime: BunRuntimePort;
	private readonly applyBunstartRules: ApplyBunstartRulesUseCase;

	constructor({
		bunRuntime,
		applyBunstartRules
	}: BootstrapApiRestUseCaseProps) {
		this.bunRuntime = bunRuntime;
		this.applyBunstartRules = applyBunstartRules;
	}

	public async execute(cwd: string, projectName: string): Promise<void> {
		console.log('\nRunning bun init...');
		await this.bunRuntime.initBlank(cwd);

		console.log('\nApplying bunstart rules...');
		await this.applyBunstartRules.execute(cwd, { projectName });

		console.log('\nInstalling dependencies...');
		await this.bunRuntime.installDependencies(cwd);

		console.log('\nAPI REST project bootstrapped successfully.');
	}
}
