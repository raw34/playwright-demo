import { Page, Locator } from '@playwright/test';
import { BasePage } from './base.page';

export class LoginPage extends BasePage {
  private readonly usernameInput: Locator;
  private readonly passwordInput: Locator;
  private readonly loginButton: Locator;
  private readonly errorMessage: Locator;

  constructor(page: Page) {
    super(page);
    this.usernameInput = this.getLocator('[data-testid="username"]');
    this.passwordInput = this.getLocator('[data-testid="password"]');
    this.loginButton = this.getLocator('[data-testid="login-button"]');
    this.errorMessage = this.getLocator('[data-testid="error-message"]');
  }

  async goto() {
    await super.goto('/login');
  }

  async login(username: string, password: string) {
    await this.usernameInput.fill(username);
    await this.passwordInput.fill(password);
    await this.loginButton.click();
  }

  async getErrorMessage(): Promise<string> {
    return await this.errorMessage.textContent() || '';
  }

  async isErrorVisible(): Promise<boolean> {
    return await this.errorMessage.isVisible();
  }

  async waitForLoginSuccess() {
    await this.page.waitForURL('**/dashboard');
  }
}