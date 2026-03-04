import { test, expect } from "@playwright/test";

test.describe("Cross-page navigation", () => {
  test("logo navigates to /home from /groups", async ({ page }) => {
    await page.goto("/groups");

    await page.getByLabel("Go to home").click();

    await expect(page).toHaveURL("/home");
  });

  test("sidebar Home to Groups", async ({ page }) => {
    await page.goto("/home");

    const nav = page.getByLabel("Main navigation");
    await nav.getByRole("link", { name: "Groups" }).click();

    await expect(page).toHaveURL("/groups");
  });

  test("sidebar Groups to Home", async ({ page }) => {
    await page.goto("/groups");

    const nav = page.getByLabel("Main navigation");
    await nav.getByRole("link", { name: "Home" }).click();

    await expect(page).toHaveURL("/home");
  });

  test("sidebar Home to Settings", async ({ page }) => {
    await page.goto("/home");

    const nav = page.getByLabel("Main navigation");
    await nav.getByRole("link", { name: "Settings" }).click();

    await expect(page).toHaveURL("/settings");
  });

  test("sidebar Home to Messages", async ({ page }) => {
    await page.goto("/home");

    const nav = page.getByLabel("Main navigation");
    await nav.getByRole("link", { name: "Messages" }).click();

    await expect(page).toHaveURL("/messages");
  });

  test("sidebar Home to Events", async ({ page }) => {
    await page.goto("/home");

    const nav = page.getByLabel("Main navigation");
    await nav.getByRole("link", { name: "Events" }).click();

    await expect(page).toHaveURL("/events");
  });

  test("browser back button returns to previous page", async ({ page }) => {
    await page.goto("/home");

    const nav = page.getByLabel("Main navigation");
    await nav.getByRole("link", { name: "Groups" }).click();
    await expect(page).toHaveURL("/groups");

    await page.goBack();

    await expect(page).toHaveURL("/home");
  });

  test("direct URL navigation loads correctly with sidebar active state", async ({ page }) => {
    await page.goto("/settings");

    await expect(page.getByRole("heading", { level: 1, name: "Settings" })).toBeVisible();

    const nav = page.getByLabel("Main navigation");
    await expect(nav.getByRole("link", { name: "Settings" })).toHaveAttribute("aria-current", "page");
  });

  test("layout persists across navigation", async ({ page }) => {
    await page.goto("/home");

    await expect(page.getByLabel("Go to home")).toBeVisible();
    await expect(page.getByLabel("Main navigation")).toBeVisible();
    await expect(page.getByLabel("User menu")).toBeVisible();

    const nav = page.getByLabel("Main navigation");
    await nav.getByRole("link", { name: "Groups" }).click();
    await expect(page).toHaveURL("/groups");

    await expect(page.getByLabel("Go to home")).toBeVisible();
    await expect(page.getByLabel("Main navigation")).toBeVisible();
    await expect(page.getByLabel("User menu")).toBeVisible();

    await nav.getByRole("link", { name: "Settings" }).click();
    await expect(page).toHaveURL("/settings");

    await expect(page.getByLabel("Go to home")).toBeVisible();
    await expect(page.getByLabel("Main navigation")).toBeVisible();
    await expect(page.getByLabel("User menu")).toBeVisible();
  });
});
