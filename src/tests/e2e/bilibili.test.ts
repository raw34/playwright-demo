import { test, expect } from '@playwright/test';
import { BilibiliPage } from '@/pages/bilibili.page';
import { bilibiliTestData } from '@/fixtures/bilibili.data';

test.describe('Bilibili 网站测试', () => {
  let bilibiliPage: BilibiliPage;

  test.beforeEach(async ({ page }) => {
    bilibiliPage = new BilibiliPage(page);
    // 设置较长的超时时间，因为 Bilibili 页面加载可能较慢
    test.setTimeout(30000);
  });

  test.describe('页面加载测试', () => {
    test('应该能够成功加载首页', async () => {
      await bilibiliPage.navigateToHome();

      // 验证页面标题
      await bilibiliPage.verifyPageTitle('哔哩哔哩');

      // 验证页面已加载
      expect(await bilibiliPage.isPageLoaded()).toBe(true);

      // 验证导航菜单可见
      await bilibiliPage.verifyElementVisible(bilibiliPage.selectors.navMenu);

      // 验证搜索框可见
      await bilibiliPage.verifyElementVisible(bilibiliPage.selectors.searchInput);
    });

    test('应该能够正确显示导航菜单', async () => {
      await bilibiliPage.navigateToHome();

      const navItems = await bilibiliPage.getNavItems();

      // 验证导航菜单不为空
      expect(navItems.length).toBeGreaterThan(0);

      // 验证包含主要分类（部分验证，因为实际网站可能会变化）
      const expectedCategories = ['首页', '动画', '番剧', '音乐', '游戏'];
      const hasExpectedCategories = expectedCategories.some(category =>
        navItems.some(item => item.includes(category))
      );
      expect(hasExpectedCategories).toBe(true);
    });
  });

  test.describe('搜索功能测试', () => {
    test('应该能够执行基本搜索', async () => {
      await bilibiliPage.navigateToHome();

      const searchQuery = bilibiliTestData.searchQueries.popular;
      await bilibiliPage.searchContent(searchQuery);

      // 等待搜索结果加载
      await bilibiliPage.waitForSearchResults();

      // 验证搜索结果页面
      await bilibiliPage.verifyUrl('/search');

      // 验证有搜索结果
      const videoCards = await bilibiliPage.getVideoCards();
      expect(videoCards.length).toBeGreaterThan(0);

      // 验证搜索结果数量在合理范围内
      expect(videoCards.length).toBeLessThanOrEqual(
        bilibiliTestData.expectedResults.searchResults.maxResultsPerPage
      );
    });

    test('应该能够获取视频信息', async () => {
      await bilibiliPage.navigateToHome();

      const searchQuery = bilibiliTestData.searchQueries.technology;
      await bilibiliPage.searchContent(searchQuery);
      await bilibiliPage.waitForSearchResults();

      // 获取视频标题和作者
      const videoTitles = await bilibiliPage.getVideoTitles();
      const videoAuthors = await bilibiliPage.getVideoAuthors();

      // 验证视频信息
      expect(videoTitles.length).toBeGreaterThan(0);
      expect(videoAuthors.length).toBeGreaterThan(0);

      // 验证标题长度合理
      videoTitles.forEach(title => {
        expect(title.length).toBeGreaterThan(0);
        expect(title.length).toBeLessThanOrEqual(
          bilibiliTestData.expectedResults.videoCard.maxTitleLength
        );
      });

      // 验证作者名称不为空
      videoAuthors.forEach(author => {
        expect(author.length).toBeGreaterThan(0);
      });
    });

    test('应该能够处理特殊字符搜索', async () => {
      await bilibiliPage.navigateToHome();

      const searchQuery = bilibiliTestData.searchQueries.specialChars;
      await bilibiliPage.searchContent(searchQuery);

      // 等待页面响应（可能没有结果或有错误处理）
      await bilibiliPage.waitForLoadState();

      // 验证页面没有崩溃
      expect(await bilibiliPage.isPageLoaded()).toBe(true);

      // 检查是否有错误信息
      const hasError = await bilibiliPage.hasErrorMessage();
      if (hasError) {
        const errorMessage = await bilibiliPage.getErrorMessage();
        console.log('搜索特殊字符时的错误信息:', errorMessage);
      }
    });

    test('应该能够处理空搜索查询', async () => {
      await bilibiliPage.navigateToHome();

      await bilibiliPage.searchContent(bilibiliTestData.searchQueries.empty);

      // 等待页面响应
      await bilibiliPage.waitForLoadState();

      // 验证页面状态
      expect(await bilibiliPage.isPageLoaded()).toBe(true);
    });
  });

  test.describe('视频播放测试', () => {
    test('应该能够点击视频并进入播放页面', async () => {
      await bilibiliPage.navigateToHome();

      const searchQuery = bilibiliTestData.searchQueries.technology;
      await bilibiliPage.searchContent(searchQuery);
      await bilibiliPage.waitForSearchResults();

      // 点击第一个视频
      await bilibiliPage.clickVideoByIndex(0);

      // 验证进入视频播放页面
      await bilibiliPage.verifyUrl('/video/');

      // 验证视频播放器可见
      const isPlayerVisible = await bilibiliPage.isVideoPlayerVisible();
      expect(isPlayerVisible).toBe(true);

      // 验证视频标题存在
      const videoTitle = await bilibiliPage.getVideoPlayerTitle();
      expect(videoTitle.length).toBeGreaterThan(0);

      // 验证UP主信息存在
      const uploader = await bilibiliPage.getVideoUploader();
      expect(uploader.length).toBeGreaterThan(0);
    });

    test.skip('应该能够播放和暂停视频', async () => {
      // 这个测试被跳过，因为可能涉及到复杂的视频播放逻辑
      // 在实际环境中可能需要更复杂的设置
      await bilibiliPage.navigateToHome();

      const searchQuery = bilibiliTestData.searchQueries.technology;
      await bilibiliPage.searchContent(searchQuery);
      await bilibiliPage.waitForSearchResults();

      await bilibiliPage.clickVideoByIndex(0);

      // 等待视频播放器加载
      await bilibiliPage.waitForTimeout(3000);

      // 尝试播放视频
      await bilibiliPage.playVideo();
      await bilibiliPage.waitForTimeout(2000);

      // 尝试暂停视频
      await bilibiliPage.pauseVideo();
    });
  });

  test.describe('导航测试', () => {
    test('应该能够点击导航菜单项', async () => {
      await bilibiliPage.navigateToHome();

      const navItems = await bilibiliPage.getNavItems();

      if (navItems.length > 1) {
        // 点击第二个导航项（避免点击首页）
        const targetNav = navItems[1];
        await bilibiliPage.clickNavItem(targetNav);

        // 验证页面已加载
        await bilibiliPage.waitForLoadState();
        expect(await bilibiliPage.isPageLoaded()).toBe(true);
      }
    });
  });

  test.describe('响应式测试', () => {
    test('应该能够在移动设备上正常显示', async ({ page }) => {
      // 设置移动设备视口
      await page.setViewportSize({ width: 375, height: 667 });

      await bilibiliPage.navigateToHome();

      // 验证页面在移动设备上正常加载
      expect(await bilibiliPage.isPageLoaded()).toBe(true);

      // 验证搜索功能在移动设备上工作
      await bilibiliPage.searchContent(bilibiliTestData.searchQueries.popular);
      await bilibiliPage.waitForSearchResults();

      const videoCards = await bilibiliPage.getVideoCards();
      expect(videoCards.length).toBeGreaterThan(0);
    });

    test('应该能够在平板设备上正常显示', async ({ page }) => {
      // 设置平板设备视口
      await page.setViewportSize({ width: 768, height: 1024 });

      await bilibiliPage.navigateToHome();

      // 验证页面在平板设备上正常加载
      expect(await bilibiliPage.isPageLoaded()).toBe(true);

      // 验证导航菜单在平板设备上工作
      const navItems = await bilibiliPage.getNavItems();
      expect(navItems.length).toBeGreaterThan(0);
    });
  });

  test.describe('性能测试', () => {
    test('页面加载时间应该在合理范围内', async () => {
      const startTime = Date.now();

      await bilibiliPage.navigateToHome();
      await bilibiliPage.waitForContentLoad();

      const loadTime = Date.now() - startTime;

      // 验证页面加载时间
      expect(loadTime).toBeLessThan(bilibiliTestData.performance.thresholds.pageLoadTime);

      console.log(`页面加载时间: ${loadTime}ms`);
    });

    test('搜索响应时间应该在合理范围内', async () => {
      await bilibiliPage.navigateToHome();

      const startTime = Date.now();

      await bilibiliPage.searchContent(bilibiliTestData.searchQueries.popular);
      await bilibiliPage.waitForSearchResults();

      const searchTime = Date.now() - startTime;

      // 验证搜索响应时间
      expect(searchTime).toBeLessThan(bilibiliTestData.performance.thresholds.searchResponseTime);

      console.log(`搜索响应时间: ${searchTime}ms`);
    });
  });

  test.describe('错误处理测试', () => {
    test('应该能够处理网络错误', async ({ page }) => {
      // 模拟网络错误
      await page.route('**/*', route => {
        if (route.request().url().includes('api')) {
          route.abort();
        } else {
          route.continue();
        }
      });

      await bilibiliPage.navigateToHome();

      // 验证页面仍然可以加载基本内容
      expect(await bilibiliPage.isPageLoaded()).toBe(true);
    });

    test('应该能够优雅地处理无效的搜索结果', async () => {
      await bilibiliPage.navigateToHome();

      // 搜索一个不太可能有结果的查询
      await bilibiliPage.searchContent('xyzabc123nonexistent');

      await bilibiliPage.waitForLoadState();

      // 验证页面没有崩溃
      expect(await bilibiliPage.isPageLoaded()).toBe(true);

      // 检查是否有相应的无结果提示
      const hasError = await bilibiliPage.hasErrorMessage();
      if (hasError) {
        const errorMessage = await bilibiliPage.getErrorMessage();
        console.log('无搜索结果时的提示:', errorMessage);
      }
    });
  });
});
