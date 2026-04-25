import { test, expect } from "@playwright/test"

test("hr page lists brigades and vacancies, drawer searches candidates", async ({ page }) => {
  await page.route("**/employ/vacancies/*/search-candidates", async (route) => {
    const body = route.request().postDataJSON() as { source: string }
    const fake = [
      {
        full_name: body.source === "manual" ? "Local Emp" : "HH Welder",
        position: "Welder", experience_years: 7,
        skills: ["welding", "nuclear"], past_projects: ["Akkuyu NPP"],
        source: body.source, match_score: 88,
        url: body.source === "hh" ? "https://hh.ru/vacancy/1" : null,
        employer: "Rosatom", location: "Moscow",
        salary: "200000 RUR", source_id: "1",
      },
      {
        full_name: "Other", position: "Office",
        experience_years: 3, skills: ["excel"], past_projects: [],
        source: body.source, match_score: 30,
        url: null, employer: null, location: null, salary: null, source_id: "2",
      },
    ]
    await route.fulfill({ status: 200, contentType: "application/json",
                         body: JSON.stringify(fake) })
  })

  await page.goto("/hr")
  await expect(page.getByTestId("brigades-grid")).toBeVisible()
  await expect(page.getByTestId("vacancies-list")).toBeVisible()

  const findBtn = page.locator('[data-testid^="find-candidate-"]').first()
  await findBtn.click()
  await expect(page.getByTestId("candidates-list")).toContainText("HH Welder")

  await page.getByTestId("source-manual").click()
  await expect(page.getByTestId("candidates-list")).toContainText("Local Emp")
})
