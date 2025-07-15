import { Page, expect } from '@playwright/test';
import { BasePage } from './base.page';

export class BilibiliPage extends BasePage {
  readonly baseUrl = 'https://www.bilibili.com';

  // 页面元素选择器
  readonly selectors = {
    // 搜索相关
    searchInput: '.nav-search-input',
    searchButton: '.nav-search-btn',
    searchSuggestions: '.search-suggestion',

    // 登录相关
    loginButton: '.header-login-entry',
    loginModal: '.login-app',
    usernameInput: '#login-username',
    passwordInput: '#login-passwd',
    loginSubmit: '.btn-login',

    // 导航菜单
    navMenu: '.nav-menu',
    homeNav: '.nav-menu .nav-item:first-child',

    // 视频相关
    videoCard: '.video-card',
    videoTitle: '.video-card .info .title',
    videoAuthor: '.video-card .info .name',
    videoUploader: '.up-name',
    videoPlayer: '.bilibili-player-video video',
    videoTitle_detail: '.video-title',

    // 用户相关
    userAvatar: '.header-avatar-wrap',
    userDropdown: '.header-avatar-wrap .dropdown',

    // 分区相关
    categoryNav: '.nav-menu .nav-item',
    trendingSection: '.trending',

    // 通用
    loadingIndicator: '.loading',
    pagination: '.pagination',
    errorMessage: '.error-message',
  };

  constructor(page: Page) {
    super(page);
  }

  // 导航方法
  async navigateToHome() {
    await this.goto(this.baseUrl);
    await this.waitForLoadState();
  }

  async navigateToSearch() {
    await this.goto(`${this.baseUrl}/search`);
    await this.waitForLoadState();
  }

  // 搜索功能
  async searchContent(query: string) {
    await this.fillInput(this.selectors.searchInput, query);
    await this.clickElement(this.selectors.searchButton);
    await this.waitForLoadState();
  }

  async getSearchSuggestions(): Promise<string[]> {
    const suggestions = await this.page.locator(this.selectors.searchSuggestions).all();
    return Promise.all(suggestions.map(s => s.textContent().then(text => text || '')));
  }

  async waitForSearchResults() {
    await this.page.waitForSelector(this.selectors.videoCard, { timeout: 10000 });
  }

  // 视频操作
  async getVideoCards() {
    return await this.page.locator(this.selectors.videoCard).all();
  }

  async getVideoTitles(): Promise<string[]> {
    const titles = await this.page.locator(this.selectors.videoTitle).all();
    return Promise.all(titles.map(t => t.textContent().then(text => text || '')));
  }

  async getVideoAuthors(): Promise<string[]> {
    const authors = await this.page.locator(this.selectors.videoAuthor).all();
    return Promise.all(authors.map(a => a.textContent().then(text => text || '')));
  }

  async clickVideoByIndex(index: number) {
    const videoCards = await this.getVideoCards();
    if (videoCards[index]) {
      await videoCards[index].click();
      await this.waitForLoadState();
    }
  }

  async clickVideoByTitle(title: string) {
    await this.page.locator(this.selectors.videoTitle).filter({ hasText: title }).first().click();
    await this.waitForLoadState();
  }

  // 登录功能
  async openLoginModal() {
    await this.clickElement(this.selectors.loginButton);
    await this.page.waitForSelector(this.selectors.loginModal);
  }

  async login(username: string, password: string) {
    await this.openLoginModal();
    await this.fillInput(this.selectors.usernameInput, username);
    await this.fillInput(this.selectors.passwordInput, password);
    await this.clickElement(this.selectors.loginSubmit);
    // 等待登录完成，可能需要处理验证码等
    await this.page.waitForTimeout(2000);
  }

  async isLoggedIn(): Promise<boolean> {
    try {
      await this.page.waitForSelector(this.selectors.userAvatar, { timeout: 5000 });
      return true;
    } catch {
      return false;
    }
  }

  // 导航菜单操作
  async clickNavItem(itemText: string) {
    await this.page.locator(this.selectors.categoryNav).filter({ hasText: itemText }).click();
    await this.waitForLoadState();
  }

  async getNavItems(): Promise<string[]> {
    const items = await this.page.locator(this.selectors.categoryNav).all();
    return Promise.all(items.map(item => item.textContent().then(text => text || '')));
  }

  // 视频播放页面操作
  async getVideoPlayerTitle(): Promise<string> {
    return await this.getText(this.selectors.videoTitle_detail);
  }

  async getVideoUploader(): Promise<string> {
    return await this.getText(this.selectors.videoUploader);
  }

  async isVideoPlayerVisible(): Promise<boolean> {
    try {
      await this.page.waitForSelector(this.selectors.videoPlayer, { timeout: 10000 });
      return true;
    } catch {
      return false;
    }
  }

  async playVideo() {
    const player = this.page.locator(this.selectors.videoPlayer);
    await player.click();
  }

  async pauseVideo() {
    const player = this.page.locator(this.selectors.videoPlayer);
    await player.click();
  }

  // 页面状态检查
  async isPageLoaded(): Promise<boolean> {
    try {
      await this.page.waitForSelector(this.selectors.navMenu, { timeout: 10000 });
      return true;
    } catch {
      return false;
    }
  }

  async hasLoadingIndicator(): Promise<boolean> {
    try {
      await this.page.waitForSelector(this.selectors.loadingIndicator, { timeout: 2000 });
      return true;
    } catch {
      return false;
    }
  }

  async waitForContentLoad() {
    // 等待加载指示器消失
    try {
      await this.page.waitForSelector(this.selectors.loadingIndicator, {
        state: 'hidden',
        timeout: 15000,
      });
    } catch {
      // 如果没有加载指示器，继续执行
    }
  }

  // 错误处理
  async hasErrorMessage(): Promise<boolean> {
    try {
      await this.page.waitForSelector(this.selectors.errorMessage, { timeout: 2000 });
      return true;
    } catch {
      return false;
    }
  }

  async getErrorMessage(): Promise<string> {
    return await this.getText(this.selectors.errorMessage);
  }

  // 通用验证方法
  async verifyPageTitle(expectedTitle: string) {
    const actualTitle = await this.getTitle();
    expect(actualTitle).toContain(expectedTitle);
  }

  async verifyUrl(expectedUrl: string) {
    expect(this.page.url()).toContain(expectedUrl);
  }

  async verifyElementVisible(selector: string) {
    await expect(this.page.locator(selector)).toBeVisible();
  }

  async verifyElementHidden(selector: string) {
    await expect(this.page.locator(selector)).toBeHidden();
  }

  async verifyElementText(selector: string, expectedText: string) {
    await expect(this.page.locator(selector)).toContainText(expectedText);
  }
}
