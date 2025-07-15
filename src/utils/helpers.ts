import { Page } from '@playwright/test';

export class TestHelpers {
  static async waitForResponse(page: Page, urlPattern: string | RegExp, timeout = 30000) {
    return await page.waitForResponse(urlPattern, { timeout });
  }

  static async interceptRequest(page: Page, urlPattern: string | RegExp, response: any) {
    await page.route(urlPattern, route => route.fulfill({ json: response }));
  }

  static generateRandomString(length: number): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  static generateRandomEmail(): string {
    const randomString = this.generateRandomString(8);
    return `test-${randomString}@example.com`;
  }

  static async takeScreenshot(page: Page, name: string) {
    await page.screenshot({
      path: `test-results/screenshots/${name}-${Date.now()}.png`,
      fullPage: true,
    });
  }

  static formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  static async clearBrowserData(page: Page) {
    await page.context().clearCookies();
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
  }
}
