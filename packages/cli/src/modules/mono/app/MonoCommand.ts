import type { MonorepoScaffolderPort } from '../../init/domain/ports/MonorepoScaffolder.port';
import { getScope, isWorkspaceAlias } from '../../repo-state/domain/entities/RepoState';
import type { AddAppUseCase } from '../../repo-state/app/use-cases/AddAppUseCase';
import type { AddPackageUseCase } from '../../repo-state/app/use-cases/AddPackageUseCase';
import type { EnsureDepsBuiltUseCase } from '../../repo-state/app/use-cases/EnsureDepsBuiltUseCase';
import type { LoadRepoStateUseCase } from '../../repo-state/app/use-cases/LoadRepoStateUseCase';
import type { RunInWorkspaceUseCase } from '../../repo-state/app/use-cases/RunInWorkspaceUseCase';
import type { SyncDependsOnFromPackageJsonUseCase } from '../../repo-state/app/use-cases/SyncDependsOnFromPackageJsonUseCase';

export interface MonoCommandProps {
	loadRepoState: LoadRepoStateUseCase;
	addApp: AddAppUseCase;
	addPackage: AddPackageUseCase;
	ensureDepsBuilt: EnsureDepsBuiltUseCase;
	runInWorkspace: RunInWorkspaceUseCase;
	syncDependsOn: SyncDependsOnFromPackageJsonUseCase;
	scaffolder: MonorepoScaffolderPort;
}

/**
 * Command for managing monorepo packages and applications.
 *
 * Handles subcommands: add app|pkg <name>, build <alias>, dev <alias>, start, generate.
 *
 * @class MonoCommand
 */
export class MonoCommand {
	private readonly loadRepoState: LoadRepoStateUseCase;
	private readonly addApp: AddAppUseCase;
	private readonly addPackage: AddPackageUseCase;
	private readonly ensureDepsBuilt: EnsureDepsBuiltUseCase;
	private readonly runInWorkspace: RunInWorkspaceUseCase;
	private readonly syncDependsOn: SyncDependsOnFromPackageJsonUseCase;
	private readonly scaffolder: MonorepoScaffolderPort;

	constructor({
		loadRepoState,
		addApp,
		addPackage,
		ensureDepsBuilt,
		runInWorkspace,
		syncDependsOn,
		scaffolder
	}: MonoCommandProps) {
		this.loadRepoState = loadRepoState;
		this.addApp = addApp;
		this.addPackage = addPackage;
		this.ensureDepsBuilt = ensureDepsBuilt;
		this.runInWorkspace = runInWorkspace;
		this.syncDependsOn = syncDependsOn;
		this.scaffolder = scaffolder;
	}

	async execute(args: string[]): Promise<void> {
		if (!args.length) {
			this.showUsage();
			return;
		}

		const subcommand = args[0];
		const extraArgs = args.slice(1);

		if (subcommand === 'add') {
			await this.handleAdd(extraArgs);
			return;
		}

		if (subcommand === 'build' || subcommand === 'dev') {
			await this.handleBuildOrDev(subcommand, extraArgs);
			return;
		}

		if (subcommand === 'sync') {
			await this.handleSync();
			return;
		}

		console.log(`\n📦 Mono Command: ${subcommand} ${extraArgs.join(' ')}`);
		console.log('Orchestrating monorepo tasks...');
	}

	private async handleBuildOrDev(
		script: 'build' | 'dev',
		args: string[]
	): Promise<void> {
		const workspaceId = args[0];
		if (!workspaceId?.trim()) {
			console.error(`Usage: buns mono ${script} <appAlias|pkgAlias>`);
			process.exit(1);
		}

		const cwd = process.cwd();
		const state = await this.loadRepoState.execute(cwd);
		if (!state || !isWorkspaceAlias(state, workspaceId)) {
			console.error(`Unknown workspace: ${workspaceId}`);
			process.exit(1);
		}

		try {
			await this.ensureDepsBuilt.execute(cwd, workspaceId);
			await this.runInWorkspace.execute(cwd, workspaceId, ['run', script]);
		} catch (err) {
			console.error(err instanceof Error ? err.message : String(err));
			process.exit(1);
		}
	}

	private async handleAdd(args: string[]): Promise<void> {
		const typeArg = args[0];
		const name = args[1];
		if (!typeArg || (typeArg !== 'app' && typeArg !== 'pkg')) {
			console.error('Usage: buns mono add app <name> | buns mono add pkg <name>');
			process.exit(1);
		}
		if (!name?.trim()) {
			console.error('Missing workspace name. Example: buns mono add app my-app');
			process.exit(1);
		}

		const cwd = process.cwd();
		const state = await this.loadRepoState.execute(cwd);
		if (!state) {
			console.error('No bunstart.config.ts found. Run this from the monorepo root.');
			process.exit(1);
		}

		const scope = getScope(state);
		if (!scope) {
			console.error('Could not determine monorepo scope from config.');
			process.exit(1);
		}

		const packageName = `@${scope}/${name}`;

		try {
			if (typeArg === 'app') {
				await this.addApp.execute(cwd, name, packageName, []);
				await this.scaffolder.scaffoldApp(cwd, name, scope);
				console.log(`\n✅ App "${name}" added and scaffolded.`);
			} else {
				await this.addPackage.execute(cwd, name, packageName, []);
				await this.scaffolder.scaffoldPackage(cwd, name, scope);
				console.log(`\n✅ Package "${name}" added and scaffolded.`);
			}
		} catch (err) {
			console.error(err instanceof Error ? err.message : String(err));
			process.exit(1);
		}
	}

	private async handleSync(): Promise<void> {
		const cwd = process.cwd();
		const state = await this.loadRepoState.execute(cwd);
		if (!state) {
			console.error('No bunstart.config.ts found. Run this from the monorepo root.');
			process.exit(1);
		}

		const ids = [
			...Object.keys(state.apps),
			...Object.keys(state.packages)
		];
		for (const id of ids) {
			try {
				await this.syncDependsOn.execute(cwd, id);
			} catch {
				// Skip workspace if sync fails (e.g. no package.json)
			}
		}
		console.log('\n✅ Synced dependsOn from package.json for all workspaces.');
	}

	private showUsage(): void {
		console.log('\nUsage: buns mono <subcommand> [options]');
		console.log('       buns mono add app <name>   Add a new app');
		console.log('       buns mono add pkg <name>   Add a new package');
		console.log('       buns mono build <alias>     Build workspace and its dependencies');
		console.log('       buns mono dev <alias>        Run dev script (builds deps first)');
		console.log('       buns mono sync                Sync dependsOn from package.json for all workspaces');
		console.log('       buns mono <appName|pkgName> [script]');
	}
}
