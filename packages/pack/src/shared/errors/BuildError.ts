/**
 * Error thrown when a build operation fails.
 */
export class BuildError extends Error {
	public constructor(
		message: string,
		public override readonly cause?: unknown,
	) {
		super(message);
		this.name = 'BuildError';
	}
}
