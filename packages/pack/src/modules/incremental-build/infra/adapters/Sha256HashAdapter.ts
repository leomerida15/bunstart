import type { HashCalculatorPort } from '../../domain/ports/HashCalculator.port';
import { ContentHash } from '../../domain/value-objects/ContentHash';

/**
 * Adapter that computes SHA-256 hashes using Bun.CryptoHasher.
 */
export class Sha256HashAdapter implements HashCalculatorPort {
	/**
	 * Computes the SHA-256 hash of a file.
	 * @param filePath - Path to the file
	 * @returns The content hash
	 */
	async hashFile(filePath: string): Promise<ContentHash> {
		const hasher = new Bun.CryptoHasher('sha256');
		const file = Bun.file(filePath);
		const content = await file.arrayBuffer();
		hasher.update(content);
		const digest = hasher.digest('hex');
		return ContentHash.unsafeFromString(digest);
	}
}