const bunstartConfig = {
    repo: {
        apps: {
            'doc': { name: '@bunstart/doc', dependsOn: [] }
        },
        packages: {
            'cli': { name: '@bunstart/cli', dependsOn: [] },
            'pack': { name: '@bunstart/pack', dependsOn: [] }
        }
    }
};

export default bunstartConfig;
