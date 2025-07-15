import { test, expect } from '@playwright/test';
import { LoginPage } from '@/pages/login.page';
import { HomePage } from '@/pages/home.page';
import { validUsers, invalidUsers } from '@/fixtures/test-data';

test.describe('Login Flow', () => {
  let loginPage: LoginPage;
  let homePage: HomePage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    homePage = new HomePage(page);
    await loginPage.goto();
  });

  test('should login with valid credentials', async ({ page }) => {
    const user = validUsers[0];
    
    await loginPage.login(user.username, user.password);
    await loginPage.waitForLoginSuccess();
    
    await expect(page).toHaveURL(/dashboard/);
    await homePage.waitForDashboardLoad();
    
    const welcomeMessage = await homePage.getWelcomeMessage();
    expect(welcomeMessage).toContain('Welcome');
  });

  test('should show error with invalid credentials', async () => {
    await loginPage.login(
      invalidUsers.wrongPassword.username,
      invalidUsers.wrongPassword.password
    );
    
    await expect(await loginPage.isErrorVisible()).toBe(true);
    const errorMessage = await loginPage.getErrorMessage();
    expect(errorMessage).toBeTruthy();
  });

  test('should not login with empty credentials', async () => {
    await loginPage.login(
      invalidUsers.emptyCredentials.username,
      invalidUsers.emptyCredentials.password
    );
    
    await expect(await loginPage.isErrorVisible()).toBe(true);
  });

  test('should logout successfully', async ({ page }) => {
    const user = validUsers[0];
    
    // Login first
    await loginPage.login(user.username, user.password);
    await loginPage.waitForLoginSuccess();
    
    // Logout
    await homePage.logout();
    
    // Should redirect to login page
    await expect(page).toHaveURL(/login/);
  });
});