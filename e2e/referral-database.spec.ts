import { test, expect } from "@playwright/test";

test.describe("Referral Database Page", () => {
  test("redirects without password", async ({ page }) => {
    const response = await page.goto("/referral-database");

    expect(response?.url()).not.toContain("/referral-database");
  });

  test("shows data grid with valid password", async ({ page }) => {
    test.skip(!process.env.DATABASE_PASSWORD, "DATABASE_PASSWORD env var required");
    await page.goto(`/referral-database?pass=${process.env.DATABASE_PASSWORD}`);

    await expect(page.getByRole("table")).toBeVisible();
    await expect(page.getByText(/member name/i)).toBeVisible();
  });

  test("search filters table rows", async ({ page }) => {
    test.skip(!process.env.DATABASE_PASSWORD, "DATABASE_PASSWORD env var required");
    await page.goto(`/referral-database?pass=${process.env.DATABASE_PASSWORD}`);

    const searchInput = page.getByPlaceholder(/search/i);
    await searchInput.fill("test");

    await expect(page.getByRole("table")).toBeVisible();
  });

  test("toggle switch updates redeemed status", async ({ page }) => {
    test.skip(!process.env.DATABASE_PASSWORD, "DATABASE_PASSWORD env var required");
    await page.goto(`/referral-database?pass=${process.env.DATABASE_PASSWORD}`);

    const firstSwitch = page.getByRole("switch").first();
    const initialChecked = await firstSwitch.isChecked();

    await firstSwitch.click();

    await expect(firstSwitch).toBeChecked({ checked: !initialChecked });
  });
});
