import { Page } from '@playwright/test';
import { BasePage } from './base.page';

export class DemoSitesPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  async gotoExampleSite() {
    await super.goto('https://example.com');
  }

  async gotoHttpBinJson() {
    await super.goto('https://httpbin.org/json');
  }

  async gotoLoginDemo() {
    await super.goto('https://the-internet.herokuapp.com/login');
  }

  async loginWithCredentials(username: string, password: string) {
    await this.fillInput('#username', username);
    await this.fillInput('#password', password);
    await this.clickElement('button[type="submit"]');
  }

  async isLoginSuccessful(): Promise<boolean> {
    const successText = this.getLocator('text="You logged into a secure area!"');
    return await successText.isVisible();
  }

  async hasExampleContent(): Promise<boolean> {
    const titleElement = this.getLocator('text="Example Domain"');
    return await titleElement.isVisible();
  }

  async hasJsonResponse(): Promise<boolean> {
    try {
      const preElement = this.getLocator('pre');
      const slideshowText = this.getLocator('text="slideshow"');

      await preElement.waitFor({ timeout: 5000 });
      const preVisible = await preElement.isVisible();
      const slideshowVisible = await slideshowText.isVisible();

      return preVisible && slideshowVisible;
    } catch {
      return false;
    }
  }

  async takeScreenshotAs(filename: string) {
    await this.page.screenshot({ path: `test-results/${filename}` });
  }
}
