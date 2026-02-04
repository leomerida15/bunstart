import { join } from 'node:path';
import type { PackageJsonPort } from '../../domain/ports/PackageJson.port';

/**
 * Adapter for reading and writing package.json files.
 *
 * @class PackageJsonAdapter
 * @implements {PackageJsonPort}
 */
export class PackageJsonAdapter implements PackageJsonPort {
	public async read(path: string): Promise<Record<string, unknown>> {
		const fullPath = path.endsWith('package.json')
			? path
			: join(path, 'package.json');
		const file = Bun.file(fullPath);
		if (!(await file.exists())) {
			throw new Error(`package.json not found at ${fullPath}`);
		}
		return (await file.json()) as Record<string, unknown>;
	}

	public async write(
		path: string,
		content: Record<string, unknown>
	): Promise<void> {
		const fullPath = path.endsWith('package.json')
			? path
			: join(path, 'package.json');
		await Bun.write(
			fullPath,
			JSON.stringify(content, null, 2) + '\n'
		);
	}

	public async patch(
		path: string,
		updates: Partial<Record<string, unknown>>
	): Promise<void> {
		const current = await this.read(path);
		const merged = { ...current, ...updates };
		await this.write(path, merged);
	}
}
