import { ReloadStrategy } from '../value-objects/ReloadStrategy';

/**
 * Configuration for Hot Module Replacement.
 */
export interface HotReloadConfigOptions {
	/** Enable HMR. Default: true */
	enabled?: boolean;
	/** WebSocket path for HMR. Default: "/__hmr" */
	wsPath?: string;
	/** Reload strategy. Default: "module" */
	strategy?: 'full' | 'module' | 'none';
	/** Debounce delay in ms. Default: 100 */
	debounceMs?: number;
	/** Custom HMR protocol version */
	protocolVersion?: string;
}

/**
 * HotReloadConfig entity for HMR behavior.
 */
export class HotReloadConfig {
	public readonly enabled: boolean;
	public readonly wsPath: string;
	public readonly strategy: ReloadStrategy;
	public readonly protocolVersion: string;

	private constructor(
		enabled: boolean,
		wsPath: string,
		strategy: ReloadStrategy,
		protocolVersion: string,
	) {
		this.enabled = enabled;
		this.wsPath = wsPath;
		this.strategy = strategy;
		this.protocolVersion = protocolVersion;
	}

	static create(options: HotReloadConfigOptions = {}): HotReloadConfig {
		const enabled = options.enabled ?? true;
		const wsPath = options.wsPath ?? '/__hmr';
		const debounceMs = options.debounceMs ?? 100;

		let strategy: ReloadStrategy;
		if (options.strategy) {
			// Create strategy with custom debounce if provided
			switch (options.strategy) {
				case 'full':
					strategy = ReloadStrategy.full(debounceMs);
					break;
				case 'module':
					strategy = ReloadStrategy.module(debounceMs);
					break;
				case 'none':
					strategy = ReloadStrategy.none();
					break;
				default:
					strategy = ReloadStrategy.module(debounceMs);
			}
		} else {
			strategy = ReloadStrategy.module(debounceMs);
		}

		const protocolVersion = options.protocolVersion ?? '1.0';

		return new HotReloadConfig(enabled, wsPath, strategy, protocolVersion);
	}

	/**
	 * Creates default HMR config (disabled).
	 */
	static disabled(): HotReloadConfig {
		return new HotReloadConfig(false, '/__hmr', ReloadStrategy.none(), '1.0');
	}

	/**
	 * Creates default HMR config (enabled with module reload).
	 */
	static defaults(): HotReloadConfig {
		return HotReloadConfig.create({
			enabled: true,
			strategy: 'module',
			debounceMs: 100,
		});
	}

	/**
	 * Check if full reload is enabled.
	 */
	isFullReload(): boolean {
		return this.enabled && this.strategy.type === 'full';
	}

	/**
	 * Check if module-level HMR is enabled.
	 */
	isModuleHmr(): boolean {
		return this.enabled && this.strategy.type === 'module';
	}
}