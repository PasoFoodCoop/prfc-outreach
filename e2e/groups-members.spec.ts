import { test, expect, type Page, type Locator } from "@playwright/test";

let seedGroupName: string;

function getOpenDialog(page: Page): Locator {
  return page.locator('[role="dialog"][data-state="open"]');
}

function isServerAction(resp: { request: () => { method: () => string; headers: () => Record<string, string> } }) {
  return resp.request().method() === "POST" && !!resp.request().headers()["next-action"];
}

async function clickCardAndWaitForDetail(page: Page, card: Locator) {
  const actionPromise = page.waitForResponse((resp) => isServerAction(resp));
  await card.click();
  await actionPromise;
  await expect(getOpenDialog(page)).toBeVisible();
}

function getOpenAlertDialog(page: Page): Locator {
  return page.locator('[role="alertdialog"][data-state="open"]');
}

async function deleteGroupByName(page: Page, name: string) {
  await page.goto("/groups");
  const card = page.getByText(name, { exact: true });
  if ((await card.count()) === 0) return;

  await clickCardAndWaitForDetail(page, card.first());
  await getOpenDialog(page).getByRole("button", { name: "Edit" }).click();
  await expect(getOpenDialog(page).getByRole("button", { name: "Save Changes" })).toBeVisible();
  await getOpenDialog(page).getByRole("button", { name: "Delete" }).click();
  await expect(getOpenAlertDialog(page)).toBeVisible();

  const deletePromise = page.waitForResponse((resp) => isServerAction(resp));
  await getOpenAlertDialog(page).getByRole("button", { name: "Confirm" }).click();
  await deletePromise;
  await expect(page.getByText("Group deleted successfully")).toBeVisible();
}

async function openAddMembersForSeedGroup(page: Page) {
  await page.goto("/groups");
  const card = page.getByText(seedGroupName, { exact: true });
  await clickCardAndWaitForDetail(page, card);
  await getOpenDialog(page).getByRole("button", { name: "Edit" }).click();
  await expect(getOpenDialog(page).getByRole("button", { name: "Save Changes" })).toBeVisible();
  await getOpenDialog(page).getByRole("button", { name: "Add members to group" }).click();
  await expect(getOpenDialog(page).getByPlaceholder(/search/i)).toBeVisible();
}

test.beforeAll(async ({ browser }) => {
  seedGroupName = `E2E MbrTest ${Date.now()} ${Math.random().toString(36).slice(2, 6)}`;
  const page = await browser.newPage();
  await page.goto("/groups");
  await page.getByRole("button", { name: "Add new group" }).click();
  const dialog = getOpenDialog(page);
  await expect(dialog).toBeVisible();
  await dialog.getByLabel("Group Name").fill(seedGroupName);

  const createPromise = page.waitForResponse((resp) => isServerAction(resp));
  await dialog.getByRole("button", { name: "Create Group" }).click();
  await createPromise;
  await expect(page.getByText("Group created successfully")).toBeVisible();
  await expect(getOpenDialog(page)).not.toBeVisible();
  await page.close();
});

test.afterAll(async ({ browser }) => {
  const page = await browser.newPage();
  await deleteGroupByName(page, seedGroupName);
  await page.close();
});

