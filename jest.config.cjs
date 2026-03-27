module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    // 1. Кажемо Jest ігнорувати скомпільовану папку dist
    testPathIgnorePatterns: ['/node_modules/', '/dist/'],
    moduleNameMapper: {
        '^(\\.{1,2}/.*)\\.js$': '$1',
    },
    transform: {
        '^.+\\.tsx?$': [
            'ts-jest',
            {
                tsconfig: {
                    module: 'CommonJS',
                    isolatedModules: true,
                    // 2. Заспокоюємо TypeScript 6.0
                    ignoreDeprecations: '6.0'
                },
            },
        ],
    },
};