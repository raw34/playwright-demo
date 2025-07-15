import { test, expect } from '@playwright/test';
import { demoTestData } from '@/fixtures/test-data';
import { DemoSitesPage } from '@/pages/demo-sites.page';

test.describe('演示网站测试', () => {
  test('应该能够访问 example.com 并验证内容', async ({ page }) => {
    const demoPage = new DemoSitesPage(page);
    
    await demoPage.gotoExampleSite();
    await demoPage.waitForLoadState();
    
    // 验证页面标题
    await expect(page).toHaveTitle('Example Domain');
    
    // 验证页面内容
    await expect(await demoPage.hasExampleContent()).toBe(true);
    
    // 验证链接存在
    await expect(page.getByRole('link', { name: 'More information...' })).toBeVisible();
  });

  test('应该能够在 httpbin.org 测试 API 响应', async ({ page }) => {
    const demoPage = new DemoSitesPage(page);
    
    await demoPage.gotoHttpBinJson();
    await demoPage.waitForLoadState();
    
    // 验证页面加载成功并包含预期内容
    await expect(page.locator('pre')).toBeVisible();
    await expect(page.locator('body')).toContainText('slideshow');
  });

  test('应该能够测试表单交互', async ({ page }) => {
    const demoPage = new DemoSitesPage(page);
    
    await demoPage.gotoLoginDemo();
    await demoPage.waitForLoadState();
    
    // 执行登录
    await demoPage.loginWithCredentials(
      demoTestData.loginCredentials.valid.username,
      demoTestData.loginCredentials.valid.password
    );
    
    // 验证登录成功
    await expect(await demoPage.isLoginSuccessful()).toBe(true);
    await expect(page.getByText('Welcome to the Secure Area')).toBeVisible();
  });

  test('应该能够测试无效登录凭据', async ({ page }) => {
    const demoPage = new DemoSitesPage(page);
    
    await demoPage.gotoLoginDemo();
    await demoPage.waitForLoadState();
    
    // 使用无效凭据登录
    await demoPage.loginWithCredentials(
      demoTestData.loginCredentials.invalid.username,
      demoTestData.loginCredentials.invalid.password
    );
    
    // 验证登录失败
    await expect(page.getByText('Your username is invalid!')).toBeVisible();
  });

  test('应该能够测试页面截图功能', async ({ page }) => {
    const demoPage = new DemoSitesPage(page);
    
    await demoPage.gotoExampleSite();
    await demoPage.waitForLoadState('networkidle');
    
    // 截图
    await demoPage.takeScreenshotAs('example-homepage.png');
    
    // 验证页面内容
    await expect(await demoPage.hasExampleContent()).toBe(true);
  });

  test('应该能够测试不同网站的响应时间', async ({ page }) => {
    const demoPage = new DemoSitesPage(page);
    const startTime = Date.now();
    
    await demoPage.gotoExampleSite();
    await demoPage.waitForLoadState('networkidle');
    
    const loadTime = Date.now() - startTime;
    console.log(`Example.com 加载时间: ${loadTime}ms`);
    
    // 验证页面在合理时间内加载完成（10秒以内）
    expect(loadTime).toBeLessThan(10000);
    
    // 验证页面内容正确
    await expect(await demoPage.hasExampleContent()).toBe(true);
  });
});