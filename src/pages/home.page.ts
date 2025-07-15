import { Page, Locator } from '@playwright/test';
import { BasePage } from './base.page';

export class HomePage extends BasePage {
  private readonly welcomeMessage: Locator;
  private readonly navigationMenu: Locator;
  private readonly userProfile: Locator;
  private readonly logoutButton: Locator;

  constructor(page: Page) {
    super(page);
    this.welcomeMessage = this.getLocator('[data-testid="welcome-message"]');
    this.navigationMenu = this.getLocator('[data-testid="nav-menu"]');
    this.userProfile = this.getLocator('[data-testid="user-profile"]');
    this.logoutButton = this.getLocator('[data-testid="logout-button"]');
  }

  async goto() {
    await super.goto('/dashboard');
  }

  async getWelcomeMessage(): Promise<string> {
    return await this.welcomeMessage.textContent() || '';
  }

  async isNavigationVisible(): Promise<boolean> {
    return await this.navigationMenu.isVisible();
  }

  async clickUserProfile() {
    await this.userProfile.click();
  }

  async logout() {
    await this.clickUserProfile();
    await this.logoutButton.click();
  }

  async waitForDashboardLoad() {
    await this.waitForLoadState('networkidle');
    await this.welcomeMessage.waitFor({ state: 'visible' });
  }
}