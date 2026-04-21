import { test, expect, describe } from 'bun:test';
import { DevServerError } from '../../../dev-server/domain/entities/DevServerError';

describe('DevServerError', () => {
	test('creates error with message', () => {
		const error = new DevServerError('Test error');
		expect(error.message).toBe('Test error');
		expect(error.name).toBe('DevServerError');
	});

	test('creates error with code', () => {
		const error = new DevServerError('Test error', 'TEST_CODE');
		expect(error.code).toBe('TEST_CODE');
	});

	test('creates error with cause', () => {
		const cause = new Error('Original error');
		const error = new DevServerError('Test error', 'TEST_CODE', cause);
		expect(error.cause).toBe(cause);
	});

	test('portInUse creates correct error', () => {
		const error = DevServerError.portInUse(3000);
		expect(error.message).toContain('3000');
		expect(error.code).toBe('PORT_IN_USE');
	});

	test('invalidPort creates correct error', () => {
		const error = DevServerError.invalidPort(0);
		expect(error.message).toContain('0');
		expect(error.code).toBe('INVALID_PORT');
	});

	test('bindFailed creates correct error', () => {
		const cause = new Error('EADDRINUSE');
		const error = DevServerError.bindFailed('127.0.0.1', 3000, cause);
		expect(error.message).toContain('127.0.0.1:3000');
		expect(error.code).toBe('BIND_FAILED');
	});

	test('fileWatcherFailed creates correct error', () => {
		const cause = new Error('ENOENT');
		const error = DevServerError.fileWatcherFailed(cause);
		expect(error.code).toBe('WATCHER_FAILED');
	});

	test('toString includes code', () => {
		const error = DevServerError.portInUse(3000);
		expect(error.toString()).toBe('[PORT_IN_USE] Port 3000 is already in use');
	});

	test('toString without code shows UNKNOWN', () => {
		const error = new DevServerError('Generic error');
		expect(error.toString()).toBe('[UNKNOWN] Generic error');
	});
});