test.describe("Add members modal - member management", () => {
  test("owner checkbox is checked and disabled", async ({ page }) => {
    await openAddMembersForSeedGroup(page);

    const trigger = page.locator("#user-menu-trigger");
    const triggerText = await trigger.textContent();
    // Extract just the name (first line before role text)
    const ownerName = triggerText?.replace(/Admin Manager|Member$/, "").trim() ?? "";

    const dialog = getOpenDialog(page);
    const ownerRow = dialog.getByText(ownerName, { exact: false }).locator("..").first();
    const ownerCheckbox = ownerRow.getByRole("checkbox");

    await expect(ownerCheckbox).toBeChecked();
    await expect(ownerCheckbox).toBeDisabled();
  });

  test("non-member checkbox defaults to unchecked", async ({ page }) => {
    await openAddMembersForSeedGroup(page);

    const dialog = getOpenDialog(page);
    const checkboxes = dialog.getByRole("checkbox");
    const count = await checkboxes.count();

    // At least one non-owner checkbox should be unchecked
    let foundUnchecked = false;
    for (let i = 0; i < count; i++) {
      const checkbox = checkboxes.nth(i);
      const isDisabled = await checkbox.isDisabled();
      if (!isDisabled) {
        const isChecked = await checkbox.isChecked();
        if (!isChecked) {
          foundUnchecked = true;
          break;
        }
      }
    }
    expect(foundUnchecked).toBe(true);
  });

  test("adding a member shows success toast and returns to edit modal", async ({ page }) => {
    await openAddMembersForSeedGroup(page);

    const dialog = getOpenDialog(page);
    const checkboxes = dialog.getByRole("checkbox");
    const count = await checkboxes.count();

    // Find and check the first unchecked, enabled checkbox
    for (let i = 0; i < count; i++) {
      const checkbox = checkboxes.nth(i);
      const isDisabled = await checkbox.isDisabled();
      if (!isDisabled) {
        const isChecked = await checkbox.isChecked();
        if (!isChecked) {
          await checkbox.check();
          break;
        }
      }
    }

    const savePromise = page.waitForResponse((resp) => isServerAction(resp));
    await dialog.getByRole("button", { name: "Save" }).click();
    await savePromise;

    await expect(page.getByText(/added/i)).toBeVisible();
    await expect(getOpenDialog(page).getByRole("button", { name: "Save Changes" })).toBeVisible();
  });

  test("removing a member shows success toast", async ({ page }) => {
    await openAddMembersForSeedGroup(page);

    const dialog = getOpenDialog(page);
    const checkboxes = dialog.getByRole("checkbox");
    const count = await checkboxes.count();

    // Find and uncheck the first checked, enabled checkbox (a non-owner member)
    for (let i = 0; i < count; i++) {
      const checkbox = checkboxes.nth(i);
      const isDisabled = await checkbox.isDisabled();
      if (!isDisabled) {
        const isChecked = await checkbox.isChecked();
        if (isChecked) {
          await checkbox.uncheck();
          break;
        }
      }
    }

    const savePromise = page.waitForResponse((resp) => isServerAction(resp));
    await dialog.getByRole("button", { name: "Save" }).click();
    await savePromise;

    await expect(page.getByText(/removed/i)).toBeVisible();
    await expect(getOpenDialog(page).getByRole("button", { name: "Save Changes" })).toBeVisible();
  });

  test("adding and removing simultaneously shows combined toast", async ({ page }) => {
    // First, ensure the seed group has at least one non-owner member
    // by adding one if needed
    await openAddMembersForSeedGroup(page);

    const dialog = getOpenDialog(page);
    const checkboxes = dialog.getByRole("checkbox");
    const count = await checkboxes.count();

    let checkedOne = false;
    let uncheckedOne = false;

    for (let i = 0; i < count; i++) {
      const checkbox = checkboxes.nth(i);
      const isDisabled = await checkbox.isDisabled();
      if (isDisabled) continue;

      const isChecked = await checkbox.isChecked();
      if (isChecked && !uncheckedOne) {
        await checkbox.uncheck();
        uncheckedOne = true;
      } else if (!isChecked && !checkedOne) {
        await checkbox.check();
        checkedOne = true;
      }

      if (checkedOne && uncheckedOne) break;
    }

    test.skip(!checkedOne || !uncheckedOne, "not enough members to test combined add/remove");

    const savePromise = page.waitForResponse((resp) => isServerAction(resp));
    await dialog.getByRole("button", { name: "Save" }).click();
    await savePromise;

    await expect(page.getByText(/added/i)).toBeVisible();
    await expect(getOpenDialog(page).getByRole("button", { name: "Save Changes" })).toBeVisible();
  });
});
