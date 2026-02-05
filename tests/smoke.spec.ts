import { test, expect } from "@playwright/test";

test.describe("Smoke", () => {
  test("landing page loads", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/Memory Well/i);
    await expect(
      page.getByRole("heading", { name: /digital guestbooks/i }),
    ).toBeVisible();
  });
});
