/**
 * Represents a resolved entrypoint with its absolute path.
 */
export class EntryPoint {
	public constructor(
		public readonly originalPath: string,
		public readonly resolvedPath: string,
	) {}
}
