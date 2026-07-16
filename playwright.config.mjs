import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./tests",
  testMatch: "vk-pixel.spec.mjs",
  fullyParallel: false,
  workers: 1,
  forbidOnly: true,
  reporter: [
    ["list"],
    ["json", { outputFile: "test-results/vk-pixel-results.json" }]
  ],
  use: {
    baseURL: "http://127.0.0.1:4173",
    reducedMotion: "reduce",
    serviceWorkers: "block",
    trace: "retain-on-failure",
    screenshot: "only-on-failure"
  },
  webServer: {
    command: "node tests/static-server.mjs",
    url: "http://127.0.0.1:4173",
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
