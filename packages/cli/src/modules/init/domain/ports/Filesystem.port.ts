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

	/**
	 * Returns true if the path exists and is a directory.
	 *
	 * @param {string} path - Directory path
	 * @returns {Promise<boolean>}
	 */
	existsDir(path: string): Promise<boolean>;

	/**
	 * Returns true if the path exists and is a file.
	 *
	 * @param {string} path - File path
	 * @returns {Promise<boolean>}
	 */
	existsFile(path: string): Promise<boolean>;

	/**
	 * Copies a directory recursively from source to destination.
	 * Caller must ensure destination does not exist if overwrite is not desired.
	 *
	 * @param {string} sourcePath - Source directory path
	 * @param {string} destPath - Destination directory path
	 * @returns {Promise<void>}
	 */
	copyDirectory(sourcePath: string, destPath: string): Promise<void>;
}
