import { test, expect, describe } from 'bun:test';
import {
	DtsEmitterError,
	createDtsCompilationError,
	createDtsMissingEntryError,
	createDtsPermissionError,
} from './DtsEmitterError';

describe('DtsEmitterError', () => {
	describe('constructor', () => {
		test('should create error with message', () => {
			const error = new DtsEmitterError('DTS emission failed');
			expect(error.message).toBe('DTS emission failed');
			expect(error.name).toBe('DtsEmitterError');
		});

		test('should preserve cause', () => {
			const cause = new Error('Original error');
			const error = new DtsEmitterError('Failed', cause);
			expect(error.cause).toBe(cause);
		});
	});

	describe('createDtsCompilationError', () => {
		test('should create compilation error with message', () => {
			const error = createDtsCompilationError('TS2307: Cannot find module');
			expect(error.message).toBe('TypeScript error: TS2307: Cannot find module');
			expect(error.name).toBe('DtsEmitterError');
		});

		test('should include cause when provided', () => {
			const cause = new Error('TS failed');
			const error = createDtsCompilationError('syntax error', cause);
			expect(error.cause).toBe(cause);
		});
	});

	describe('createDtsMissingEntryError', () => {
		test('should create missing entry error', () => {
			const error = createDtsMissingEntryError('./src/index.ts');
			expect(error.message).toBe('Missing entry file: ./src/index.ts');
		});
	});

	describe('createDtsPermissionError', () => {
		test('should create permission error', () => {
			const error = createDtsPermissionError('./dist');
			expect(error.message).toBe('Permission denied: unable to write to ./dist');
		});
	});
});
