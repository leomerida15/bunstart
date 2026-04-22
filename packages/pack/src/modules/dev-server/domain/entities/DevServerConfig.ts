import { ServerPort } from '../value-objects/ServerPort';
import { ServerHost } from '../value-objects/ServerHost';

/**
 * Configuration for the development server.
 */
export interface DevServerConfigOptions {
	/** Port to bind the server to. Default: 3000 */
	port?: number;
	/** Host to bind the server to. Default: "127.0.0.1" */
	host?: string;
	/** Root directory for static files. Default: "./public" */
	root?: string;
	/** Enable CORS headers. Default: true */
	cors?: boolean;
	/** Enable gzip compression. Default: true */
	compress?: boolean;
	/** Entry points to build before serving */
	entrypoints?: string[];
	/** Enable hot reload. Default: true (only in watch mode) */
	hmr?: boolean;
	/** WebSocket path for HMR. Default: "/__hmr" */
	hmrPath?: string;
}

/**
 * DevServerConfig entity holds validated configuration for the dev server.
 */
export class DevServerConfig {
	public readonly port: ServerPort;
	public readonly host: ServerHost;
	public readonly root: string;
	public readonly cors: boolean;
	public readonly compress: boolean;
	public readonly entrypoints: string[];
	public readonly hmr: boolean;
	public readonly hmrPath: string;

	private constructor(
		port: ServerPort,
		host: ServerHost,
		root: string,
		cors: boolean,
		compress: boolean,
		entrypoints: string[],
		hmr: boolean,
		hmrPath: string,
	) {
		this.port = port;
		this.host = host;
		this.root = root;
		this.cors = cors;
		this.compress = compress;
		this.entrypoints = entrypoints;
		this.hmr = hmr;
		this.hmrPath = hmrPath;
	}

	static create(options: DevServerConfigOptions = {}): DevServerConfig {
		const port = options.port !== undefined
			? ServerPort.create(options.port)
			: ServerPort.default();

		const host = options.host !== undefined
			? ServerHost.create(options.host)
			: ServerHost.localhost();

		const root = options.root ?? './public';
		const cors = options.cors ?? true;
		const compress = options.compress ?? true;
		const entrypoints = options.entrypoints ?? [];
		const hmr = options.hmr ?? true;
		const hmrPath = options.hmrPath ?? '/__hmr';

		return new DevServerConfig(
			port,
			host,
			root,
			cors,
			compress,
			entrypoints,
			hmr,
			hmrPath,
		);
	}

	get portNumber(): number {
		return this.port.value;
	}

	get hostString(): string {
		return this.host.value;
	}

	get serverUrl(): string {
		return `http://${this.hostString}:${this.portNumber}`;
	}

	/**
	 * Check if this config has HMR enabled.
	 */
	hasHmr(): boolean {
		return this.hmr;
	}

	/**
	 * Check if static file serving is enabled.
	 */
	hasStaticFiles(): boolean {
		return !!this.root;
	}
}