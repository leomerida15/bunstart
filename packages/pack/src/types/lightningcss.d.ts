/**
 * Type declarations for optional dependency lightningcss.
 */
declare module 'lightningcss' {
	interface TransformOptions {
		code: Uint8Array;
		minify?: boolean;
		targets?: Record<string, number>;
	}

	interface TransformResult {
		code: Buffer;
	}

	export function transform(options: TransformOptions): TransformResult;
}