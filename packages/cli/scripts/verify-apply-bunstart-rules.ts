/**
 * One-off verification: run ApplyBunstartRulesUseCase on a directory.
 * Usage: bun run scripts/verify-apply-bunstart-rules.ts [path]
 * Default path: .verify-init-sprint1
 */
import { resolve } from 'node:path';
import { InitCommandFactory } from '../src/modules/init/infra/factories/InitCommandFactory';

const cwd = process.argv[2]
	? resolve(process.cwd(), process.argv[2])
	: resolve(process.cwd(), '.verify-init-sprint1');

const useCase = InitCommandFactory.createApplyBunstartRulesUseCase();
await useCase.execute(cwd);
console.log('ApplyBunstartRules completed for', cwd);
