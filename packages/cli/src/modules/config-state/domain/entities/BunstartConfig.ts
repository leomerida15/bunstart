/**
 * Section owned by the mono module. Defined here for type completeness;
 * config-state does not validate or interpret its content.
 */
export interface RepoSection {
	apps: Record<string, { name: string; dependsOn: string[] }>;
	packages: Record<string, { name: string; dependsOn: string[] }>;
}

/**
 * Root configuration type for bunstart.config.ts.
 * Each top-level property is a section owned by a specific module.
 * config-state treats sections as opaque objects; it does not validate their content.
 */
export interface BunstartConfig {
	repo?: RepoSection;
}
