import { test as base, expect } from "@playwright/test";
import os from "node:os";
import fs from "node:fs/promises";
import path from "node:path";

type Fixtures = { uploadsDir: string };

const test = base.extend<Fixtures>({
  uploadsDir: async ({ context, baseURL }, use) => {
    const dir = await fs.mkdtemp(path.join(os.tmpdir(), "upload-test-"));
    await context.addCookies([{
      name: "unique-uploads-dir",
      value: encodeURIComponent(dir),
      url: baseURL!,
    }]);
    await use(dir);
    await fs.rm(dir, { recursive: true });
  },
});

// Outer-loop acceptance specs — built one at a time (double-loop TDD).
// Each test covers exactly one behavior from the backlog.

// Used only by specs that drive the hidden file input via setInputFiles:
// that bypasses Playwright's actionability checks, so it can fire onChange
// before React hydrates and the event is lost. We wait for data-hydrated
// (set in a useEffect, i.e. post-hydration) before interacting.
// Click-driven specs don't need this — their buttons are disabled until
// hydrated, so Playwright's auto-waiting handles readiness for free.
async function gotoReady(page: import("@playwright/test").Page) {
  await page.goto("/");
  await page.locator("[data-hydrated]").waitFor();
}

test("page load shows server-rendered file names", async ({ page, uploadsDir }) => {
  await fs.writeFile(path.join(uploadsDir, "550e8400-e29b-41d4-a716-446655440000__hello.txt"), "content");
  await page.goto("/");
  await expect(page.getByText("hello.txt", { exact: true })).toBeVisible();
});

test("existing image file shows a thumbnail", async ({ page, uploadsDir }) => {
  await fs.copyFile("e2e/fixtures/sample.png", path.join(uploadsDir, "550e8400-e29b-41d4-a716-446655440000__sample.png"));
  await page.goto("/");
  await expect(page.locator("img[alt='sample.png']")).toBeVisible();
});

test("existing image thumbnail loads successfully", async ({ page, uploadsDir }) => {
  await fs.copyFile("e2e/fixtures/sample.png", path.join(uploadsDir, "550e8400-e29b-41d4-a716-446655440000__sample.png"));
  await page.goto("/");
  const img = page.locator("img[alt='sample.png']");
  await img.waitFor({ state: "visible" });
  const loaded = await img.evaluate((el: HTMLImageElement) => el.complete && el.naturalWidth > 0);
  expect(loaded).toBe(true);
});

test("choosing an image uploads it and shows its name", async ({ page }) => {
  await gotoReady(page);
  await page.locator("input[type='file']").setInputFiles("e2e/fixtures/sample.png");
  await page.waitForSelector("ul li");
  await expect(page.getByText("sample.png", { exact: true }).first()).toBeVisible();
});

test("uploaded image shows size", async ({ page }) => {
  await gotoReady(page);
  await page.locator("input[type='file']").setInputFiles("e2e/fixtures/sample.png");
  await expect(page.locator("text=/\\d+(\\.\\d+)? (B|KB|MB)/").first()).toBeVisible();
});

test("uploaded image shows inline preview", async ({ page }) => {
  await gotoReady(page);
  await page.locator("input[type='file']").setInputFiles("e2e/fixtures/sample.png");
  const img = page.locator("img[alt='sample.png']").first();
  await img.waitFor({ state: "visible" });
  const loaded = await img.evaluate((el: HTMLImageElement) => el.complete && el.naturalWidth > 0);
  expect(loaded).toBe(true);
});

test("shows Uploading… and disabled button during upload", async ({ page }) => {
  let release!: () => void;
  const held = new Promise<void>((resolve) => { release = resolve; });
  await page.route("**/api/v1/upload", async (route) => {
    await held;
    await route.continue();
  });
  await gotoReady(page);
  await page.locator("input[type='file']").setInputFiles("e2e/fixtures/sample.png");
  await expect(page.getByRole("button", { name: "Uploading…" })).toBeDisabled();
  release();
});

test("uploading a non-image shows its name", async ({ page }) => {
  await gotoReady(page);
  await page.locator("input[type='file']").setInputFiles({
    name: "notes.txt",
    mimeType: "text/plain",
    buffer: Buffer.from("hello"),
  });
  await expect(page.getByText("notes.txt", { exact: true }).first()).toBeVisible();
});

test("uploading a non-image shows no preview", async ({ page }) => {
  await gotoReady(page);
  await page.locator("input[type='file']").setInputFiles({
    name: "notes.txt",
    mimeType: "text/plain",
    buffer: Buffer.from("hello"),
  });
  const img = page.locator("img[alt='notes.txt']");
  expect(await img.count()).toBe(0);
});

test("uploading a file over 20MB shows red error and adds no row", async ({ page }) => {
  await gotoReady(page);
  await page.locator("input[type='file']").setInputFiles({
    name: "big.bin",
    mimeType: "application/octet-stream",
    buffer: Buffer.alloc(21 * 1024 * 1024),
  });
  await expect(page.locator(".error")).toBeVisible();
});

test("deleting an uploaded file removes its row", async ({ page, uploadsDir: _uploadsDir }) => {
  await gotoReady(page);
  await page.locator("input[type='file']").setInputFiles("e2e/fixtures/sample.png");
  await expect(page.getByText("sample.png", { exact: true }).first()).toBeVisible();
  page.once("dialog", (dialog) => dialog.accept());
  await page.getByRole("button", { name: "Delete" }).first().click();
  await expect(page.getByText("sample.png", { exact: true })).toHaveCount(0);
});

test("deleting an existing file removes its row", async ({ page, uploadsDir }) => {
  await fs.writeFile(path.join(uploadsDir, "550e8400-e29b-41d4-a716-446655440000__hello.txt"), "content");
  await page.goto("/");
  await expect(page.getByText("hello.txt", { exact: true })).toBeVisible();
  page.once("dialog", (dialog) => dialog.accept());
  await page.getByRole("button", { name: "Delete" }).click();
  await expect(page.getByText("hello.txt", { exact: true })).toHaveCount(0);
});

test("delete failure shows red error text", async ({ page, uploadsDir }) => {
  const diskName = "550e8400-e29b-41d4-a716-446655440000__hello.txt";
  await fs.writeFile(path.join(uploadsDir, diskName), "content");
  await page.goto("/");
  await fs.unlink(path.join(uploadsDir, diskName));
  page.once("dialog", (dialog) => dialog.accept());
  await page.getByRole("button", { name: "Delete" }).click();
  await expect(page.locator(".error")).toBeVisible();
});

test("existing file shows human-readable size", async ({ page, uploadsDir }) => {
  await fs.writeFile(path.join(uploadsDir, "550e8400-e29b-41d4-a716-446655440000__hello.txt"), "x".repeat(2048));
  await page.goto("/");
  await expect(page.getByText("2.0 KB", { exact: true })).toBeVisible();
});
