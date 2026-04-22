import { PluginRegistry } from '../../domain/entities/PluginRegistry';
import { PluginValidator } from '../../domain/services/PluginValidator';
import { PluginOrderResolver } from '../../domain/services/PluginOrderResolver';
import { RegisterPluginUseCase } from '../../app/use-cases/RegisterPluginUseCase';
import { ResolvePluginsUseCase } from '../../app/use-cases/ResolvePluginsUseCase';
import { LoadExternalPluginUseCase } from '../../app/use-cases/LoadExternalPluginUseCase';
import { BunPluginLoaderAdapter } from '../adapters/BunPluginLoaderAdapter';

/**
 * Factory for creating plugin system components.
 * Provides singleton instances for the registry and use cases.
 */
export class PluginSystemFactory {
	private static registry: PluginRegistry | null = null;
	private static registerUseCase: RegisterPluginUseCase | null = null;
	private static resolveUseCase: ResolvePluginsUseCase | null = null;
	private static loadExternalUseCase: LoadExternalPluginUseCase | null = null;
	private static loaderAdapter: BunPluginLoaderAdapter | null = null;

	/**
	 * Get the singleton PluginRegistry instance.
	 */
	public static getRegistry(): PluginRegistry {
		if (!this.registry) {
			this.registry = new PluginRegistry();
		}
		return this.registry;
	}

	/**
	 * Get the RegisterPluginUseCase instance.
	 */
	public static createRegisterPluginUseCase(): RegisterPluginUseCase {
		if (!this.registerUseCase) {
			this.registerUseCase = new RegisterPluginUseCase(
				this.getRegistry(),
				new PluginValidator(),
			);
		}
		return this.registerUseCase;
	}

	/**
	 * Get the ResolvePluginsUseCase instance.
	 */
	public static createResolvePluginsUseCase(): ResolvePluginsUseCase {
		if (!this.resolveUseCase) {
			this.resolveUseCase = new ResolvePluginsUseCase(
				this.getRegistry(),
				new PluginOrderResolver(),
			);
		}
		return this.resolveUseCase;
	}

	/**
	 * Get the LoadExternalPluginUseCase instance.
	 */
	public static createLoadExternalPluginUseCase(): LoadExternalPluginUseCase {
		if (!this.loadExternalUseCase) {
			this.loadExternalUseCase = new LoadExternalPluginUseCase(this.getLoaderAdapter());
		}
		return this.loadExternalUseCase;
	}

	/**
	 * Get the BunPluginLoaderAdapter instance.
	 */
	public static getLoaderAdapter(): BunPluginLoaderAdapter {
		if (!this.loaderAdapter) {
			this.loaderAdapter = new BunPluginLoaderAdapter();
		}
		return this.loaderAdapter;
	}

	/**
	 * Reset all singleton instances (useful for testing).
	 */
	public static reset(): void {
		this.registry = null;
		this.registerUseCase = null;
		this.resolveUseCase = null;
		this.loadExternalUseCase = null;
		this.loaderAdapter = null;
	}
}
