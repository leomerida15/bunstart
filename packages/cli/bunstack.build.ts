/**
 * Build script for the CLI package.
 *
 * Execute this script using Bun CLI:
 *   bun run bunstack.build.ts
 *
 * Or via npm script:
 *   bun run build
 *
 * This script builds the TypeScript source files from src/ to dist/
 * with minification and source maps enabled, and adds a shebang to
 * the output file for direct execution.
 */

/**
 * Build configuration for the CLI package.
 *
 * Centralized configuration for all build operations.
 */
export const buildConfig = {
    entrypoints: ["src/index.ts"],
    outdir: "dist",
    target: "bun" as const,
    format: "esm" as const,
    minify: true,
    sourcemap: true,
    outputPath: "dist/index.js",
    shebang: "#!/usr/bin/env bun\n"
};

/**
 * Executes the build process.
 *
 * This function can be imported and used by other scripts (e.g., watch script)
 * to maintain a centralized build configuration.
 *
 * @returns {Promise<void>}
 */
export async function build(): Promise<void> {
    try {
        const result = await Bun.build({
            entrypoints: buildConfig.entrypoints,
            outdir: buildConfig.outdir,
            target: buildConfig.target,
            format: buildConfig.format,
            minify: buildConfig.minify,
            sourcemap: buildConfig.sourcemap
        });

        // Add shebang to the output file
        const outputFile = Bun.file(buildConfig.outputPath);
        const content = await outputFile.text();

        // Add shebang if not already present
        const contentWithShebang = content.startsWith("#!")
            ? content
            : buildConfig.shebang + content;

        await Bun.write(buildConfig.outputPath, contentWithShebang);

        console.log("Build completed 🟢");
    } catch (error) {
        console.error("Build failed 🔴", error);
        throw error;
    }
}

// Execute build if script is run directly (not imported)
// Check if this file is being executed directly by checking if it's the main module
const isMainModule = process.argv[1]?.endsWith('bunstack.build.ts') ||
    process.argv[1]?.endsWith('bunstack.build.js');

if (isMainModule) {
    build().catch((error) => {
        process.exit(1);
    });
}