import type { MonorepoScaffolderPort } from '../../init/domain/ports/MonorepoScaffolder.port';
import { isNativeBunCommand } from '../domain/services/NativeBunCommands';
import { getScope, isWorkspaceAlias } from '../domain/services/WorkspaceResolver';
import type { LoadConfigUseCase } from '../../config-state/app/use-cases/LoadConfigUseCase';
import type { ResolveWorkspacesPort } from '../domain/ports/ResolveWorkspaces.port';
import type { AddAppUseCase } from './use-cases/AddAppUseCase';
import type { AddPackageUseCase } from './use-cases/AddPackageUseCase';
import type { RemoveAppUseCase } from './use-cases/RemoveAppUseCase';
import type { RemovePackageUseCase } from './use-cases/RemovePackageUseCase';
import type { EnsureDepsBuiltUseCase } from './use-cases/EnsureDepsBuiltUseCase';
import type { RunInWorkspaceUseCase } from './use-cases/RunInWorkspaceUseCase';
import type { SyncDependsOnFromPackageJsonUseCase } from './use-cases/SyncDependsOnFromPackageJsonUseCase';
import type { EnsureConfigSyncedUseCase } from './use-cases/EnsureConfigSyncedUseCase';
import type { AddWorkspaceDepUseCase } from './use-cases/AddWorkspaceDepUseCase';
import type { RemoveWorkspaceDepUseCase } from './use-cases/RemoveWorkspaceDepUseCase';
import type { RunBunInstallPort } from '../domain/ports/RunBunInstall.port';
import type { AdoptProjectUseCase } from './use-cases/AdoptProjectUseCase';
import type { CreateMonoRepoUseCase } from './use-cases/CreateMonoRepoUseCase';
import type { MigrateMonoRepoUseCase } from './use-cases/MigrateMonoRepoUseCase';
import type { SelectTemplateUseCase } from '../../init/app/use-cases/SelectTemplateUseCase';
import type { BootstrapApiRestUseCase } from '../../init/app/use-cases/BootstrapApiRestUseCase';
import type { BootstrapFrontendReactUseCase } from '../../init/app/use-cases/BootstrapFrontendReactUseCase';
import type { BootstrapLibraryUseCase } from '../../init/app/use-cases/BootstrapLibraryUseCase';
import type { PackageJsonPort } from '../../init/domain/ports/PackageJson.port';
import type { FilesystemPort } from '../../init/domain/ports/Filesystem.port';
import { join } from 'node:path';

export interface MonoCommandProps {
	loadConfig: LoadConfigUseCase;
	resolveWorkspaces: ResolveWorkspacesPort;
	addApp: AddAppUseCase;
	addPackage: AddPackageUseCase;
	removeApp: RemoveAppUseCase;
	removePackage: RemovePackageUseCase;
	ensureConfigSynced: EnsureConfigSyncedUseCase;
	ensureDepsBuilt: EnsureDepsBuiltUseCase;
	runInWorkspace: RunInWorkspaceUseCase;
	syncDependsOn: SyncDependsOnFromPackageJsonUseCase;
	addWorkspaceDep: AddWorkspaceDepUseCase;
	removeWorkspaceDep: RemoveWorkspaceDepUseCase;
	runBunInstall: RunBunInstallPort;
	adoptProject: AdoptProjectUseCase;
	scaffolder: MonorepoScaffolderPort;
	createMonoRepo: CreateMonoRepoUseCase;
	migrateMonoRepo: MigrateMonoRepoUseCase;
	selectTemplateUseCase: SelectTemplateUseCase;
	bootstrapApiRestUseCase: BootstrapApiRestUseCase;
	bootstrapFrontendReactUseCase: BootstrapFrontendReactUseCase;
	bootstrapLibraryUseCase: BootstrapLibraryUseCase;
	packageJson: PackageJsonPort;
	filesystem: FilesystemPort;
}

