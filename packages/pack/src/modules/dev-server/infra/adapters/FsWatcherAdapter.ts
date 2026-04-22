import * as fs from 'node:fs';
import * as path from 'node:path';
import type {
	FileWatcherPort,
	FileChangeCallback,
	FileChangeEvent,
	WatcherHandle,
} from '../../domain/ports/DevServer.port';
import { DevServerError } from '../../domain/entities/DevServerError';

/**
 * FsWatcherAdapter implements FileWatcherPort using node:fs.watch().
 */
export class FsWatcherAdapter implements FileWatcherPort {
	private watchers: fs.FSWatcher[] = [];
	private callback: FileChangeCallback | null = null;

	async watch(paths: string[], callback: FileChangeCallback): Promise<WatcherHandle> {
		if (this.callback) {
			throw new DevServerError('Watcher already active', 'WATCHER_ACTIVE');
		}

		this.callback = callback;

		const watchedPaths: string[] = [];

		for (const p of paths) {
			try {
				const stats = await fs.promises.stat(p);
				const watchPath = stats.isDirectory() ? p : path.dirname(p);

				const watcher = fs.watch(watchPath, { recursive: true }, (eventType, filename) => {
					if (!filename) return;

					// Only handle change events (not rename)
					if (eventType !== 'change') return;

					// Resolve the full path
					const fullPath = path.join(watchPath, filename);

					// Check if it's a file we care about
					fs.stat(fullPath, (err) => {
						if (err) return; // File might have been deleted

						const ext = path.extname(fullPath).toLowerCase();
						const watchableExts = ['.ts', '.tsx', '.js', '.jsx', '.json', '.css', '.html'];

						if (!watchableExts.includes(ext)) return;

						const event: FileChangeEvent = {
							type: 'change',
							path: fullPath,
							timestamp: Date.now(),
						};

						if (this.callback) {
							this.callback(event);
						}
					});
				});

				this.watchers.push(watcher);
				watchedPaths.push(watchPath);
			} catch (cause) {
				// Clean up any watchers we already created
				await this.close();

				const error = cause as Error;
				throw DevServerError.fileWatcherFailed(error);
			}
		}

		return {
			close: () => this.close(),
			addPaths: (newPaths: string[]) => {
				this.addMorePaths(newPaths);
			},
			unwatch: (pathsToRemove: string[]) => {
				this.unwatchPaths(pathsToRemove);
			},
		};
	}

	async close(): Promise<void> {
		for (const watcher of this.watchers) {
			watcher.close();
		}
		this.watchers = [];
		this.callback = null;
	}

	private addMorePaths(paths: string[]): void {
		if (!this.callback) return;

		for (const p of paths) {
			try {
				const watcher = fs.watch(p, { recursive: true }, (eventType, filename) => {
					if (!filename || eventType !== 'change') return;

					const fullPath = path.join(p, filename);

					fs.stat(fullPath, (err) => {
						if (err) return;

						const event: FileChangeEvent = {
							type: 'change',
							path: fullPath,
							timestamp: Date.now(),
						};

						this.callback?.(event);
					});
				});

				this.watchers.push(watcher);
			} catch {
				// Ignore errors when adding paths
			}
		}
	}

	private unwatchPaths(paths: string[]): void {
		// Node's fs.watch doesn't support unwatching specific paths easily
		// We track which watchers we have and close all if needed
		// For now, we'll close the oldest watcher matching the path
		const normalizedPaths = paths.map(p => path.normalize(p));

		const toClose: fs.FSWatcher[] = [];

		this.watchers = this.watchers.filter(watcher => {
			const watcherPath = (watcher as any).path as string | undefined;
			if (watcherPath && normalizedPaths.some(p => watcherPath.includes(p))) {
				toClose.push(watcher);
				return false;
			}
			return true;
		});

		toClose.forEach(w => w.close());
	}
}