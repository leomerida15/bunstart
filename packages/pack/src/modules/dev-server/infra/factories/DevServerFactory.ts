import { BunServeAdapter } from '../adapters/BunServeAdapter';
import { FsWatcherAdapter } from '../adapters/FsWatcherAdapter';
import type { DevServerPort } from '../../domain/ports/DevServer.port';
import { StartDevServerUseCase } from '../../app/use-cases/StartDevServerUseCase';
import { WatchFilesUseCase } from '../../app/use-cases/WatchFilesUseCase';
import type { DevServerConfig } from '../../domain/entities/DevServerConfig';

/**
 * Factory for creating dev-server components.
 * Provides dependency injection following hexagonal architecture.
 */
export class DevServerFactory {
	private static serverAdapter: DevServerPort | null = null;
	private static watcherAdapter: FsWatcherAdapter | null = null;

	/**
	 * Get or create the server adapter (singleton).
	 */
	static getServerAdapter(): DevServerPort {
		if (!this.serverAdapter) {
			this.serverAdapter = new BunServeAdapter();
		}
		return this.serverAdapter;
	}

	/**
	 * Get or create the watcher adapter (singleton).
	 */
	static getWatcherAdapter(): FsWatcherAdapter {
		if (!this.watcherAdapter) {
			this.watcherAdapter = new FsWatcherAdapter();
		}
		return this.watcherAdapter;
	}

	/**
	 * Create the StartDevServerUseCase.
	 */
	static createStartDevServerUseCase(): StartDevServerUseCase {
		return new StartDevServerUseCase(this.getServerAdapter());
	}

	/**
	 * Create the WatchFilesUseCase.
	 */
	static createWatchFilesUseCase(config: DevServerConfig): WatchFilesUseCase {
		return new WatchFilesUseCase(this.getWatcherAdapter(), config);
	}

	/**
	 * Reset all adapters (useful for testing).
	 */
	static reset(): void {
		this.serverAdapter = null;
		this.watcherAdapter = null;
	}
}