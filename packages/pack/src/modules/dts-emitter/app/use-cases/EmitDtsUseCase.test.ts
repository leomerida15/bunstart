import { test, expect, describe, vi } from 'bun:test';
import { EmitDtsUseCase } from './EmitDtsUseCase';
import type { DtsEmitterPort } from '../../domain/ports/DtsEmitter.port';
import type { DtsConfig } from '../../domain/value-objects/DtsConfig';
import type { DtsEmitterResult } from '../../domain/value-objects/DtsEmitterResult';
import { DtsEmitterError } from '../../domain/entities/DtsEmitterError';

describe('EmitDtsUseCase', () => {
	describe('execute', () => {
		test('should return no-op when dts config is undefined', async () => {
			const mockPort = {
				emit: vi.fn(),
			} as unknown as DtsEmitterPort;
			const useCase = new EmitDtsUseCase({ dtsEmitter: mockPort });

			const result = await useCase.execute(undefined, './dist');

			expect(result.success).toBe(true);
			expect(result.generatedFiles).toEqual([]);
			expect(mockPort.emit).not.toHaveBeenCalled();
		});

		test('should return no-op when dts config enable is false', async () => {
			const mockPort = {
				emit: vi.fn(),
			} as unknown as DtsEmitterPort;
			const useCase = new EmitDtsUseCase({ dtsEmitter: mockPort });

			const result = await useCase.execute({ enable: false }, './dist');

			expect(result.success).toBe(true);
			expect(result.generatedFiles).toEqual([]);
			expect(mockPort.emit).not.toHaveBeenCalled();
		});

		test('should call port.emit when enabled', async () => {
			const mockResult: DtsEmitterResult = {
				success: true,
				generatedFiles: ['./dist/index.d.ts'],
				durationMs: 100,
				errors: [],
			};
			const mockPort = {
				emit: vi.fn().mockResolvedValue(mockResult),
			} as unknown as DtsEmitterPort;
			const useCase = new EmitDtsUseCase({ dtsEmitter: mockPort });

			const config: DtsConfig = { enable: true, entrypoints: ['./src/index.ts'] };
			const result = await useCase.execute(config, './dist');

			expect(mockPort.emit).toHaveBeenCalledWith(config, './dist');
			expect(result.success).toBe(true);
			expect(result.generatedFiles).toEqual(['./dist/index.d.ts']);
		});

		test('should throw when port returns failure', async () => {
			const mockResult: DtsEmitterResult = {
				success: false,
				generatedFiles: [],
				durationMs: 50,
				errors: ['TypeScript error'],
			};
			const mockPort = {
				emit: vi.fn().mockResolvedValue(mockResult),
			} as unknown as DtsEmitterPort;
			const useCase = new EmitDtsUseCase({ dtsEmitter: mockPort });

			const config: DtsConfig = { enable: true };

			await expect(useCase.execute(config, './dist')).rejects.toThrow(DtsEmitterError);
		});

		test('should throw and preserve cause on error', async () => {
			const originalError = new Error('Import failed');
			const mockPort = {
				emit: vi.fn().mockRejectedValue(originalError),
			} as unknown as DtsEmitterPort;
			const useCase = new EmitDtsUseCase({ dtsEmitter: mockPort });

			const config: DtsConfig = { enable: true };

			await expect(useCase.execute(config, './dist')).rejects.toThrow();
		});
	});
});
