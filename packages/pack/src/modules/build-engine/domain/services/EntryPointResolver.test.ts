import { describe, it, expect } from 'bun:test';
import { EntryPointResolver } from './EntryPointResolver';

describe('EntryPointResolver', () => {
	const resolver = new EntryPointResolver();

	it('resolves entrypoint paths to absolute paths', () => {
		const result = resolver.resolve(['./src/index.ts', './src/cli.ts'], '/project');

		expect(result).toHaveLength(2);
		const [first, second] = result;
		expect(first?.originalPath).toBe('./src/index.ts');
		expect(first?.resolvedPath).toBe('/project/src/index.ts');
		expect(second?.originalPath).toBe('./src/cli.ts');
		expect(second?.resolvedPath).toBe('/project/src/cli.ts');
	});

	it('handles single entrypoint', () => {
		const result = resolver.resolve(['./app.ts'], '/myapp');

		expect(result).toHaveLength(1);
		const [first] = result;
		expect(first?.resolvedPath).toBe('/myapp/app.ts');
	});

	it('returns empty array for empty input', () => {
		const result = resolver.resolve([], '/project');

		expect(result).toHaveLength(0);
	});
});
