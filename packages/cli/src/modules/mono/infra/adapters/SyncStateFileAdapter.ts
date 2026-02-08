import { existsSync, mkdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import type { SyncStatePort } from '../../domain/ports/SyncState.port';

const SYNC_STATE_DIR = '.bunstart';
const SYNC_STATE_FILE = 'sync-state.json';

interface SyncStateJson {
	lastSyncTime: number;
}

export class SyncStateFileAdapter implements SyncStatePort {
	async shouldSync(cwd: string, workspacePaths: string[]): Promise<boolean> {
		const statePath = join(cwd, SYNC_STATE_DIR, SYNC_STATE_FILE);
		let lastSyncTime: number;
		try {
			if (!existsSync(statePath)) return true;
			const raw = readFileSync(statePath, 'utf-8');
			const data = JSON.parse(raw) as SyncStateJson;
			if (typeof data.lastSyncTime !== 'number') return true;
			lastSyncTime = data.lastSyncTime;
		} catch {
			return true;
		}

		const paths: string[] = workspacePaths.map((p) =>
			join(cwd, p, 'package.json')
		);
		for (const p of paths) {
			try {
				if (existsSync(p)) {
					const stat = statSync(p);
					if (stat.mtimeMs > lastSyncTime) return true;
				}
			} catch {
				// ignore missing or unreadable
			}
		}
		return false;
	}

	async recordSync(cwd: string): Promise<void> {
		const dir = join(cwd, SYNC_STATE_DIR);
		if (!existsSync(dir)) {
			mkdirSync(dir, { recursive: true });
		}
		const statePath = join(dir, SYNC_STATE_FILE);
		const data: SyncStateJson = { lastSyncTime: Date.now() };
		writeFileSync(statePath, JSON.stringify(data, null, 2), 'utf-8');
	}
}
