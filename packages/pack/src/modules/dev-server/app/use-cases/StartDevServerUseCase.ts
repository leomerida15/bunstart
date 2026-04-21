import type { DevServerPort, ServerHandle } from '../../domain/ports/DevServer.port';
import { DevServerConfig } from '../../domain/entities/DevServerConfig';
import { HotReloadConfig } from '../../domain/entities/HotReloadConfig';

/**
 * Input for starting the dev server.
 */
export interface StartDevServerInput {
	/** Dev server configuration */
	config: DevServerConfig;
	/** HMR configuration */
	hmrConfig: HotReloadConfig;
}

/**
 * Output from starting the dev server.
 */
export interface StartDevServerOutput {
	/** Server handle with control methods */
	server: ServerHandle;
	/** HMR WebSocket URL */
	hmrUrl?: string;
}

/**
 * Use case for starting the development server.
 * Orchestrates HTTP server and HMR connections.
 */
export class StartDevServerUseCase {
	constructor(private readonly serverAdapter: DevServerPort) {}

	async execute(input: StartDevServerInput): Promise<StartDevServerOutput> {
		const { config, hmrConfig } = input;

		// Start the HTTP server
		const server = await this.serverAdapter.start(config);

		// If HMR is enabled, construct the WebSocket URL
		let hmrUrl: string | undefined;
		if (hmrConfig.enabled) {
			hmrUrl = `ws://${config.hostString}:${config.portNumber}${config.hmrPath}`;
		}

		console.log(`[DevServer] Started at ${server.url}`);
		if (hmrUrl) {
			console.log(`[DevServer] HMR WebSocket at ${hmrUrl}`);
		}

		return {
			server,
			hmrUrl,
		};
	}
}