import { test, expect } from "@playwright/test";

test.describe("Home Page", () => {
  test("shows referral form elements", async ({ page }) => {
    await page.goto("/");

    await expect(page.getByPlaceholder(/Referrer's Email/i)).toBeVisible();
    await expect(page.getByRole("button", { name: /invite/i })).toBeVisible();
  });

  test("adds prospect field on button click", async ({ page }) => {
    await page.goto("/");

    const addButton = page.getByRole("button", { name: /add prospect/i });
    await addButton.click();

    const nameInputs = page.getByPlaceholder(/Enter Referee Full Name/i);
    await expect(nameInputs).toHaveCount(2);
  });

  test("removes prospect field", async ({ page }) => {
    await page.goto("/");

    await page.getByRole("button", { name: /add prospect/i }).click();
    await page
      .getByRole("button", { name: /delete/i })
      .first()
      .click();

    const nameInputs = page.getByPlaceholder(/Enter Referee Full Name/i);
    await expect(nameInputs).toHaveCount(1);
  });
});
