import { InitCommandFactory } from './infrastructure/factories/InitCommandFactory';
import { MonoCommandFactory } from './infrastructure/factories/MonoCommandFactory';

/**
 * Displays the help message for the CLI.
 *
 */
function showHelp() {
	console.log(`
Bunpack CLI - Project Initialization and Monorepo Management Tool

Usage:
  bunp <command> [options]

Commands:
  init                    Initialize a new project with a template
                          Templates: monorepo, api-rest, frontend-react, library

  mono <subcommand>       Manage monorepo packages and apps
    <appName|libName>     Select a package or app to work with
    start                 Run start script for selected package/app
    dev                   Run dev script for selected package/app
    build                 Run build script for selected package/app
    generate <type>       Generate a new app or package
      app <name>          Create a new app in the monorepo
      pkg <name>          Create a new package in the monorepo

Options:
  -h, --help              Show this help message
  -v, --version           Show version information

Examples:
  bunp init
  bunp mono my-app
  bunp mono generate app new-app
  bunp mono generate pkg shared-utils
  bunp mono start
`);
}

/**
 * Displays version information.
 *
 * @returns {void}
 */
function showVersion(): void {
	// Version could be read from package.json in the future
	console.log('Bunpack CLI v0.1.0');
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

			default:
				console.error(`Error: Unknown command "${command}".`);
				console.log('\nRun "bunp --help" to see available commands.');
				process.exit(1);
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
