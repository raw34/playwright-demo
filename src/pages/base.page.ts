import { Page, Locator } from '@playwright/test';

export abstract class BasePage {
  protected page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async goto(url?: string) {
    if (url) {
      await this.page.goto(url);
    }
  }

  async getTitle(): Promise<string> {
    return await this.page.title();
  }

  async waitForLoadState(state?: 'load' | 'domcontentloaded' | 'networkidle') {
    await this.page.waitForLoadState(state || 'networkidle');
  }

  async screenshot(name: string) {
    await this.page.screenshot({ path: `test-results/${name}.png` });
  }

  protected getLocator(selector: string): Locator {
    return this.page.locator(selector);
  }

  protected async clickElement(selector: string) {
    await this.getLocator(selector).click();
  }

  protected async fillInput(selector: string, value: string) {
    await this.getLocator(selector).fill(value);
  }

  protected async getText(selector: string): Promise<string> {
    return (await this.getLocator(selector).textContent()) || '';
  }
}
