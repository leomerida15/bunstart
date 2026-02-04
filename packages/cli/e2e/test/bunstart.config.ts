const bunstartConfig = {
    apps: {
        'app-example': { name: '@types/app-example', dependsOn: ["pkg-example"] }
    },
    packages: {
        'pkg-example': { name: '@types/pkg-example', dependsOn: [] }
    }
};

export default bunstartConfig;
