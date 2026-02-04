import { mkdirSync, existsSync, unlinkSync } from 'node:fs';
import { dirname, join } from 'node:path';
import type { FilesystemPort } from '../../domain/ports/Filesystem.port';

/**
 * Adapter for filesystem operations.
 *
 * @class NodeFilesystemAdapter
 * @implements {FilesystemPort}
 */
export class NodeFilesystemAdapter implements FilesystemPort {
	public async ensureDir(path: string): Promise<void> {
		if (existsSync(path)) return;
		mkdirSync(path, { recursive: true });
	}

	public async writeFile(path: string, content: string): Promise<void> {
		const dir = dirname(path);
		await this.ensureDir(dir);
		await Bun.write(path, content);
	}

	public async deleteFile(path: string): Promise<void> {
		if (existsSync(path)) {
			unlinkSync(path);
		}
	}
}
