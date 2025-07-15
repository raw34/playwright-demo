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
      'a[href="/"]'
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
    await this.page.waitForLoadState('networkidle');
    // 等待页面主要内容加载
    await this.page.waitForSelector('body', { timeout: 10000 });
  }
}