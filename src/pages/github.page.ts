import { Page } from '@playwright/test';
import { BasePage } from './base.page';

export class GitHubPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  async gotoHomePage() {
    await super.goto('https://github.com');
  }

  async getPageTitle(): Promise<string> {
    return await this.page.title();
  }

  async isGitHubHomePage(): Promise<boolean> {
    const title = await this.getPageTitle();
    return title.includes('GitHub');
  }

  async hasGitHubLogo(): Promise<boolean> {
    // 尝试多个可能的 GitHub logo 选择器
    const logoSelectors = [
      '[aria-label*="GitHub"]',
      '.octicon-mark-github',
      '.Header-link--homepage',
      'a[href="/"]',
    ];

    for (const selector of logoSelectors) {
      try {
        const logo = this.getLocator(selector);
        if (await logo.isVisible({ timeout: 2000 })) {
          return true;
        }
      } catch {
        continue;
      }
    }

    return false;
  }

  async waitForHomePageLoad() {
    await this.page.waitForLoadState('domcontentloaded');
    // 等待页面主要内容加载
    await this.page.locator('body').waitFor({ timeout: 10000 });
  }

  async searchRepository(query: string) {
    // 查找搜索框 - 更新选择器以匹配当前GitHub界面
    const searchSelectors = [
      'input[name="q"]',
      'input[placeholder*="Search"]',
      '[data-testid="search-input"]',
      '.js-site-search-focus',
      '.Header-search-input',
      'input[aria-label*="Search"]',
      'input[type="text"]'
    ];

    let searchBox = null;
    for (const selector of searchSelectors) {
      try {
        const element = this.getLocator(selector);
        if (await element.isVisible({ timeout: 2000 })) {
          searchBox = element;
          break;
        }
      } catch {
        continue;
      }
    }

    if (!searchBox) {
      throw new Error('搜索框未找到');
    }

    await searchBox.fill(query);
    await searchBox.press('Enter');
    
    // 等待搜索结果页面加载
    await this.page.waitForLoadState('domcontentloaded');
    await this.page.waitForTimeout(3000); // 等待AJAX请求完成
  }

  async getSearchResults() {
    // 等待搜索结果加载
    await this.page.waitForSelector('.repo-list-item, .Box-row, [data-testid="results-list"]', { timeout: 10000 });
    
    const results = await this.page.locator('.repo-list-item, .Box-row').all();
    return results.length;
  }

  async clickFirstSearchResult() {
    // 点击第一个搜索结果
    const firstResult = this.getLocator('.repo-list-item:first-child a, .Box-row:first-child a');
    await firstResult.click();
    await this.page.waitForLoadState('domcontentloaded');
  }

  async gotoRepository(owner: string, repo: string) {
    const url = `https://github.com/${owner}/${repo}`;
    await this.page.goto(url);
    await this.page.waitForLoadState('domcontentloaded');
  }

  async getRepositoryTitle(): Promise<string> {
    // 获取仓库标题
    const titleSelectors = [
      'h1[data-testid="repository-title"]',
      '.js-repo-nav h1',
      '.js-repo-nav-item h1',
      '.Box-header h1',
      'h1 strong a'
    ];

    for (const selector of titleSelectors) {
      try {
        const title = await this.page.locator(selector).textContent({ timeout: 2000 });
        if (title) {
          return title.trim();
        }
      } catch {
        continue;
      }
    }
    
    return '';
  }

  async getRepositoryDescription(): Promise<string> {
    // 获取仓库描述
    const descriptionSelectors = [
      '[data-testid="repository-description"]',
      '.js-repo-description',
      '.repository-description',
      '.Box-body p'
    ];

    for (const selector of descriptionSelectors) {
      try {
        const description = await this.page.locator(selector).textContent({ timeout: 2000 });
        if (description) {
          return description.trim();
        }
      } catch {
        continue;
      }
    }
    
    return '';
  }

  async hasRepositoryTabs(): Promise<boolean> {
    // 检查仓库是否有标签页 (Code, Issues, Pull requests等)
    const tabSelectors = [
      '.js-repo-nav',
      '.tabnav',
      '.UnderlineNav',
      '[data-testid="repository-navigation"]'
    ];

    for (const selector of tabSelectors) {
      try {
        const tabs = this.getLocator(selector);
        if (await tabs.isVisible({ timeout: 2000 })) {
          return true;
        }
      } catch {
        continue;
      }
    }
    
    return false;
  }

  async gotoUser(username: string) {
    const url = `https://github.com/${username}`;
    await this.page.goto(url);
    await this.page.waitForLoadState('domcontentloaded');
  }

  async getUserName(): Promise<string> {
    // 获取用户名或组织名 - 更新选择器以匹配当前GitHub界面
    const nameSelectors = [
      '.vcard-fullname',
      '.p-name', 
      '.js-profile-editable-name',
      'h1.vcard-names .p-name',
      '.js-profile-editable-replace-with input',
      'h1[data-testid="profile-name"]',
      '.js-profile-editable-area .p-name',
      'h1 .p-name',
      '.vcard-names .p-name',
      '[data-testid="profile-header"] h1',
      'h1 span[data-testid="profile-name"]'
    ];

    for (const selector of nameSelectors) {
      try {
        const element = this.page.locator(selector);
        if (await element.isVisible({ timeout: 2000 })) {
          const name = await element.textContent();
          if (name && name.trim()) {
            return name.trim();
          }
        }
      } catch {
        continue;
      }
    }
    
    // 如果没有找到显示名称，尝试获取username
    try {
      const usernameElement = this.page.locator('.vcard-username, .p-nickname');
      if (await usernameElement.isVisible({ timeout: 2000 })) {
        const username = await usernameElement.textContent();
        if (username && username.trim()) {
          return username.trim();
        }
      }
    } catch {
      // 忽略错误
    }
    
    return '';
  }

  async getUserBio(): Promise<string> {
    // 获取用户简介
    const bioSelectors = [
      '.user-profile-bio',
      '.js-user-profile-bio',
      '.p-note',
      '.js-profile-editable-bio'
    ];

    for (const selector of bioSelectors) {
      try {
        const bio = await this.page.locator(selector).textContent({ timeout: 2000 });
        if (bio) {
          return bio.trim();
        }
      } catch {
        continue;
      }
    }
    
    return '';
  }

  async hasUserRepositories(): Promise<boolean> {
    // 检查用户是否有仓库
    const repoSelectors = [
      '[data-testid="repository-list"]',
      '.js-repo-list',
      '.repo-list',
      '.user-repo-search-results'
    ];

    for (const selector of repoSelectors) {
      try {
        const repos = this.getLocator(selector);
        if (await repos.isVisible({ timeout: 3000 })) {
          const repoItems = await this.page.locator(`${selector} .repo-list-item, ${selector} .Box-row`).count();
          return repoItems > 0;
        }
      } catch {
        continue;
      }
    }
    
    return false;
  }
}
