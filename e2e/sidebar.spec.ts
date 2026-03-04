import { test, expect } from "@playwright/test";

const NAV_ITEMS = ["Home", "Messages", "Groups", "Events", "Settings"];

test.describe("Sidebar navigation", () => {
  test("displays all 5 nav items", async ({ page }) => {
    await page.goto("/home");

    const nav = page.getByLabel("Main navigation");
    await expect(nav).toBeVisible();

    for (const item of NAV_ITEMS) {
      await expect(nav.getByRole("link", { name: item })).toBeVisible();
    }
  });

  test("aria-current is page on Home when at /home", async ({ page }) => {
    await page.goto("/home");

    const nav = page.getByLabel("Main navigation");
    await expect(nav.getByRole("link", { name: "Home" })).toHaveAttribute("aria-current", "page");
  });

  test("aria-current is page on Groups when at /groups", async ({ page }) => {
    await page.goto("/groups");

    const nav = page.getByLabel("Main navigation");
    await expect(nav.getByRole("link", { name: "Groups" })).toHaveAttribute("aria-current", "page");
    await expect(nav.getByRole("link", { name: "Home" })).not.toHaveAttribute("aria-current");
  });

  test("clicking sidebar link navigates to correct page", async ({ page }) => {
    await page.goto("/home");

    const nav = page.getByLabel("Main navigation");
    await nav.getByRole("link", { name: "Groups" }).click();

    await expect(page).toHaveURL("/groups");
    await expect(nav.getByRole("link", { name: "Groups" })).toHaveAttribute("aria-current", "page");
  });

  test("sidebar hidden on mobile viewport", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto("/home");

    const nav = page.getByLabel("Main navigation");
    await expect(nav).not.toBeVisible();
  });

  test("sidebar visible on desktop viewport", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto("/home");

    const nav = page.getByLabel("Main navigation");
    await expect(nav).toBeVisible();
  });
});
