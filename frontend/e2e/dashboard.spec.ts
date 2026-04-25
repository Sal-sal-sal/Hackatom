import { test, expect } from "@playwright/test"

test("dashboard renders KPI, activity, alerts, and gantt from API", async ({ page }) => {
  await page.goto("/")
  await expect(page.getByTestId("kpi-cards")).toBeVisible()
  await expect(page.getByTestId("activity-feed")).toBeVisible()
  await expect(page.getByTestId("alerts-panel")).toBeVisible()
  await expect(page.getByTestId("gantt-chart")).toBeVisible()
})
