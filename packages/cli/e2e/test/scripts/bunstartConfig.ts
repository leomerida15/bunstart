export class BunstartConfig {
    private config: BunstartConfig;

    constructor(config: BunstartConfig) {
        this.config = config;
    }

    getConfig() {
        return this.config;
    }
}