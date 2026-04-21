import type { PackageAnalyzerPort } from '../../domain/ports/PackageAnalyzer.port';
import type { PackageJson } from '../../../../shared/types/PackageJson';

/**
 * Adapter that reads package.json using Bun.file() for parsing.
 */
export class PackageJsonAnalyzerAdapter implements PackageAnalyzerPort {
	async loadPackageJson(dir: string): Promise<PackageJson> {
		const path = `${dir.replace(/\/$/, '')}/package.json`;
		const file = Bun.file(path);

		if (!(await file.exists())) {
			return { dependencies: {}, devDependencies: {} };
		}

		try {
			const content = await file.json();
			return {
				name: content.name,
				version: content.version,
				dependencies: content.dependencies ?? {},
				devDependencies: content.devDependencies ?? {},
			};
		} catch {
			return { dependencies: {}, devDependencies: {} };
		}
	}
}
