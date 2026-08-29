module.exports = {
  testEnvironment: 'node',
  roots: ['<rootDir>'],
  testMatch: ['**/unit/**/*.test.js'],
  collectCoverage: true,
  coverageDirectory: 'coverage',
  collectCoverageFrom: [
    'packages/**/src/**/*.js',
    '!**/node_modules/**'
  ]
};
