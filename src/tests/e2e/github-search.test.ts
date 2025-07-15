import { test, expect } from '@playwright/test';
import { GitHubHomePage } from '@/pages/github-home.page';
import { GitHubSearchPage } from '@/pages/github-search.page';
import { GitHubRepositoryPage } from '@/pages/github-repository.page';
import { gitHubTestData } from '@/fixtures/test-data';

test.describe('GitHub 搜索功能测试', () => {
  let homePage: GitHubHomePage;
  let searchPage: GitHubSearchPage;
  let repositoryPage: GitHubRepositoryPage;

  test.beforeEach(async ({ page }) => {
    homePage = new GitHubHomePage(page);
    searchPage = new GitHubSearchPage(page);
    repositoryPage = new GitHubRepositoryPage(page);
  });

  test('应该能够访问 GitHub 首页', async ({ page }) => {
    await homePage.goto();
    
    // 验证页面标题
    const title = await homePage.getPageTitle();
    expect(title).toContain('GitHub');
    
    // 验证 Logo 可见
    await expect(await homePage.isLogoVisible()).toBe(true);
  });

  test('应该能够搜索热门仓库', async ({ page }) => {
    await homePage.goto();
    
    // 搜索 Playwright
    await homePage.searchRepository(gitHubTestData.searchQueries.popular);
    
    // 等待搜索结果页面加载
    await page.waitForURL('**/search**');
    
    // 验证有搜索结果
    const hasResults = await searchPage.hasResults();
    expect(hasResults).toBe(true);
    
    // 获取仓库名称列表
    const repositories = await searchPage.getRepositoryNames();
    expect(repositories.length).toBeGreaterThan(0);
    
    // 验证搜索结果中包含 Playwright 相关仓库
    const playwrightRepos = repositories.filter(repo => 
      repo.toLowerCase().includes('playwright')
    );
    expect(playwrightRepos.length).toBeGreaterThan(0);
  });

  test('应该能够访问具体仓库页面', async ({ page }) => {
    await homePage.goto();
    
    // 搜索具体仓库
    await homePage.searchRepository(gitHubTestData.searchQueries.specific);
    await page.waitForURL('**/search**');
    
    // 点击第一个搜索结果
    await searchPage.clickFirstRepository();
    
    // 等待仓库页面加载
    await page.waitForURL('**/microsoft/playwright**');
    
    // 验证仓库信息
    const repoName = await repositoryPage.getRepositoryName();
    expect(repoName.toLowerCase()).toContain('playwright');
    
    // 验证仓库有 README
    const hasReadme = await repositoryPage.hasReadme();
    expect(hasReadme).toBe(true);
    
    // 验证是公开仓库
    const isPublic = await repositoryPage.isRepositoryPublic();
    expect(isPublic).toBe(true);
  });

  test('应该能够查看仓库统计信息', async ({ page }) => {
    const testRepo = gitHubTestData.repositories.playwright;
    
    // 直接访问仓库页面
    await page.goto(`https://github.com/${testRepo.fullName}`);
    
    // 获取仓库统计信息
    const stats = await repositoryPage.getRepositoryStats();
    
    // 验证 Star 数量（应该大于预期最小值）
    const starCount = parseInt(stats.stars.replace(/[^\d]/g, '')) || 0;
    expect(starCount).toBeGreaterThan(gitHubTestData.expectedResults.minStars);
    
    // 验证 Fork 数量
    const forkCount = parseInt(stats.forks.replace(/[^\d]/g, '')) || 0;
    expect(forkCount).toBeGreaterThan(gitHubTestData.expectedResults.minForks);
    
    // 验证有 README
    expect(stats.hasReadme).toBe(true);
    
    // 验证是公开仓库
    expect(stats.isPublic).toBe(true);
  });

  test('应该能够查看仓库编程语言分布', async ({ page }) => {
    const testRepo = gitHubTestData.repositories.playwright;
    
    // 访问仓库页面
    await page.goto(`https://github.com/${testRepo.fullName}`);
    
    // 获取编程语言信息
    const languages = await repositoryPage.getLanguages();
    
    // 验证有编程语言信息
    expect(languages.length).toBeGreaterThan(0);
    
    // 验证包含期望的编程语言
    const languageNames = languages.join(' ');
    testRepo.expectedLanguages.forEach(expectedLang => {
      expect(languageNames).toContain(expectedLang);
    });
  });

  test('应该能够导航到不同的仓库标签页', async ({ page }) => {
    const testRepo = gitHubTestData.repositories.playwright;
    
    // 访问仓库页面
    await page.goto(`https://github.com/${testRepo.fullName}`);
    
    // 点击 Issues 标签页
    await repositoryPage.clickIssuesTab();
    await page.waitForURL('**/issues**');
    expect(page.url()).toContain('/issues');
    
    // 点击 Pull Requests 标签页
    await repositoryPage.clickPullRequestsTab();
    await page.waitForURL('**/pulls**');
    expect(page.url()).toContain('/pulls');
    
    // 点击 Actions 标签页
    await repositoryPage.clickActionsTab();
    await page.waitForURL('**/actions**');
    expect(page.url()).toContain('/actions');
  });

  test('搜索结果应该响应式加载', async ({ page }) => {
    await homePage.goto();
    
    // 搜索热门关键词
    await homePage.searchRepository(gitHubTestData.searchQueries.trending);
    await page.waitForURL('**/search**');
    
    // 验证搜索结果数量在合理范围内
    const repositories = await searchPage.getRepositoryNames();
    expect(repositories.length).toBeLessThanOrEqual(gitHubTestData.expectedResults.maxSearchResults);
    expect(repositories.length).toBeGreaterThan(0);
    
    // 验证每个结果都是有效的仓库名称
    repositories.forEach(repoName => {
      expect(repoName.trim().length).toBeGreaterThan(0);
    });
  });
});