/**
 * Command for managing monorepo packages and applications.
 *
 * Handles subcommands: generate|gen app|pkg <name>, build <alias>, dev <alias>, start, sync.
 *
 * @class MonoCommand
 */
export class MonoCommand {
	private readonly loadConfig: LoadConfigUseCase;
	private readonly resolveWorkspaces: ResolveWorkspacesPort;
	private readonly addApp: AddAppUseCase;
	private readonly addPackage: AddPackageUseCase;
	private readonly removeApp: RemoveAppUseCase;
	private readonly removePackage: RemovePackageUseCase;
	private readonly ensureConfigSynced: EnsureConfigSyncedUseCase;
	private readonly ensureDepsBuilt: EnsureDepsBuiltUseCase;
	private readonly runInWorkspace: RunInWorkspaceUseCase;
	private readonly syncDependsOn: SyncDependsOnFromPackageJsonUseCase;
	private readonly addWorkspaceDep: AddWorkspaceDepUseCase;
	private readonly removeWorkspaceDep: RemoveWorkspaceDepUseCase;
	private readonly runBunInstall: RunBunInstallPort;
	private readonly adoptProject: AdoptProjectUseCase;
	private readonly scaffolder: MonorepoScaffolderPort;
	private readonly createMonoRepo: CreateMonoRepoUseCase;
	private readonly migrateMonoRepo: MigrateMonoRepoUseCase;
	private readonly selectTemplateUseCase: SelectTemplateUseCase;
	private readonly bootstrapApiRestUseCase: BootstrapApiRestUseCase;
	private readonly bootstrapFrontendReactUseCase: BootstrapFrontendReactUseCase;
	private readonly bootstrapLibraryUseCase: BootstrapLibraryUseCase;
	private readonly packageJson: PackageJsonPort;
	private readonly filesystem: FilesystemPort;

	constructor({
		loadConfig,
		resolveWorkspaces,
		addApp,
		addPackage,
		removeApp,
		removePackage,
		ensureConfigSynced,
		ensureDepsBuilt,
		runInWorkspace,
		syncDependsOn,
		addWorkspaceDep,
		removeWorkspaceDep,
		runBunInstall,
		adoptProject,
		scaffolder,
		createMonoRepo,
		migrateMonoRepo,
		selectTemplateUseCase,
		bootstrapApiRestUseCase,
		bootstrapFrontendReactUseCase,
		bootstrapLibraryUseCase,
		packageJson,
		filesystem
	}: MonoCommandProps) {
		this.loadConfig = loadConfig;
		this.resolveWorkspaces = resolveWorkspaces;
		this.addApp = addApp;
		this.addPackage = addPackage;
		this.removeApp = removeApp;
		this.removePackage = removePackage;
		this.ensureConfigSynced = ensureConfigSynced;
		this.ensureDepsBuilt = ensureDepsBuilt;
		this.runInWorkspace = runInWorkspace;
		this.syncDependsOn = syncDependsOn;
		this.addWorkspaceDep = addWorkspaceDep;
		this.removeWorkspaceDep = removeWorkspaceDep;
		this.runBunInstall = runBunInstall;
		this.adoptProject = adoptProject;
		this.scaffolder = scaffolder;
		this.createMonoRepo = createMonoRepo;
		this.migrateMonoRepo = migrateMonoRepo;
		this.selectTemplateUseCase = selectTemplateUseCase;
		this.bootstrapApiRestUseCase = bootstrapApiRestUseCase;
		this.bootstrapFrontendReactUseCase = bootstrapFrontendReactUseCase;
		this.bootstrapLibraryUseCase = bootstrapLibraryUseCase;
		this.packageJson = packageJson;
		this.filesystem = filesystem;
	}

