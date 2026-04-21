/**
 * ServerHost represents the host address for binding the server.
 */
export class ServerHost {
	private readonly _value: string;

	private constructor(value: string) {
		this._value = value;
	}

	static create(value: string): ServerHost {
		if (!value || value.trim() === '') {
			throw new Error('Host cannot be empty');
		}
		return new ServerHost(value.trim());
	}

	static localhost(): ServerHost {
		return new ServerHost('127.0.0.1');
	}

	static any(): ServerHost {
		return new ServerHost('0.0.0.0');
	}

	get value(): string {
		return this._value;
	}

	equals(other: ServerHost): boolean {
		return this._value === other._value;
	}

	toString(): string {
		return this._value;
	}
}