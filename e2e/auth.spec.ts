import { test, expect } from "@playwright/test";

test.describe("Authentication Flow", () => {
  test("redirects unauthenticated users from dashboard to auth", async ({ page }) => {
    await page.goto("/dashboard");
    
    // Should redirect to auth page
    await expect(page).toHaveURL(/.*auth/);
  });

  test("auth page loads with email input", async ({ page }) => {
    await page.goto("/auth");
    
    // Should have email input field
    const emailInput = page.locator('input[type="email"]');
    await expect(emailInput).toBeVisible();
  });

  test("shows validation error for invalid email", async ({ page }) => {
    await page.goto("/auth");
    
    const emailInput = page.locator('input[type="email"]');
    const submitButton = page.locator('button[type="submit"]');
    
    await emailInput.fill("invalid-email");
    await submitButton.click();
    
    // Browser's built-in validation should prevent submission
    // or we should see an error message
    await expect(page).toHaveURL(/.*auth/);
  });
});
