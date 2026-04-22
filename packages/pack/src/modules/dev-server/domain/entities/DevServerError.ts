/**
 * DevServerError represents errors that can occur in the dev server.
 */
export class DevServerError extends Error {
	constructor(
		message: string,
		public readonly code?: string,
		cause?: Error,
	) {
		super(message, { cause });
		this.name = 'DevServerError';
	}

	static portInUse(port: number): DevServerError {
		return new DevServerError(
			`Port ${port} is already in use`,
			'PORT_IN_USE',
		);
	}

	static invalidPort(port: number): DevServerError {
		return new DevServerError(
			`Invalid port: ${port}`,
			'INVALID_PORT',
		);
	}

	static bindFailed(host: string, port: number, cause: Error): DevServerError {
		return new DevServerError(
			`Failed to bind to ${host}:${port}`,
			'BIND_FAILED',
			cause,
		);
	}

	static fileWatcherFailed(cause: Error): DevServerError {
		return new DevServerError(
			'File watcher failed',
			'WATCHER_FAILED',
			cause,
		);
	}

	override toString(): string {
		return `[${this.code ?? 'UNKNOWN'}] ${this.message}`;
	}
}