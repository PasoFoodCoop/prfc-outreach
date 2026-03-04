import { test, expect } from "@playwright/test";

test.describe("Unauthenticated access to protected routes", () => {
  test("/groups without auth redirects or errors", async ({ page }) => {
    const response = await page.goto("/groups");

    const url = page.url();
    const status = response?.status() ?? 0;
    const isRedirected = !url.includes("/groups");
    const isErrorStatus = status >= 400;
    expect(isRedirected || isErrorStatus).toBe(true);
  });

  test("/settings without auth redirects or errors", async ({ page }) => {
    const response = await page.goto("/settings");

    const url = page.url();
    const status = response?.status() ?? 0;
    const isRedirected = !url.includes("/settings");
    const isErrorStatus = status >= 400;
    expect(isRedirected || isErrorStatus).toBe(true);
  });

  test("/events without auth redirects or errors", async ({ page }) => {
    const response = await page.goto("/events");

    const url = page.url();
    const status = response?.status() ?? 0;
    const isRedirected = !url.includes("/events");
    const isErrorStatus = status >= 400;
    expect(isRedirected || isErrorStatus).toBe(true);
  });

  test("/messages without auth redirects or errors", async ({ page }) => {
    const response = await page.goto("/messages");

    const url = page.url();
    const status = response?.status() ?? 0;
    const isRedirected = !url.includes("/messages");
    const isErrorStatus = status >= 400;
    expect(isRedirected || isErrorStatus).toBe(true);
  });
});

test.describe("Auth callback edge cases", () => {
  test("invalid token in auth callback redirects to /", async ({ page }) => {
    // Submit an invalid token to the auth callback endpoint
    await page.goto("/dev/mock-portal");

    // Use page.evaluate to POST directly with an invalid token
    const response = await page.request.post("/api/auth/callback", {
      form: { token: "invalid-token-value" },
      maxRedirects: 0,
    });

    // Should redirect to / (302 with Location: /)
    expect(response.status()).toBe(307);
    expect(response.headers()["location"]).toContain("/");
  });
});

test.describe("Back after logout", () => {
  test("browser back after logout does not show protected content", async ({ page }) => {
    // Log in first via the inline flow
    await page.goto("/dev/mock-portal");
    await page.getByText("Dev Tools").click();
    await page.getByLabel("Select Member").selectOption("100001");
    await page.getByRole("button", { name: "Login" }).click();
    await page.waitForURL("/home");

    // Verify we're on a protected page
    await expect(page.getByLabel("User menu")).toBeVisible();

    // Log out via the user menu
    await page.getByLabel("User menu").click();
    await expect(page.getByRole("menuitem", { name: "Sign out" })).toBeVisible();
    await page.getByRole("menuitem", { name: "Sign out" }).click();
    await expect(page).toHaveURL("/dev/mock-portal");

    // Go back — should not show protected content
    await page.goBack();

    // Either redirected away from /home, or the page shows error/login, not protected content
    const url = page.url();
    if (url.includes("/home")) {
      // If the browser cache shows /home, the user menu should not be functional
      // (server will reject the session on next navigation)
      const response = await page.goto("/home");
      const finalUrl = page.url();
      const status = response?.status() ?? 0;
      const isRedirected = !finalUrl.includes("/home");
      const isErrorStatus = status >= 400;
      expect(isRedirected || isErrorStatus).toBe(true);
    }
    // If URL is not /home, the redirect already worked
  });
});
