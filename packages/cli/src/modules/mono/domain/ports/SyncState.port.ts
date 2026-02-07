/**
 * Port for reading/writing "last sync" state used to decide if config
 * should be re-synced from package.json before build/dev/start.
 */
export interface SyncStatePort {
	/**
	 * Returns true if sync should run: no state file, or any workspace
	 * package.json has mtime greater than the stored lastSyncTime.
	 */
	shouldSync(
		cwd: string,
		workspaceIds: { apps: string[]; packages: string[] }
	): Promise<boolean>;

	/**
	 * Records that a sync was just performed (writes current timestamp to state).
	 */
	recordSync(cwd: string): Promise<void>;
}
