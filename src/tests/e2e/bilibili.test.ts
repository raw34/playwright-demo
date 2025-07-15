import { test, expect } from '@playwright/test';

test.describe('Bilibili 网站测试', () => {
  test('应该能够成功访问首页', async ({ page }) => {
    const response = await page.goto('https://www.bilibili.com');

    // 验证页面响应正常
    expect(response?.status()).toBe(200);

    // 验证页面包含视频或番剧相关内容
    await expect(page.locator('body')).toContainText(/首页|番剧|直播|游戏|会员|动画|视频/);
  });

  test('应该能够显示导航菜单', async ({ page }) => {
    await page.goto('https://www.bilibili.com');
    
    // 等待页面加载完成
    await page.waitForLoadState('domcontentloaded');
    
    // 验证页面包含导航相关文本
    await expect(page.locator('body')).toContainText(/首页|番剧|直播|游戏/);
    
    // 验证页面包含视频或内容元素
    await expect(page.locator('body')).toContainText(/视频|动画|音乐|娱乐/);
  });

  test('应该能够检测页面基本元素', async ({ page }) => {
    await page.goto('https://www.bilibili.com');
    
    // 等待页面加载完成
    await page.waitForLoadState('domcontentloaded');
    
    // 验证页面包含基本内容
    await expect(page.locator('body')).toContainText(/会员|登录|首页|番剧/);
    
    // 验证页面标题
    await expect(page).toHaveTitle(/bilibili|哔哩哔哩/i);
  });
});
