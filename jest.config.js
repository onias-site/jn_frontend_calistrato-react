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
       // .js também: o JnAjax (app/JnAjax.js) é testado; o tsconfig.jest.json troca o jsx "preserve" do Next por
       // "react-jsx", para que as stores dentro de .tsx (FormResume) possam ser testadas
       '^.+\\.[tj]sx?$': ['ts-jest', { tsconfig: 'tsconfig.jest.json' }],
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