	async execute(args: string[]): Promise<void> {
		if (!args.length) {
			await this.showUsage();
			return;
		}

		const subcommand = args[0];
		const extraArgs = args.slice(1);

		if (subcommand === 'create') {
			await this.createMonoRepo.execute(extraArgs[0]);
			return;
		}

		if (subcommand === 'migrate') {
			await this.migrateMonoRepo.execute(process.cwd());
			return;
		}

		if (subcommand === 'generate' || subcommand === 'gen') {
			await this.handleGenerate(extraArgs);
			return;
		}

		if (subcommand === 'build' || subcommand === 'dev' || subcommand === 'start') {
			await this.handleBuildOrDev(subcommand, extraArgs);
			return;
		}

		if (subcommand === 'sync') {
			await this.handleSync();
			return;
		}

		if (subcommand === 'remove') {
			await this.handleRemove(extraArgs);
			return;
		}

		if (subcommand === 'adopt') {
			await this.handleAdopt(extraArgs);
			return;
		}

		// Fallthrough: mono <alias> <cmd> [args...]
		const alias = subcommand;
		if (!alias || extraArgs.length === 0) {
			console.error('Usage: buns mono <alias> <script|cmd> [args...]');
			process.exit(1);
		}
		const cwd = process.cwd();
		const workspaces = await this.resolveWorkspaces.resolve(cwd);
		if (workspaces.length === 0) {
			console.error('No workspaces found. Ensure package.json has workspaces field.');
			process.exit(1);
		}
		if (!isWorkspaceAlias(workspaces, alias)) {
			console.error(`Unknown subcommand or workspace: ${alias}`);
			process.exit(1);
		}
		await this.handleRunInWorkspace(alias, extraArgs);
	}

	private async handleRunScript(
		script: 'build' | 'dev' | 'start',
		alias: string
	): Promise<void> {
		const cwd = process.cwd();
		const workspaces = await this.resolveWorkspaces.resolve(cwd);
		if (workspaces.length === 0) {
			console.error('No workspaces found. Ensure package.json has workspaces field.');
			process.exit(1);
		}
		if (!isWorkspaceAlias(workspaces, alias)) {
			console.error(`Unknown workspace: ${alias}`);
			process.exit(1);
		}
		try {
			await this.ensureConfigSynced.execute(cwd);
			await this.ensureDepsBuilt.execute(cwd, alias);
			await this.runInWorkspace.execute(cwd, alias, ['run', script]);
		} catch (err) {
			console.error(err instanceof Error ? err.message : String(err));
			process.exit(1);
		}
	}

	private async handleBuildOrDev(
		script: 'build' | 'dev' | 'start',
		args: string[]
	): Promise<void> {
		const alias = args[0];
		if (!alias?.trim()) {
			console.error(`Usage: buns mono ${script} <appAlias|pkgAlias>`);
			process.exit(1);
		}
		await this.handleRunScript(script, alias);
	}

	private async handleRunInWorkspace(
		workspaceId: string,
		args: string[]
	): Promise<void> {
		const cmd = args[0];
		if (!cmd) {
			console.error('Usage: buns mono <alias> <script|cmd> [args...]');
			process.exit(1);
		}
		if (cmd === 'add-dep' || cmd === 'a-dep') {
			await this.handleAddDep([workspaceId, ...args.slice(1)]);
			return;
		}
		if (
			cmd === 'remove-dep' ||
			cmd === 'rm-dep' ||
			cmd === 'r-dep'
		) {
			await this.handleRemoveDep([workspaceId, ...args.slice(1)]);
			return;
		}
		if (cmd === 'build' || cmd === 'dev' || cmd === 'start') {
			await this.handleRunScript(cmd, workspaceId);
			return;
		}
		const rest = args.slice(1);
		const bunArgs = isNativeBunCommand(cmd)
			? [cmd, ...rest]
			: ['run', cmd, ...rest];

		const cwd = process.cwd();
		try {
			await this.runInWorkspace.execute(cwd, workspaceId, bunArgs);
		} catch (err) {
			console.error(err instanceof Error ? err.message : String(err));
			process.exit(1);
		}
	}

