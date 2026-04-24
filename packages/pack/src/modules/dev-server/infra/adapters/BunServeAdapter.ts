import type {
	DevServerPort,
	ServerHandle,
} from '../../domain/ports/DevServer.port';
import type { DevServerConfig } from '../../domain/entities/DevServerConfig';
import { DevServerError } from '../../domain/entities/DevServerError';

/**
 * BunServeAdapter implements DevServerPort using Bun.serve().
 */
export class BunServeAdapter implements DevServerPort {
	private server: ReturnType<typeof Bun.serve> | null = null;
	private running = false;

	async start(config: DevServerConfig): Promise<ServerHandle> {
		if (this.running) {
			throw new DevServerError('Server is already running', 'ALREADY_RUNNING');
		}

		const { port, host } = config;

		try {
			this.server = Bun.serve({
				port: port.value,
				hostname: host.value,
				fetch: this.createFetchHandler(config),
				development: true,
			});

			this.running = true;

			const serverPort = this.server.port ?? port.value;
			const serverHost = this.server.hostname ?? host.value;

			return {
				port: serverPort,
				host: serverHost,
				url: `http://${serverHost}:${serverPort}`,
				stop: async () => this.stop(),
			};
		} catch (cause) {
			const error = cause as Error;
			if (error.message.includes('EADDRINUSE') || error.message.includes('port')) {
				throw DevServerError.portInUse(port.value);
			}
			throw DevServerError.bindFailed(host.value, port.value, error);
		}
	}

	async stop(): Promise<void> {
		if (this.server) {
			this.server.stop();
			this.server = null;
			this.running = false;
		}
	}

	isRunning(): boolean {
		return this.running;
	}

	private createFetchHandler(config: DevServerConfig) {
		return async (req: Request): Promise<Response> => {
			const url = new URL(req.url);
			const pathname = url.pathname;

			// Serve static files from root directory
			if (config.hasStaticFiles()) {
				const filePath = pathname === '/' ? '/index.html' : pathname;
				const file = Bun.file(`${config.root}${filePath}`);

				// Bun.file().exists is a method that returns Promise<boolean>
				const exists = await file.exists();
				if (exists) {
					const headers = new Headers();

					// ✅ FIX: Compress the file for real when compress is enabled
					if (config.compress) {
						try {
							// Read the file as ArrayBuffer
							const arrayBuffer = await file.arrayBuffer();

							// Convert to Uint8Array for Bun.gzipSync()
							const uint8Data = new Uint8Array(arrayBuffer);

							// Compress with gzip
							const compressed = Bun.gzipSync(uint8Data);

							// Set appropriate headers
							headers.set('Content-Encoding', 'gzip');
							headers.set('Content-Length', compressed.byteLength.toString());

							// Return response with compressed data
							return new Response(compressed, {
								headers: {
									'Content-Type': this.getContentType(filePath),
									...Object.fromEntries(headers),
								},
							});
						} catch (error) {
							console.error('[DevServer] Compression failed:', error);
							// Fall through to send uncompressed
						}
					}

					// Send uncompressed (either compress is false or compression failed)
					return new Response(file, {
						headers: {
							'Content-Type': this.getContentType(filePath),
							...Object.fromEntries(headers),
						},
					});
				}
			}

			// 404 for unmatched routes
			return new Response('Not Found', { status: 404 });
		};
	}

	private getContentType(filePath: string): string {
		const ext = filePath.split('.').pop()?.toLowerCase() ?? '';
		const types: Record<string, string> = {
			'html': 'text/html',
			'htm': 'text/html',
			'js': 'application/javascript',
			'mjs': 'application/javascript',
			'css': 'text/css',
			'json': 'application/json',
			'png': 'image/png',
			'jpg': 'image/jpeg',
			'jpeg': 'image/jpeg',
			'gif': 'image/gif',
			'svg': 'image/svg+xml',
			'ico': 'image/x-icon',
			'woff': 'font/woff',
			'woff2': 'font/woff2',
			'ttf': 'font/ttf',
			'eot': 'application/vnd.ms-fontobject',
		};
		return types[ext] ?? 'application/octet-stream';
	}
}