/**
 * BunPlugin shape — the actual type is a global from @types/bun.
 * This alias exists to satisfy TypeScript in environments where the global
 * type is not automatically inferred.
 */
export type BunPlugin = {
	name: string;
	hooks?: {
		setup?: (build: unknown) => void;
		build?: (build: unknown) => void;
	};
};
