/**
 * Port for processing CSS files.
 */
export interface CssProcessorPort {
	/**
	 * Processes a CSS file.
	 * @param inputPath - Source CSS file
	 * @param outputPath - Destination CSS file
	 */
	process(inputPath: string, outputPath: string): Promise<void>;
}

/**
 * Result of CSS processing.
 */
export interface CssProcessingResult {
	success: boolean;
	outputPath: string;
	originalSize: number;
	processedSize: number;
}