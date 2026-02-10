import {
    MonorepoContextPort,
    MonorepoContextResult
} from '../../domain/ports/MonorepoContext.port';
import { FilesystemPort } from '../../domain/ports/Filesystem.port';

/**
 * Adapter for detecting monorepo context.
 *
 * This adapter implements MonorepoContextPort by searching for
 * bunstart.config.ts in the current directory and its ancestors.
 *
 * @class MonorepoContextAdapter
 */
export class MonorepoContextAdapter implements MonorepoContextPort {
    /**
     * Creates an instance of MonorepoContextAdapter.
     *
     * @param {FilesystemPort} filesystem - Filesystem port for file operations
     */
    constructor(private readonly filesystem: FilesystemPort) { }

    async detectContext(cwd: string): Promise<MonorepoContextResult> {
        let currentPath = cwd;
        const maxDepth = 10; // Prevent infinite loops

        for (let depth = 0; depth < maxDepth; depth++) {
            const configPath = `${currentPath}/bunstart.config.ts`;
            const exists = await this.filesystem.existsFile(configPath);

            if (exists) {
                return {
                    isMonorepo: true,
                    monorepoRoot: currentPath
                };
            }

            const parent = this.getParentPath(currentPath);
            if (parent === currentPath) break; // Reached root
            currentPath = parent;
        }

        return {
            isMonorepo: false,
            monorepoRoot: null
        };
    }

    private getParentPath(path: string): string {
        const segments = path.split('/');
        segments.pop();
        return segments.join('/') || '/';
    }
}
