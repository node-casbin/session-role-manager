module.exports = {
  testEnvironment: 'node',
  transform: {
    '^.+\\.(ts|tsx)$': 'ts-jest',
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
  moduleNameMapper: {
    '^csv-parse/sync$': '<rootDir>/node_modules/csv-parse/dist/cjs/sync.cjs',
  },
};
