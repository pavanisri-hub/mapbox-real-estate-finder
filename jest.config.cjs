/** @type {import('jest').Config} */
module.exports = {
  preset: 'jest-puppeteer',
  testMatch: ['**/tests/integration/**/*.test.js'],
  testTimeout: 60000,
  reporters: [
    'default',
    [
      'jest-json-reporter',
      {
        outputPath: 'test-results/integration-report.json',
        includeConsoleOutput: true,
      },
    ],
  ],
};
