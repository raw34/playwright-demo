import { Page, Locator } from '@playwright/test';
import { BasePage } from './base.page';

export class GitHubHomePage extends BasePage {
  private readonly searchInput: Locator;
  private readonly searchButton: Locator;
  private readonly signInButton: Locator;
  private readonly logo: Locator;

  constructor(page: Page) {
    super(page);
    this.searchInput = this.getLocator('[data-target="qbsearch-input.inputButtonText"]');
    this.searchButton = this.getLocator('[data-target="qbsearch-input.inputButton"]');
    this.signInButton = this.getLocator('a[href="/login"]');
    this.logo = this.getLocator('[aria-label="Homepage"]');
  }

  async goto() {
    await super.goto('https://github.com');
  }

  async searchRepository(query: string) {
    await this.searchInput.click();
    await this.searchInput.fill(query);
    await this.searchInput.press('Enter');
  }

  async clickSignIn() {
    await this.signInButton.click();
  }

  async isLogoVisible(): Promise<boolean> {
    return await this.logo.isVisible();
  }

  async getPageTitle(): Promise<string> {
    return await this.page.title();
  }
}