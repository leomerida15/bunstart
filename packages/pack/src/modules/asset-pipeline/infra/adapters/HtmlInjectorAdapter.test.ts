import { test, expect, describe } from 'bun:test';
import { HtmlInjectorAdapter } from './HtmlInjectorAdapter';
import type { HtmlManifest } from '../../domain/entities/HtmlManifest';

describe('HtmlInjectorAdapter', () => {
	const adapter = new HtmlInjectorAdapter();

	describe('inject', () => {
		test('should inject hash in img src', () => {
			const html = '<img src="/logo.png">';
			const manifest: HtmlManifest = {
				'/logo.png': '/a1b2c3d4-logo.png',
			};

			const result = adapter.inject(html, manifest);

			expect(result).toBe('<img src="/a1b2c3d4-logo.png">');
		});

		test('should inject hash in link href', () => {
			const html = '<link rel="stylesheet" href="/style.css">';
			const manifest: HtmlManifest = {
				'/style.css': '/e5f6g7h8-style.css',
			};

			const result = adapter.inject(html, manifest);

			expect(result).toBe('<link rel="stylesheet" href="/e5f6g7h8-style.css">');
		});

		test('should leave external URLs unchanged', () => {
			const html = '<img src="https://external.com/logo.png">';
			const manifest: HtmlManifest = {
				'/logo.png': '/a1b2c3d4-logo.png',
			};

			const result = adapter.inject(html, manifest);

			expect(result).toBe(html);
		});

		test('should not modify if no manifest entry', () => {
			const html = '<img src="/unknown.png">';
			const manifest: HtmlManifest = {};

			const result = adapter.inject(html, manifest);

			expect(result).toBe(html);
		});
	});
});