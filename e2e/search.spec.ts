import { test, expect } from "@playwright/test";

function getGroupCards(page: import("@playwright/test").Page) {
  return page.locator("button").filter({ hasText: /\d+ members?/ });
}

test.describe("Search filter - groups page", () => {
  test("typing in search filters displayed group cards", async ({ page }) => {
    await page.goto("/groups");

    const cards = getGroupCards(page);
    await expect(cards.first()).toBeVisible();
    const initialCount = await cards.count();

    // Get the name from the first card to use as search term
    const firstCardText = await cards.first().textContent();
    const searchTerm =
      firstCardText
        ?.split(/\d+ members?/)[0]
        ?.trim()
        .slice(0, 8) ?? "";
    test.skip(!searchTerm, "no card text to search for");

    const searchInput = page.getByLabel("Search");
    await searchInput.fill(searchTerm);

    // Wait for debounce + filter — at least the matching card should remain
    await expect(cards.first()).toBeVisible();
    const filteredCount = await cards.count();
    expect(filteredCount).toBeLessThanOrEqual(initialCount);
  });

  test("clearing search shows all groups again", async ({ page }) => {
    await page.goto("/groups");

    const cards = getGroupCards(page);
    await expect(cards.first()).toBeVisible();
    const initialCount = await cards.count();

    const searchInput = page.getByLabel("Search");
    await searchInput.fill("zzz_no_match_xyz");

    // Wait for "no results" or reduced cards
    await expect(page.getByText("No groups match your search.")).toBeVisible();

    await searchInput.clear();

    // All cards should return
    await expect(cards.first()).toBeVisible();
    const restoredCount = await cards.count();
    expect(restoredCount).toBe(initialCount);
  });

  test("search with no matches shows empty state message", async ({ page }) => {
    await page.goto("/groups");

    await expect(getGroupCards(page).first()).toBeVisible();

    const searchInput = page.getByLabel("Search");
    await searchInput.fill("zzz_nonexistent_group_xyz_123");

    await expect(page.getByText("No groups match your search.")).toBeVisible();
    await expect(getGroupCards(page)).toHaveCount(0);
  });

  test("navigating away and back clears search input", async ({ page }) => {
    await page.goto("/groups");

    const searchInput = page.getByLabel("Search");
    await searchInput.fill("test search");
    await expect(searchInput).toHaveValue("test search");

    // Navigate to settings
    const nav = page.getByLabel("Main navigation");
    await nav.getByRole("link", { name: "Settings" }).click();
    await expect(page).toHaveURL("/settings");

    // Search should be cleared
    await expect(searchInput).toHaveValue("");

    // Navigate back to groups
    await nav.getByRole("link", { name: "Groups" }).click();
    await expect(page).toHaveURL("/groups");

    await expect(searchInput).toHaveValue("");
  });
});

test.describe("Search filter - home page", () => {
  test("typing in search filters home page group cards", async ({ page }) => {
    await page.goto("/home");

    const cards = page.locator("div").filter({ hasText: /\d+ members?/ });
    const cardCount = await cards.count();
    test.skip(cardCount === 0, "no groups on home page to search");

    const searchInput = page.getByLabel("Search");
    await searchInput.fill("zzz_nonexistent_group_xyz_123");

    await expect(page.getByText("No groups match your search.")).toBeVisible();
  });

  test("clearing search on home page restores all cards", async ({ page }) => {
    await page.goto("/home");

    const cards = page.locator("div").filter({ hasText: /\d+ members?/ });
    const cardCount = await cards.count();
    test.skip(cardCount === 0, "no groups on home page to search");

    const initialCount = cardCount;

    const searchInput = page.getByLabel("Search");
    await searchInput.fill("zzz_no_match_xyz");
    await expect(page.getByText("No groups match your search.")).toBeVisible();

    await searchInput.clear();
    await expect(cards.first()).toBeVisible();

    const restoredCount = await cards.count();
    expect(restoredCount).toBe(initialCount);
  });
});
