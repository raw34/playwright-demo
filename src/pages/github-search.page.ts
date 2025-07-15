import { Page, Locator } from '@playwright/test';
import { BasePage } from './base.page';

export class GitHubSearchPage extends BasePage {
  private readonly searchInput: Locator;
  private readonly searchResults: Locator;
  private readonly repositoryLinks: Locator;
  private readonly resultCount: Locator;
  private readonly sortDropdown: Locator;
  private readonly languageFilter: Locator;

  constructor(page: Page) {
    super(page);
    this.searchInput = this.getLocator('#qb_input');
    this.searchResults = this.getLocator('[data-testid="results-list"]');
    this.repositoryLinks = this.getLocator('[data-testid="results-list"] h3 a');
    this.resultCount = this.getLocator('[data-testid="results-list"] h3');
    this.sortDropdown = this.getLocator('summary[aria-label*="Sort"]');
    this.languageFilter = this.getLocator('[data-filter-type="language"]');
  }

  async getSearchResults(): Promise<string[]> {
    await this.repositoryLinks.first().waitFor();
    return await this.repositoryLinks.allTextContents();
  }

  async getResultCount(): Promise<string> {
    return await this.resultCount.first().textContent() || '';
  }

  async clickFirstRepository() {
    await this.repositoryLinks.first().click();
  }

  async getRepositoryNames(): Promise<string[]> {
    const links = await this.repositoryLinks.all();
    const names: string[] = [];
    
    for (const link of links) {
      const text = await link.textContent();
      if (text) names.push(text.trim());
    }
    
    return names;
  }

  async filterByLanguage(language: string) {
    await this.languageFilter.filter({ hasText: language }).first().click();
  }

  async sortBy(option: string) {
    await this.sortDropdown.click();
    await this.page.getByRole('menuitem', { name: option }).click();
  }

  async hasResults(): Promise<boolean> {
    return await this.repositoryLinks.count() > 0;
  }
}