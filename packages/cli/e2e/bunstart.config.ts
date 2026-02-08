const bunstartConfig = {
    repo: {
        apps: {
            'app-example': { name: '@test/app-example', dependsOn: ["pkg-example"] },
            'exp': { name: '@test/exp', dependsOn: ["pkg-example"] },
            'client': { name: '@test/client', dependsOn: [] }
        },
        packages: {
            'pkg-example': { name: '@test/pkg-example', dependsOn: [] }
        }
    }
};

export default bunstartConfig;
