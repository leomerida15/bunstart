import { test, expect, describe } from 'bun:test';
import { detectAssetType } from './AssetType';

describe('AssetType', () => {
	describe('detectAssetType', () => {
		test('should detect image types', () => {
			expect(detectAssetType('logo.png')).toBe('image');
			expect(detectAssetType('photo.jpg')).toBe('image');
			expect(detectAssetType('icon.svg')).toBe('image');
		});

		test('should detect font types', () => {
			expect(detectAssetType('font.woff2')).toBe('font');
			expect(detectAssetType('Roboto.ttf')).toBe('font');
		});

		test('should detect stylesheet types', () => {
			expect(detectAssetType('style.css')).toBe('stylesheet');
		});

		test('should detect script types', () => {
			expect(detectAssetType('bundle.js')).toBe('script');
		});

		test('should return other for unknown types', () => {
			expect(detectAssetType('README.md')).toBe('other');
		});
	});
});