import * as path from 'node:path';
import type {
	FileWatcherPort,
	FileChangeEvent,
	WatcherHandle,
} from '../../domain/ports/DevServer.port';
import { DevServerConfig } from '../../domain/entities/DevServerConfig';

/**
 * Input for watching files.
 */
export interface WatchFilesInput {
	/** Paths to watch */
	paths: string[];
	/** Callback when files change */
	onChange: (event: FileChangeEvent) => void;
	/** Debounce delay in ms */
	debounceMs?: number;
}

/**
 * Output from watching files.
 */
export interface WatchFilesOutput {
	/** Watcher handle */
	watcher: WatcherHandle;
	/** Paths being watched */
	watchedPaths: string[];
}

/**
 * Use case for watching file changes and triggering rebuilds.
 */
export class WatchFilesUseCase {
	constructor(
		private readonly watcherAdapter: FileWatcherPort,
		private readonly config: DevServerConfig,
	) {}

	async execute(input: WatchFilesInput): Promise<WatchFilesOutput> {
		const { paths, onChange, debounceMs = 100 } = input;

		// Resolve paths relative to config
		const resolvedPaths = paths.map(p => {
			if (path.isAbsolute(p)) return p;
			return path.resolve(process.cwd(), p);
		});

		// Apply debouncing to the callback
		let debounceTimer: ReturnType<typeof setTimeout> | null = null;
		const debouncedCallback = (event: FileChangeEvent) => {
			if (debounceTimer) {
				clearTimeout(debounceTimer);
			}
			debounceTimer = setTimeout(() => {
				console.log(`[Watcher] File changed: ${event.path}`);
				onChange(event);
			}, debounceMs);
		};

		const watcher = await this.watcherAdapter.watch(resolvedPaths, debouncedCallback);

		console.log(`[Watcher] Watching ${resolvedPaths.join(', ')}`);

		return {
			watcher,
			watchedPaths: resolvedPaths,
		};
	}

	/**
	 * Stop watching.
	 */
	async stop(): Promise<void> {
		await this.watcherAdapter.close();
	}
}