/**
 * Port for reading and writing package.json files.
 *
 * @interface PackageJsonPort
 */
export interface PackageJsonPort {
	/**
	 * Reads and parses a package.json file.
	 *
	 * @param {string} path - Path to package.json
	 * @returns {Promise<Record<string, unknown>>}
	 */
	read(path: string): Promise<Record<string, unknown>>;

	/**
	 * Writes a package.json file.
	 *
	 * @param {string} path - Path to package.json
	 * @param {Record<string, unknown>} content - Full package.json content
	 * @returns {Promise<void>}
	 */
	write(path: string, content: Record<string, unknown>): Promise<void>;

	/**
	 * Merges updates into an existing package.json.
	 *
	 * @param {string} path - Path to package.json
	 * @param {Partial<Record<string, unknown>>} updates - Fields to add or overwrite
	 * @returns {Promise<void>}
	 */
	patch(
		path: string,
		updates: Partial<Record<string, unknown>>
	): Promise<void>;
}
