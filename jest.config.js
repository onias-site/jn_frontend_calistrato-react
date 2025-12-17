module.exports = {
    roots: ['<rootDir>/infra', '<rootDir>/domain', '<rootDir>/presentation'],
    collectCoverageFrom: [
      '<rootDir>/infra/**/*.{ts,tsx}',
      '<rootDir>/domain/**/*.{ts,tsx}',
      '<rootDir>/presentation/**/*.{ts,tsx}'
    ],
    coverageDirectory: 'coverage',
    testEnvironment: 'node',
    transform: {
       '^.+\\.tsx?$': 'ts-jest',
    },
    testMatch: [
      '**/__tests__/**/*.ts?(x)',
      '**/?(*.)+(spec|test).ts?(x)'
    ],
    moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
    moduleNameMapper: {
       '^@/(.*)$': '<rootDir>/$1',
    },
   };