	private async handleGenerate(args: string[]): Promise<void> {
		const typeArg = args[0];
		const name = args[1];
		// Flag to pre-select template (optional)
		// buns mono generate app my-app --template api-rest
		const templateFlagIdx = args.indexOf('--template');
		const templateFlagValue = templateFlagIdx !== -1 ? args[templateFlagIdx + 1] : undefined;

		if (!typeArg || (typeArg !== 'app' && typeArg !== 'pkg')) {
			console.error(
				'Usage: buns mono generate app <name> | buns mono generate pkg <name> (alias: gen)'
			);
			process.exit(1);
		}
		if (!name?.trim()) {
			console.error(
				'Missing workspace name. Example: buns mono generate app my-app or buns mono gen app my-app'
			);
			process.exit(1);
		}

		const cwd = process.cwd();
		const config = await this.loadConfig.execute(cwd);
		if (!config) {
			console.error('No bunstart.config.ts found. Run this from the monorepo root.');
			process.exit(1);
		}
		const repo = config.repo ?? { apps: {}, packages: {} };
		const scope = getScope(repo);
		if (!scope) {
			console.error('Could not determine monorepo scope from config.');
			process.exit(1);
		}

		const packageName = `@${scope}/${name}`;
		const targetDir = join(cwd, typeArg === 'app' ? 'apps' : 'packages', name);

		// Determine template
		let templateType = templateFlagValue;

		if (!templateType) {
			// If not specified, ask.
			// Ideally we want to filter templates based on type (app vs pkg)
			// For now, we show all compatible templates.
			const template = await this.selectTemplateUseCase.execute(`Select template for ${name}:`);
			if (!template) {
				console.log('Operation cancelled.');
				return;
			}
			templateType = template.type.value;
		}

		if (templateType === 'monorepo') {
			console.log('Cannot nest a monorepo inside a monorepo. Please choose another template.');
			process.exit(1);
		}

		try {
			await this.filesystem.ensureDir(targetDir);

			if (templateType === 'api-rest') {
				await this.bootstrapApiRestUseCase.execute(targetDir, packageName);
			} else if (templateType === 'frontend-react') {
				await this.bootstrapFrontendReactUseCase.execute(targetDir, packageName);
			} else if (templateType === 'library') {
				await this.bootstrapLibraryUseCase.execute(targetDir, packageName);
			} else {
				// Fallback to old behavior if somehow we get here, or maybe 'basic'
				// But currently scaffoldApp/Package creates specific 'example' templates.
				// Let's assume if the user wanted the basic one they might have selected something else or we treat 'default' as scaffoldApp

				// Actually, let's treat unknown templates by falling back to basic scaffolding if it matches 'basic' (custom) or if logic demands
				// But since we are selecting from a list, let's assume we covered the main ones.
				// If user manually typed --template something-else:
				console.log(`Template '${templateType}' not explicitly handled, falling back to basic scaffold...`);
				if (typeArg === 'app') {
					await this.scaffolder.scaffoldApp(cwd, name, scope);
				} else {
					await this.scaffolder.scaffoldPackage(cwd, name, scope);
				}
				// Basic scaffold handles package registration internally? No, addApp/addPackage call it.
				// Wait, the original code did:
				// await this.addApp.execute(cwd, name, packageName, []);
				// await this.scaffolder.scaffoldApp(cwd, name, scope);
				// await this.runBunInstall.execute(cwd);

				// So if we use basic scaffold, we must register it.
				// If we use bootstrap use cases, we ALSO must register it.
			}


			// Register in config
			if (typeArg === 'app') {
				await this.addApp.execute(cwd, name, packageName, []);
			} else {
				await this.addPackage.execute(cwd, name, packageName, []);
			}

			await this.runBunInstall.execute(cwd);
			console.log(`\n✅ ${typeArg === 'app' ? 'App' : 'Package'} "${name}" generated and registered.`);

		} catch (err) {
			console.error(err instanceof Error ? err.message : String(err));
			process.exit(1);
		}
	}

