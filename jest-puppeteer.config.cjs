// jest-puppeteer.config.cjs
module.exports = {
  launch: {
    headless: 'new',
    defaultViewport: { width: 1280, height: 720 },
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  },
  browserContext: 'default',
  server: {
    command: 'npm run dev -- --host 0.0.0.0 --port 3006',
    port: 3006,
    launchTimeout: 60000,
    debug: false,
  },
};
