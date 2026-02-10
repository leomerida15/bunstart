/**
 * Value object for a workspace alias (e.g. 'app-example', 'pkg-example').
 * Used as key in apps/packages records in RepoConfig.
 */
export class WorkspaceId {
	private readonly _value: string;

	private constructor(value: string) {
		this._value = value;
	}

	public static fromString(value: string): WorkspaceId {
		const trimmed = value.trim();
		if (!trimmed.length) {
			throw new Error('WorkspaceId cannot be empty.');
		}
		return new WorkspaceId(trimmed);
	}

	public get value(): string {
		return this._value;
	}
}
