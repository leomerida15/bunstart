/**
 * ReloadStrategy determines how the client reloads on file changes.
 */
export enum ReloadStrategyType {
	/** Full page reload */
	FULL = 'full',
	/** Hot Module Replacement (partial) */
	MODULE = 'module',
	/** No automatic reload */
	NONE = 'none',
}

/**
 * ReloadStrategy value object with type and options.
 */
export class ReloadStrategy {
	private constructor(
		public readonly type: ReloadStrategyType,
		private readonly _debounceMs: number = 100,
	) {}

	static full(debounceMs = 100): ReloadStrategy {
		return new ReloadStrategy(ReloadStrategyType.FULL, debounceMs);
	}

	static module(debounceMs = 100): ReloadStrategy {
		return new ReloadStrategy(ReloadStrategyType.MODULE, debounceMs);
	}

	static none(): ReloadStrategy {
		return new ReloadStrategy(ReloadStrategyType.NONE, 0);
	}

	static fromString(value: string): ReloadStrategy {
		switch (value.toLowerCase()) {
			case 'full':
				return ReloadStrategy.full();
			case 'module':
			case 'hmr':
				return ReloadStrategy.module();
			case 'none':
			case 'off':
				return ReloadStrategy.none();
			default:
				throw new Error(`Unknown reload strategy: ${value}`);
		}
	}

	get debounceMs(): number {
		return this._debounceMs;
	}

	equals(other: ReloadStrategy): boolean {
		return this.type === other.type && this._debounceMs === other._debounceMs;
	}

	toString(): string {
		return this.type;
	}
}