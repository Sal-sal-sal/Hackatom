import { test, expect } from "@playwright/test"

test("supplies table loads from API and supports finding suppliers", async ({ page }) => {
  await page.route("**/supplies/*/find-supplier", (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify([
        { id: 999, name: "MockSupplier Ltd", rating: 4.8,
          nuclear_certified: true, location: "Astana", score: 91 },
      ]),
    }))

  await page.goto("/supplies")
  await expect(page.getByTestId("supplies-table")).toBeVisible()

  const findBtn = page.locator('[data-testid^="find-supplier-"]').first()
  if (await findBtn.count()) {
    await findBtn.click()
    await expect(page.getByTestId("supplier-matches")).toContainText("MockSupplier Ltd")
  }
})
