import { resolve } from 'node:path';
import { EntryPoint } from '../entities/EntryPoint';

/**
 * Domain service that resolves entrypoint paths to absolute paths.
 */
export class EntryPointResolver {
	/**
	 * Resolves a list of entrypoint paths to EntryPoint entities with absolute paths.
	 */
	resolve(paths: string[], cwd: string): EntryPoint[] {
		return paths.map((path) => {
			const resolvedPath = resolve(cwd, path);
			return new EntryPoint(path, resolvedPath);
		});
	}
}
