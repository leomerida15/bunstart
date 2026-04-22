import type { ContentHash } from '../value-objects/ContentHash';

/**
 * Port for calculating content hashes of files.
 */
export interface HashCalculatorPort {
	/**
	 * Computes the hash of a single file.
	 * @param filePath - Path to the file
	 * @returns The content hash
	 */
	hashFile(filePath: string): Promise<ContentHash>;
}