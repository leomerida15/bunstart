import { DevServerConfig } from '../entities/DevServerConfig';
import { HotReloadConfig } from '../entities/HotReloadConfig';

/**
 * Port interface for the dev server.
 * Abstracts the HTTP server implementation.
 */
export interface DevServerPort {
	/**
	 * Start the development server.
	 */
	start(config: DevServerConfig): Promise<ServerHandle>;

	/**
	 * Stop the development server.
	 */
	stop(): Promise<void>;

	/**
	 * Check if server is running.
	 */
	isRunning(): boolean;
}

/**
 * ServerHandle provides control over a running server instance.
 */
export interface ServerHandle {
	/**
	 * The port the server is listening on.
	 */
	port: number;

	/**
	 * The host the server is bound to.
	 */
	host: string;

	/**
	 * The base URL of the server.
	 */
	url: string;

	/**
	 * Stop the server.
	 */
	stop(): Promise<void>;
}

/**
 * Port interface for file watching.
 * Abstracts the file system watcher implementation.
 */
export interface FileWatcherPort {
	/**
	 * Start watching files.
	 * @param paths Paths to watch (files or directories)
	 * @param callback Called when files change
	 */
	watch(paths: string[], callback: FileChangeCallback): Promise<WatcherHandle>;

	/**
	 * Stop watching.
	 */
	close(): Promise<void>;
}

/**
 * Callback invoked when watched files change.
 */
export type FileChangeCallback = (event: FileChangeEvent) => void;

/**
 * Event describing a file change.
 */
export interface FileChangeEvent {
	/** Type of change */
	type: 'add' | 'change' | 'unlink' | 'addDir' | 'unlinkDir';
	/** Path to the changed file */
	path: string;
	/** Timestamp of the change */
	timestamp: number;
}

/**
 * Handle for a file watcher.
 */
export interface WatcherHandle {
	/**
	 * Stop watching.
	 */
	close(): Promise<void>;

	/**
	 * Add more paths to watch.
	 */
	addPaths(paths: string[]): void;

	/**
	 * Remove paths from watching.
	 */
	unwatch(paths: string[]): void;
}

/**
 * Port interface for Hot Module Replacement connections.
 */
export interface HmrConnectionPort {
	/**
	 * Broadcast a message to all connected HMR clients.
	 */
	broadcast(message: HmrMessage): void;

	/**
	 * Get number of connected clients.
	 */
	getClientCount(): number;

	/**
	 * Register a connection handler.
	 */
	onConnect(callback: (clientId: string) => void): void;

	/**
	 * Register a disconnection handler.
	 */
	onDisconnect(callback: (clientId: string) => void): void;
}

/**
 * HMR protocol messages.
 */
export type HmrMessage =
	| HmrReloadMessage
	| HmrUpdateMessage
	| HmrErrorMessage
	| HmrReadyMessage;

export interface HmrReloadMessage {
	type: 'reload';
	reason?: string;
}

export interface HmrUpdateMessage {
	type: 'update';
	files: string[];
}

export interface HmrErrorMessage {
	type: 'error';
	message: string;
	stack?: string;
}

export interface HmrReadyMessage {
	type: 'ready';
	clientId: string;
}