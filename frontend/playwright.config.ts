import { defineConfig, devices } from "@playwright/test"

const API_URL = "http://localhost:8000"
const APP_URL = "http://localhost:3000"

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: 0,
  workers: 1,
  reporter: "list",
  use: {
    baseURL: APP_URL,
    trace: "on-first-retry",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: [
    {
      command:
        "python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --app-dir ../backend",
      url: `${API_URL}/`,
      timeout: 60_000,
      reuseExistingServer: !process.env.CI,
      env: { DATABASE_URL: "sqlite:///./e2e_npp.db" },
    },
    {
      command: "pnpm dev",
      url: APP_URL,
      timeout: 120_000,
      reuseExistingServer: !process.env.CI,
      env: { NEXT_PUBLIC_API_URL: API_URL },
    },
  ],
})
