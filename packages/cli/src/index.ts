import { InitCommandFactory } from './modules/init/infra/factories/InitCommandFactory';
import { MonoCommandFactory } from './modules/mono/infra/factories/MonoCommandFactory';
import { ConfigUseCasesFactory } from './modules/config-state/infra/factories/ConfigUseCasesFactory';
import { isNativeBunCommand } from './modules/mono/domain/services/NativeBunCommands';
import { isWorkspaceAliasFromConfig } from './modules/mono/domain/services/WorkspaceResolver';

/**
 * Displays the help message for the CLI.
 */
function showHelp() {
	console.log(`
bunstart CLI - Project Initialization and Monorepo Management Tool

Usage:
  buns <command> [options]
  buns <appAlias|pkgAlias> [...commands]   Run command in a workspace (e.g. buns app-example build)

Commands:
  init                    Initialize a new project with a template
                          Templates: monorepo, api-rest, frontend-react, library

  mono <subcommand>       Manage monorepo packages and apps
    generate app <name>   Generate and register a new app (alias: gen)
    generate pkg <name>   Generate and register a new package (alias: gen)
    start                 Run start script for selected package/app
    dev                   Run dev script for selected package/app
    build                 Run build script for selected package/app

Options:
  -h, --help              Show this help message
  -v, --version           Show version information

Examples:
  buns init
  buns app-example build
  buns mono generate app my-app
  buns mono gen pkg shared-utils
  buns mono start
`);
}

/**
 * Displays version information.
 *
 * @returns {void}
 */
function showVersion(): void {
	// Version could be read from package.json in the future
	console.log('bunstart CLI v0.1.0');
}

/**
 * Handles the init command.
 *
 * @returns {Promise<void>}
 */
async function handleInitCommand(): Promise<void> {
	const initCommand = InitCommandFactory.create();
	await initCommand.execute();
}

/**
 * Handles the mono command with its subcommands.
 *
 * @param {string[]} args - Command arguments
 * @returns {Promise<void>}
 */
async function handleMonoCommand(args: string[]): Promise<void> {
	const monoCommand = MonoCommandFactory.create();
	await monoCommand.execute(args);
}

/**
 * Main entry point for the CLI.
 *
 * Parses command line arguments and routes to appropriate command handlers.
 *
 * @returns {Promise<void>}
 */
async function main(): Promise<void> {
	const args = process.argv.slice(2);

	// Handle no arguments or help flag
	if (args.length === 0 || args[0] === '--help' || args[0] === '-h') {
		showHelp();
		return;
	}

	// Handle version flag
	if (args[0] === '--version' || args[0] === '-v') {
		showVersion();
		return;
	}

	const command = args[0];
	const commandArgs = args.slice(1);

	try {
		switch (command) {
			case 'init':
				await handleInitCommand();
				break;

			case 'mono':
				await handleMonoCommand(commandArgs);
				break;

			default: {
				if (!command) {
					console.error('Error: No command provided.');
					process.exit(1);
				}
				// Try run: buns <alias> [...commands] when in a monorepo with bunstart.config
				const loadConfig = ConfigUseCasesFactory.createLoadConfigUseCase();
				const config = await loadConfig.execute(process.cwd());
				if (isWorkspaceAliasFromConfig(config, command)) {
					const cwd = process.cwd();
					// Ensure dependencies are built before build/dev/start
					const isBuildOrDev =
						commandArgs[0] === 'build' ||
						commandArgs[0] === 'dev' ||
						commandArgs[0] === 'start' ||
						(commandArgs[0] === 'run' &&
							(commandArgs[1] === 'build' ||
								commandArgs[1] === 'dev' ||
								commandArgs[1] === 'start'));
					if (isBuildOrDev) {
						const ensureConfigSynced =
							MonoCommandFactory.createEnsureConfigSyncedUseCase();
						await ensureConfigSynced.execute(cwd);
						const ensureDepsBuilt =
							MonoCommandFactory.createEnsureDepsBuiltUseCase();
						await ensureDepsBuilt.execute(cwd, command);
					}
					const runInWorkspace = MonoCommandFactory.createRunInWorkspaceUseCase();
					// Native bun commands: no "run" prefix. Scripts: prepend "run"
					let runArgs: string[];
					if (
						commandArgs.length > 0 &&
						isNativeBunCommand(commandArgs[0])
					) {
						runArgs = commandArgs;
					} else if (
						commandArgs.length > 0 &&
						commandArgs[0] !== 'run'
					) {
						runArgs = ['run', ...commandArgs];
					} else {
						runArgs = commandArgs;
					}
					await runInWorkspace.execute(cwd, command, runArgs);
				} else {
					console.error(`Error: Unknown command "${command}".`);
					console.log('\nRun "buns --help" to see available commands.');
					process.exit(1);
				}
				break;
			}
		}
	} catch (error) {
		console.error('\n❌ An error occurred:');
		console.error(error instanceof Error ? error.message : String(error));
		process.exit(1);
	}
}

// Execute main function
main().catch((error) => {
	console.error('Fatal error:', error);
	process.exit(1);
});
