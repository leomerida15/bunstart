import { test, expect, describe } from 'bun:test';
import { HotReloadConfig } from '../../../dev-server/domain/entities/HotReloadConfig';
import { ReloadStrategy, ReloadStrategyType } from '../../../dev-server/domain/value-objects/ReloadStrategy';

describe('HotReloadConfig', () => {
	test('creates config with defaults', () => {
		const config = HotReloadConfig.create();
		expect(config.enabled).toBe(true);
		expect(config.wsPath).toBe('/__hmr');
		expect(config.protocolVersion).toBe('1.0');
	});

	test('creates disabled config', () => {
		const config = HotReloadConfig.disabled();
		expect(config.enabled).toBe(false);
		expect(config.isFullReload()).toBe(false);
		expect(config.isModuleHmr()).toBe(false);
	});

	test('creates defaults config', () => {
		const config = HotReloadConfig.defaults();
		expect(config.enabled).toBe(true);
		expect(config.isModuleHmr()).toBe(true);
	});

	test('creates config with custom values', () => {
		const config = HotReloadConfig.create({
			enabled: true,
			wsPath: '/ws/hmr',
			strategy: 'full',
			debounceMs: 200,
			protocolVersion: '2.0',
		});

		expect(config.enabled).toBe(true);
		expect(config.wsPath).toBe('/ws/hmr');
		expect(config.strategy.type).toBe(ReloadStrategyType.FULL);
		expect(config.strategy.debounceMs).toBe(200);
		expect(config.protocolVersion).toBe('2.0');
	});

	test('isFullReload returns correct value', () => {
		const config = HotReloadConfig.create({ strategy: 'full' });
		expect(config.isFullReload()).toBe(true);
		expect(config.isModuleHmr()).toBe(false);
	});

	test('isModuleHmr returns correct value', () => {
		const config = HotReloadConfig.create({ strategy: 'module' });
		expect(config.isFullReload()).toBe(false);
		expect(config.isModuleHmr()).toBe(true);
	});
});

describe('ReloadStrategy', () => {
	test('full strategy', () => {
		const strategy = ReloadStrategy.full();
		expect(strategy.type).toBe(ReloadStrategyType.FULL);
		expect(strategy.debounceMs).toBe(100);
	});

	test('full strategy with custom debounce', () => {
		const strategy = ReloadStrategy.full(200);
		expect(strategy.type).toBe(ReloadStrategyType.FULL);
		expect(strategy.debounceMs).toBe(200);
	});

	test('module strategy', () => {
		const strategy = ReloadStrategy.module();
		expect(strategy.type).toBe(ReloadStrategyType.MODULE);
	});

	test('none strategy', () => {
		const strategy = ReloadStrategy.none();
		expect(strategy.type).toBe(ReloadStrategyType.NONE);
		expect(strategy.debounceMs).toBe(0);
	});

	test('fromString parses full', () => {
		const strategy = ReloadStrategy.fromString('full');
		expect(strategy.type).toBe(ReloadStrategyType.FULL);
	});

	test('fromString parses module', () => {
		const strategy = ReloadStrategy.fromString('module');
		expect(strategy.type).toBe(ReloadStrategyType.MODULE);
	});

	test('fromString parses hmr as module', () => {
		const strategy = ReloadStrategy.fromString('hmr');
		expect(strategy.type).toBe(ReloadStrategyType.MODULE);
	});

	test('fromString parses none', () => {
		const strategy = ReloadStrategy.fromString('none');
		expect(strategy.type).toBe(ReloadStrategyType.NONE);
	});

	test('fromString parses off as none', () => {
		const strategy = ReloadStrategy.fromString('off');
		expect(strategy.type).toBe(ReloadStrategyType.NONE);
	});

	test('fromString throws for unknown value', () => {
		expect(() => ReloadStrategy.fromString('invalid')).toThrow();
	});

	test('equals returns true for same strategy', () => {
		const s1 = ReloadStrategy.module(100);
		const s2 = ReloadStrategy.module(100);
		expect(s1.equals(s2)).toBe(true);
	});

	test('equals returns false for different type', () => {
		const s1 = ReloadStrategy.full();
		const s2 = ReloadStrategy.module();
		expect(s1.equals(s2)).toBe(false);
	});

	test('toString returns type', () => {
		const strategy = ReloadStrategy.module();
		expect(strategy.toString()).toBe('module');
	});
});