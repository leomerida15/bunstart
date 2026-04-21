/**
 * ServerPort represents a valid port number for the dev server.
 * Ports below 1024 require elevated privileges.
 */
export class ServerPort {
	private readonly _value: number;

	private constructor(value: number) {
		this._value = value;
	}

	static create(value: number): ServerPort {
		if (!Number.isInteger(value)) {
			throw new Error(`Port must be an integer, got ${value}`);
		}
		if (value < 1 || value > 65535) {
			throw new Error(`Port must be between 1 and 65535, got ${value}`);
		}
		return new ServerPort(value);
	}

	static default(): ServerPort {
		return new ServerPort(3000);
	}

	get value(): number {
		return this._value;
	}

	equals(other: ServerPort): boolean {
		return this._value === other._value;
	}

	toString(): string {
		return String(this._value);
	}
}
