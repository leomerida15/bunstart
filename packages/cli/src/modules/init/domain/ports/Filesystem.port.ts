/**
 * Port for filesystem operations.
 *
 * @interface FilesystemPort
 */
export interface FilesystemPort {
	/**
	 * Ensures a directory exists (creates recursively if needed).
	 *
	 * @param {string} path - Directory path
	 * @returns {Promise<void>}
	 */
	ensureDir(path: string): Promise<void>;

	/**
	 * Writes a file with the given content.
	 *
	 * @param {string} path - File path
	 * @param {string} content - File content
	 * @returns {Promise<void>}
	 */
	writeFile(path: string, content: string): Promise<void>;

	/**
	 * Deletes a file if it exists.
	 *
	 * @param {string} path - File path
	 * @returns {Promise<void>}
	 */
	deleteFile(path: string): Promise<void>;
}
