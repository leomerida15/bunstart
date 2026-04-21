import type { PackageJson } from '../../../../shared/types/PackageJson';
import type { BuildConfig } from '../entities/BuildConfig';
import { ExternalStrategy } from '../value-objects/ExternalStrategy';
import { BuildEnvironment } from '../value-objects/BuildEnvironment';

/**
 * Domain service that resolves externals based on build environment strategy.
 * - Development: all dependencies AND devDependencies are external (Bun resolves instantly)
 * - Production: only user-provided externals are external
 */
export class ExternalsResolver {
	/**
	 * Resolves the list of external modules based on the build configuration
	 * and the contents of package.json.
	 */
	resolve(buildConfig: BuildConfig, packageJson: PackageJson): ExternalStrategy {
		if (buildConfig.environment.equals(BuildEnvironment.fromString('production'))) {
			// Production: only user-provided externals
			return ExternalStrategy.fromList(buildConfig.externals);
		}

		// Development: all deps + devDeps + user-provided
		const allExternals = new Set<string>();

		// Add user-provided externals
		for (const ext of buildConfig.externals) {
			allExternals.add(ext);
		}

		// Add all dependencies
		if (packageJson.dependencies) {
			for (const dep of Object.keys(packageJson.dependencies)) {
				allExternals.add(dep);
			}
		}

		// Add all devDependencies
		if (packageJson.devDependencies) {
			for (const dep of Object.keys(packageJson.devDependencies)) {
				allExternals.add(dep);
			}
		}

		return ExternalStrategy.fromList(Array.from(allExternals));
	}
}
