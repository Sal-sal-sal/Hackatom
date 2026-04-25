import { test, expect } from "@playwright/test"

test("kanban renders three columns with seed data", async ({ page }) => {
  await page.goto("/deadlines")
  await expect(page.getByTestId("kanban-board")).toBeVisible()
  for (const col of ["not-started", "in-progress", "completed"]) {
    await expect(page.getByTestId(`kanban-col-${col}`)).toBeVisible()
  }
})
