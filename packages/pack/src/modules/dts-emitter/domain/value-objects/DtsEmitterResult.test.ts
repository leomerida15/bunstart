import { test, expect, describe } from 'bun:test';
import {
	createDtsEmitterSuccess,
	createDtsEmitterFailure,
	createDtsEmitterNoOp,
} from './DtsEmitterResult';

describe('DtsEmitterResult', () => {
	describe('createDtsEmitterSuccess', () => {
		test('should create successful result with generated files', () => {
			const result = createDtsEmitterSuccess(['./dist/index.d.ts'], 100);
			expect(result.success).toBe(true);
			expect(result.generatedFiles).toEqual(['./dist/index.d.ts']);
			expect(result.durationMs).toBe(100);
			expect(result.errors).toEqual([]);
		});

		test('should handle empty generated files', () => {
			const result = createDtsEmitterSuccess([], 50);
			expect(result.success).toBe(true);
			expect(result.generatedFiles).toEqual([]);
		});
	});

	describe('createDtsEmitterFailure', () => {
		test('should create failed result with errors', () => {
			const result = createDtsEmitterFailure(['TypeScript error: ...'], 200);
			expect(result.success).toBe(false);
			expect(result.generatedFiles).toEqual([]);
			expect(result.errors).toEqual(['TypeScript error: ...']);
		});

		test('should include duration in failed result', () => {
			const result = createDtsEmitterFailure(['Error'], 150);
			expect(result.durationMs).toBe(150);
		});
	});

	describe('createDtsEmitterNoOp', () => {
		test('should create no-op result', () => {
			const result = createDtsEmitterNoOp();
			expect(result.success).toBe(true);
			expect(result.generatedFiles).toEqual([]);
			expect(result.durationMs).toBe(0);
			expect(result.errors).toEqual([]);
		});
	});
});
