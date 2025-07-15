import { test, expect } from '@playwright/test';
import { demoTestData } from '@/fixtures/test-data';
import { GitHubPage } from '@/pages/github.page';

test.describe('GitHub 网站测试', () => {
  test('应该能够访问 GitHub 首页并验证标题', async ({ page }) => {
    const githubPage = new GitHubPage(page);
    
    await githubPage.gotoHomePage();
    await githubPage.waitForHomePageLoad();
    
    // 验证页面标题
    await expect(await githubPage.isGitHubHomePage()).toBe(true);
    
    console.log('页面标题:', await githubPage.getPageTitle());
  });

  test('应该能够验证 GitHub Logo 存在', async ({ page }) => {
    const githubPage = new GitHubPage(page);
    
    await githubPage.gotoHomePage();
    await githubPage.waitForHomePageLoad();
    
    // 验证 GitHub Logo 可见
    const hasLogo = await githubPage.hasGitHubLogo();
    expect(hasLogo).toBe(true);
  });

  test('应该能够验证页面基本结构', async ({ page }) => {
    const githubPage = new GitHubPage(page);
    
    await githubPage.gotoHomePage();
    await githubPage.waitForHomePageLoad();
    
    // 验证页面包含 GitHub 相关内容
    await expect(page.locator('body')).toContainText('GitHub');
    
    // 验证页面响应正常
    const response = await page.goto(demoTestData.testUrls.github);
    expect(response?.status()).toBe(200);
  });
});