import { join } from 'node:path';
import type { BunRuntimePort } from '../../domain/ports/BunRuntime.port';
import type { FilesystemPort } from '../../domain/ports/Filesystem.port';
import type { UserInterfacePort } from '../../domain/ports/UserInterface.port';
import type { ApplyBunstartRulesUseCase } from './ApplyBunstartRulesUseCase';

export interface BootstrapFrontendReactUseCaseProps {
	bunRuntime: BunRuntimePort;
	userInterface: UserInterfacePort;
	filesystem: FilesystemPort;
	applyBunstartRules: ApplyBunstartRulesUseCase;
}

/**
 * Use case for bootstrapping a Frontend React single-package project:
 * bun init --react (variant), apply bunstart rules, bun install.
 *
 * @class BootstrapFrontendReactUseCase
 */
export class BootstrapFrontendReactUseCase {
	private readonly bunRuntime: BunRuntimePort;
	private readonly userInterface: UserInterfacePort;
	private readonly filesystem: FilesystemPort;
	private readonly applyBunstartRules: ApplyBunstartRulesUseCase;

	constructor({
		bunRuntime,
		userInterface,
		filesystem,
		applyBunstartRules
	}: BootstrapFrontendReactUseCaseProps) {
		this.bunRuntime = bunRuntime;
		this.userInterface = userInterface;
		this.filesystem = filesystem;
		this.applyBunstartRules = applyBunstartRules;
	}

	public async execute(cwd: string, projectName: string): Promise<void> {
		const variant = await this.userInterface.selectReactVariant(
			'React variant:'
		);
		if (variant === null) {
			console.log('\nOperation cancelled.');
			return;
		}

		console.log(`\nRunning bun init (React${variant === 'react' ? '' : ` + ${variant}`})...`);
		await this.bunRuntime.initReact(cwd, variant);

		await this.filesystem.deleteFile(join(cwd, 'build.ts'));

		console.log('\nApplying bunstart rules...');
		await this.applyBunstartRules.execute(cwd, {
			entryExt: 'ts',
			projectName,
			projectType: 'frontend',
			startCommand: 'bun run -b src/index.ts'
		});

		console.log('\nInstalling dependencies...');
		await this.bunRuntime.installDependencies(cwd);

		console.log('\nFrontend React project bootstrapped successfully.');
	}
}
