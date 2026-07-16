import { defineConfig } from "@playwright/test";

const port = Number(process.env.OHTAAWA_TEST_PORT || 4173);
const browserChannel = process.env.OHTAAWA_BROWSER_CHANNEL;

export default defineConfig({
  testDir: "./tests",
  testMatch: "partner-attribution.spec.mjs",
  fullyParallel: false,
  workers: 1,
  forbidOnly: true,
  reporter: "list",
  outputDir: "test-results/partner-attribution",
  use: {
    baseURL: `http://127.0.0.1:${port}`,
    reducedMotion: "reduce",
    serviceWorkers: "block",
    screenshot: "only-on-failure",
    trace: "retain-on-failure",
    ...(browserChannel ? { channel: browserChannel } : {})
  },
  webServer: {
    command: "node tests/static-server.mjs",
    url: `http://127.0.0.1:${port}`,
    reuseExistingServer: false,
    timeout: 15_000
  },
  projects: [
    {
      name: "desktop-1440x1000",
      use: { viewport: { width: 1440, height: 1000 } }
    },
    {
      name: "mobile-390x844",
      use: {
        viewport: { width: 390, height: 844 },
        hasTouch: true,
        isMobile: true
      }
    }
  ]
});
