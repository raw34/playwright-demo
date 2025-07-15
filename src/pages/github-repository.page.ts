import { Page, Locator } from '@playwright/test';
import { BasePage } from './base.page';

export class GitHubRepositoryPage extends BasePage {
  private readonly repositoryTitle: Locator;
  private readonly description: Locator;
  private readonly starButton: Locator;
  private readonly starCount: Locator;
  private readonly forkCount: Locator;
  private readonly languageStats: Locator;
  private readonly readmeContent: Locator;
  private readonly codeTab: Locator;
  private readonly issuesTab: Locator;
  private readonly pullRequestsTab: Locator;
  private readonly actionsTab: Locator;

  constructor(page: Page) {
    super(page);
    this.repositoryTitle = this.getLocator('[data-testid="AppHeader-context-item-label"]');
    this.description = this.getLocator('[data-testid="repository-description"]');
    this.starButton = this.getLocator('#repository-details-container button[data-testid*="star"]');
    this.starCount = this.getLocator('#repo-stars-counter-star');
    this.forkCount = this.getLocator('#repo-network-counter');
    this.languageStats = this.getLocator('[data-testid="repository-lang-stats-graph"]');
    this.readmeContent = this.getLocator('[data-testid="readme"]');
    this.codeTab = this.getLocator('[data-content="Code"]');
    this.issuesTab = this.getLocator('[data-content="Issues"]');
    this.pullRequestsTab = this.getLocator('[data-content="Pull requests"]');
    this.actionsTab = this.getLocator('[data-content="Actions"]');
  }

  async getRepositoryName(): Promise<string> {
    return await this.repositoryTitle.textContent() || '';
  }

  async getDescription(): Promise<string> {
    return await this.description.textContent() || '';
  }

  async getStarCount(): Promise<string> {
    return await this.starCount.textContent() || '0';
  }

  async getForkCount(): Promise<string> {
    return await this.forkCount.textContent() || '0';
  }

  async hasReadme(): Promise<boolean> {
    return await this.readmeContent.isVisible();
  }

  async getLanguages(): Promise<string[]> {
    const languageElements = await this.languageStats.locator('span').all();
    const languages: string[] = [];
    
    for (const element of languageElements) {
      const text = await element.getAttribute('aria-label');
      if (text && text.includes('%')) {
        languages.push(text);
      }
    }
    
    return languages;
  }

  async clickIssuesTab() {
    await this.issuesTab.click();
  }

  async clickPullRequestsTab() {
    await this.pullRequestsTab.click();
  }

  async clickActionsTab() {
    await this.actionsTab.click();
  }

  async isRepositoryPublic(): Promise<boolean> {
    const publicBadge = this.getLocator('[title="Public repository"]');
    return await publicBadge.isVisible();
  }

  async getRepositoryStats(): Promise<{
    stars: string;
    forks: string;
    hasReadme: boolean;
    isPublic: boolean;
  }> {
    return {
      stars: await this.getStarCount(),
      forks: await this.getForkCount(),
      hasReadme: await this.hasReadme(),
      isPublic: await this.isRepositoryPublic(),
    };
  }
}