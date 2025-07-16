import { test, expect } from '@playwright/test';
import { demoTestData } from '@/fixtures/demo.data';
import { gitHubTestData } from '@/fixtures/github.data';
import { GitHubPage } from '@/pages/github.page';

test.describe('GitHub 网站测试', () => {
  test('应该能够访问 GitHub 首页并验证标题', async ({ page }) => {
    const githubPage = new GitHubPage(page);

    await githubPage.gotoHomePage();
    await githubPage.waitForHomePageLoad();

    // 验证页面标题
    expect(await githubPage.isGitHubHomePage()).toBe(true);

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

  test('应该能够搜索仓库并查看搜索结果', async ({ page }) => {
    const githubPage = new GitHubPage(page);
    
    // 直接访问 GitHub 搜索页面
    await page.goto('https://github.com/search?q=playwright&type=repositories');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(3000);
    
    // 验证搜索结果页面
    const searchResultsExist = await page.locator('[data-testid="results-list"], .search-results, .Box-row, .repo-list-item, .js-navigation-item').count();
    expect(searchResultsExist).toBeGreaterThan(0);
    
    // 验证页面包含搜索相关内容
    await expect(page.locator('body')).toContainText('playwright');
    
    console.log('搜索结果数量:', searchResultsExist);
  });

  test('应该能够访问特定用户/组织页面并验证信息', async ({ page }) => {
    const githubPage = new GitHubPage(page);
    
    // 访问 Microsoft 组织页面
    const testUser = gitHubTestData.users.microsoft;
    await githubPage.gotoUser(testUser.username);
    
    // 验证页面加载成功
    await page.waitForTimeout(3000);
    
    // 验证页面包含用户相关信息
    await expect(page.locator('body')).toContainText(testUser.username);
    
    // 验证页面标题包含用户名（不区分大小写）
    const pageTitle = await page.title();
    expect(pageTitle.toLowerCase()).toContain(testUser.username.toLowerCase());
    
    // 验证用户有仓库 - 检查是否存在仓库相关元素
    const hasRepoElements = await page.locator('.repo-list, .user-repo-search-results, [data-testid="repos-tab"]').count();
    expect(hasRepoElements).toBeGreaterThan(0);
    
    console.log('页面标题:', pageTitle);
    console.log('仓库相关元素数量:', hasRepoElements);
  });
});
