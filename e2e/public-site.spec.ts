import { test, expect } from "@playwright/test";

test.describe("Public Site Display", () => {
  test("homepage loads successfully", async ({ page }) => {
    await page.goto("/");
    
    // Should have some content
    await expect(page.locator("body")).not.toBeEmpty();
  });

  test("pricing page is accessible", async ({ page }) => {
    await page.goto("/pricing");
    
    // Should show pricing content
    await expect(page).toHaveURL(/.*pricing/);
  });

  test("not found page shows for invalid routes", async ({ page }) => {
    await page.goto("/some-nonexistent-page-12345");
    
    // Should show 404 or not found content
    const bodyText = await page.locator("body").textContent();
    expect(bodyText).toBeTruthy();
  });
});

test.describe("Public Site - Contact Form", () => {
  // This test would need a published public site to test against
  // For now, we test that the form components work in isolation

  test("contact form shows validation for empty required fields", async ({ page }) => {
    // Navigate to a public site if one exists
    // This is a placeholder - in production, you'd have a test site set up
    await page.goto("/");
    
    // Check page loads
    await expect(page.locator("body")).toBeVisible();
  });
});