	private async handleRemove(args: string[]): Promise<void> {
		const typeArg = args[0];
		const name = args[1];
		if (typeArg !== 'app' && typeArg !== 'pkg') {
			console.error(
				'Usage: buns mono remove app <name> | buns mono remove pkg <name>'
			);
			process.exit(1);
		}
		if (!name?.trim()) {
			console.error('Missing workspace name.');
			process.exit(1);
		}

		const cwd = process.cwd();
		const config = await this.loadConfig.execute(cwd);
		if (!config) {
			console.error('No bunstart.config.ts found. Run this from the monorepo root.');
			process.exit(1);
		}
		const repo = config.repo ?? { apps: {}, packages: {} };
		if (typeArg === 'app') {
			if (!repo.apps[name]) {
				console.error(`App "${name}" does not exist.`);
				process.exit(1);
			}
		} else {
			if (!repo.packages[name]) {
				console.error(`Package "${name}" does not exist.`);
				process.exit(1);
			}
		}

		try {
			if (typeArg === 'app') {
				await this.removeApp.execute(cwd, name);
				console.log(`\n✅ App "${name}" removed from config.`);
			} else {
				await this.removePackage.execute(cwd, name);
				console.log(`\n✅ Package "${name}" removed from config.`);
			}
		} catch (err) {
			console.error(err instanceof Error ? err.message : String(err));
			process.exit(1);
		}
	}

	private async handleAdopt(args: string[]): Promise<void> {
		if (args.length < 2) {
			this.printAdoptUsage();
			process.exit(1);
		}
		const typeArg = args[0];
		const name = args[1]!;
		if (typeArg !== 'app' && typeArg !== 'pkg') {
			this.printAdoptUsage();
			process.exit(1);
		}
		let sourcePath: string | undefined;
		const rest = args.slice(2);
		const fromIdx = rest.indexOf('--from');
		if (fromIdx !== -1) {
			if (fromIdx + 1 >= rest.length || rest[fromIdx + 1]!.startsWith('-')) {
				console.error('Missing path after --from.');
				this.printAdoptUsage();
				process.exit(1);
			}
			sourcePath = rest[fromIdx + 1];
		} else if (rest.length === 1 && !rest[0]!.startsWith('-')) {
			sourcePath = rest[0];
		}
		const cwd = process.cwd();
		try {
			await this.adoptProject.execute(cwd, typeArg, name, sourcePath);
			const config = await this.loadConfig.execute(cwd);
			const repo = config?.repo ?? { apps: {}, packages: {} };
			const scope = getScope(repo);
			const packageName = scope ? `@${scope}/${name}` : name;
			console.log(
				`\n✅ Adopted ${typeArg}/${name} as ${packageName}.`
			);
		} catch (err) {
			console.error(err instanceof Error ? err.message : String(err));
			process.exit(1);
		}
	}

	private printAdoptUsage(): void {
		console.error(
			'Usage: buns mono adopt app <name> [--from <path>] | buns mono adopt pkg <name> [--from <path>]'
		);
	}

	private parseAddDepFlags(args: string[]): {
		target: string;
		source: string;
		dev: boolean;
		peer: boolean;
		optional: boolean;
		exact: boolean;
	} {
		if (args.length < 2) {
			console.error(
				'Usage: buns mono <alias> add-dep | a-dep <source> [--dev|--peer|--optional|--exact]'
			);
			process.exit(1);
		}
		const target = args[0]!;
		const source = args[1]!;
		const rest = args.slice(2);
		let dev = false;
		let peer = false;
		let optional = false;
		let exact = false;
		for (const a of rest) {
			if (a === '--dev' || a === '-d') dev = true;
			else if (a === '--peer') peer = true;
			else if (a === '--optional') optional = true;
			else if (a === '--exact' || a === '-E') exact = true;
		}
		return { target, source, dev, peer, optional, exact };
	}

