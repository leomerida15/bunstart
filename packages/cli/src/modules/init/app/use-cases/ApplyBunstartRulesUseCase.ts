import type { ApplyBunstartRulesPort } from '../../domain/ports/ApplyBunstartRules.port';

export interface ApplyBunstartRulesUseCaseProps {
	applyBunstartRules: ApplyBunstartRulesPort;
}

/**
 * Use case for applying bunstart rules to a single-package project.
 *
 * Delegates to ApplyBunstartRulesPort (move entry to src/, add build/watch
 * files, patch package.json).
 *
 * @class ApplyBunstartRulesUseCase
 */
export class ApplyBunstartRulesUseCase {
	private readonly applyBunstartRules: ApplyBunstartRulesPort;

	constructor({ applyBunstartRules }: ApplyBunstartRulesUseCaseProps) {
		this.applyBunstartRules = applyBunstartRules;
	}

	public async execute(
		cwd: string,
		options?: {
			entryExt?: 'ts' | 'tsx';
			projectName?: string;
			projectType?: 'backend' | 'frontend';
			startCommand?: string;
		}
	): Promise<void> {
		await this.applyBunstartRules.execute(cwd, options);
	}
}