	private async handleAddDep(args: string[]): Promise<void> {
		const { target, source, dev, peer, optional, exact } = this.parseAddDepFlags(args);
		const cwd = process.cwd();
		try {
			await this.addWorkspaceDep.execute(cwd, target, source, {
				dev,
				peer,
				optional,
				exact
			});
			const tipo = peer ? 'peer' : optional ? 'optional' : dev ? 'dev' : 'dependencies';
			console.log(`\n✅ Added ${source} to ${target} (${tipo}). Config synced.`);
		} catch (err) {
			console.error(err instanceof Error ? err.message : String(err));
			process.exit(1);
		}
	}

	private async handleRemoveDep(args: string[]): Promise<void> {
		if (args.length < 2) {
			console.error(
				'Usage: buns mono <alias> remove-dep | rm-dep | r-dep <source>'
			);
			process.exit(1);
		}
		const target = args[0]!;
		const source = args[1]!;
		const cwd = process.cwd();
		try {
			await this.removeWorkspaceDep.execute(cwd, target, source);
			console.log(`\n✅ Removed ${source} from ${target}. Config synced.`);
		} catch (err) {
			console.error(err instanceof Error ? err.message : String(err));
			process.exit(1);
		}
	}

	private async handleSync(): Promise<void> {
		const cwd = process.cwd();
		const workspaces = await this.resolveWorkspaces.resolve(cwd);
		if (workspaces.length === 0) {
			console.error(
				'No workspaces found. Ensure package.json has workspaces field.'
			);
			process.exit(1);
		}
		for (const w of workspaces) {
			try {
				await this.syncDependsOn.execute(cwd, w.id);
			} catch {
				// Skip workspace if sync fails (e.g. no package.json)
			}
		}
		console.log('\n✅ Synced dependsOn from package.json for all workspaces.');
	}

	private async showUsage(): Promise<void> {
		console.log('\nUsage: buns mono <subcommand> [options]');
		console.log('       buns mono create [name]     Create a new project directory and run init inside it');
		console.log('       buns mono migrate           Migrate an existing monorepo to bunstart structure');
		console.log(
			'       buns mono generate app <name>   Generate and register a new app (alias: gen)'
		);
		console.log(
			'       buns mono generate pkg <name>   Generate and register a new package (alias: gen)'
		);
		console.log('       buns mono build <alias>     Build workspace (alias: mono <alias> build)');
		console.log('       buns mono dev <alias>       Run dev script (alias: mono <alias> dev)');
		console.log('       buns mono start <alias>     Run start script (alias: mono <alias> start)');
		console.log('       buns mono sync              Sync dependsOn from package.json for all workspaces');
		console.log(
			'       buns mono <alias> add-dep | a-dep <source> [--dev|--peer|--optional|--exact] Add workspace as dependency and sync config'
		);
		console.log(
			'       buns mono <alias> remove-dep | rm-dep | r-dep <source> Remove workspace dependency and sync config'
		);
		console.log('       buns mono adopt app <name> [--from <path>]   Adopt app (in-place or copy from path)');
		console.log('       buns mono adopt pkg <name> [--from <path>]   Adopt package (in-place or copy from path)');
		console.log('       buns mono remove app <name> Remove app from config');
		console.log('       buns mono remove pkg <name> Remove package from config');
		console.log('       buns mono <alias> <script>  Run script in workspace (e.g. buns mono app-example test)');
		console.log('       buns mono <alias> add <pkg> Run bun command in workspace (e.g. buns mono app-example add lodash)');

		const cwd = process.cwd();
		const workspaces = await this.resolveWorkspaces.resolve(cwd);
		if (workspaces.length > 0) {
			console.log('\nWorkspaces (from package.json):');
			for (const w of workspaces) {
				console.log(`  - ${w.id} (${w.dir}/${w.id})`);
			}
		}
	}
}
