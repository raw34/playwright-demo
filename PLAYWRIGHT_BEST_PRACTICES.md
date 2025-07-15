# Playwright 最佳实践指南

基于现有项目结构，总结的 Playwright 自动化测试最佳实践。

## 📁 项目结构最佳实践

### 推荐目录结构
```
src/
├── config/              # 全局配置
│   ├── global-setup.ts  # 全局前置设置
│   └── global-teardown.ts # 全局清理
├── fixtures/            # 测试数据和夹具
│   └── test-data.ts     # 测试数据定义
├── pages/               # Page Object Model
│   ├── base.page.ts     # 基础页面类
│   └── *.page.ts        # 具体页面类
├── tests/               # 测试用例
│   ├── api/            # API 测试
│   └── e2e/            # 端到端测试
└── utils/              # 工具函数
    └── helpers.ts      # 通用助手函数
```

### 核心原则
- **分离关注点**: 页面对象、测试数据、测试逻辑分离
- **代码复用**: 基础类和工具函数最大化复用
- **清晰命名**: 文件和类名清晰表达其用途

## 🔧 配置最佳实践

### playwright.config.ts 关键配置
```typescript
export default defineConfig({
  // 测试目录
  testDir: './src/tests',
  
  // 性能优化
  fullyParallel: true,           // 并行执行
  workers: process.env.CI ? 1 : undefined, // CI 环境单线程
  
  // 稳定性配置
  retries: process.env.CI ? 2 : 0,  // CI 环境重试
  timeout: 90000,                   // 全局超时
  
  // 调试和报告
  use: {
    trace: 'on-first-retry',       // 失败时收集 trace
    screenshot: 'only-on-failure', // 失败时截图
    video: 'retain-on-failure',    // 失败时保留视频
    actionTimeout: 15000,          // 操作超时
    navigationTimeout: 60000,      // 导航超时
  },
  
  // 多报告格式
  reporter: [
    ['html'],
    ['json', { outputFile: 'test-results/results.json' }],
    ['junit', { outputFile: 'test-results/results.xml' }],
  ],
});
```

### 环境配置
```typescript
// 支持多环境
baseURL: process.env.BASE_URL || 'https://github.com',

// 浏览器选择策略
projects: [
  { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
  // 开发阶段只用 Chrome，稳定后再增加其他浏览器
],
```

## 📄 Page Object Model 最佳实践

### 基础页面类设计
```typescript
// src/pages/base.page.ts
export abstract class BasePage {
  protected page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  // 通用方法
  async goto(url?: string) { /* 导航逻辑 */ }
  async getTitle(): Promise<string> { /* 获取标题 */ }
  async waitForLoadState() { /* 等待加载 */ }
  async screenshot(name: string) { /* 截图 */ }
  
  // 受保护的通用方法
  protected getLocator(selector: string): Locator { /* 元素定位 */ }
  protected async clickElement(selector: string) { /* 点击 */ }
  protected async fillInput(selector: string, value: string) { /* 填充 */ }
}
```

### 具体页面类实现
```typescript
// src/pages/github.page.ts
export class GitHubPage extends BasePage {
  // 页面元素定位器
  private readonly logoSelector = '[aria-label="Homepage"]';
  private readonly searchSelector = '[data-testid="search-input"]';
  
  // 页面操作方法
  async gotoHomePage() {
    await this.goto('/');
  }
  
  async hasGitHubLogo(): Promise<boolean> {
    return await this.getLocator(this.logoSelector).isVisible();
  }
  
  async searchRepository(query: string) {
    await this.fillInput(this.searchSelector, query);
    await this.page.keyboard.press('Enter');
  }
}
```

### Page Object 设计原则
1. **封装页面细节**: 隐藏 DOM 结构，暴露业务操作
2. **单一职责**: 每个页面类负责一个页面或功能区域
3. **方法命名**: 使用业务语言，如 `searchRepository` 而非 `clickSearchButton`
4. **返回值设计**: 操作方法返回 void，查询方法返回具体类型

## 🧪 测试用例最佳实践

### 测试结构
```typescript
import { test, expect } from '@playwright/test';
import { GitHubPage } from '@/pages/github.page';
import { gitHubTestData } from '@/fixtures/test-data';

test.describe('GitHub 功能测试', () => {
  test('应该能够搜索仓库', async ({ page }) => {
    // Arrange: 准备
    const githubPage = new GitHubPage(page);
    
    // Act: 执行
    await githubPage.gotoHomePage();
    await githubPage.searchRepository(gitHubTestData.searchQueries.popular);
    
    // Assert: 验证
    await expect(page).toHaveURL(/search/);
    await expect(page.locator('[data-testid="results"]')).toBeVisible();
  });
});
```

### 测试命名规范
- **描述性命名**: `应该能够搜索仓库` 而非 `test search`
- **BDD 风格**: Given-When-Then 或 Arrange-Act-Assert
- **业务视角**: 从用户角度描述期望行为

### 断言最佳实践
```typescript
// ✅ 推荐：具体的断言
await expect(page.locator('[data-testid="username"]')).toHaveText('john');
await expect(page).toHaveURL(/dashboard/);

// ❌ 避免：过于宽泛的断言
await expect(page.locator('body')).toContainText('welcome');
```

## 📊 测试数据管理

### 数据结构设计
```typescript
// src/fixtures/test-data.ts
export const gitHubTestData = {
  searchQueries: {
    popular: 'playwright',
    language: 'typescript',
  },
  
  repositories: {
    playwright: {
      owner: 'microsoft',
      name: 'playwright',
      fullName: 'microsoft/playwright',
      expectedLanguages: ['TypeScript', 'JavaScript'],
    },
  },
  
  expectedResults: {
    minStars: 500,
    maxSearchResults: 10,
  },
};
```

### 数据管理原则
1. **分类组织**: 按功能模块组织测试数据
2. **环境隔离**: 开发、测试、生产环境数据分离
3. **敏感数据**: 使用环境变量管理敏感信息
4. **数据工厂**: 复杂对象使用工厂模式生成

## 🔍 选择器最佳实践

### 选择器优先级
1. **data-testid**: 专门为测试添加的属性（最推荐）
2. **role + name**: 语义化选择器
3. **text content**: 稳定的文本内容
4. **CSS 选择器**: 作为最后选择

```typescript
// ✅ 推荐
page.locator('[data-testid="submit-button"]')
page.getByRole('button', { name: '提交' })
page.getByText('登录')

// ❌ 避免
page.locator('#btn-123') // ID 可能变化
page.locator('.btn.btn-primary.mt-2') // 样式类可能变化
```

### 等待策略
```typescript
// ✅ 显式等待
await page.waitForLoadState('networkidle');
await page.locator('[data-testid="results"]').waitFor();

// ✅ 内置等待
await expect(page.locator('[data-testid="message"]')).toBeVisible();

// ❌ 避免硬等待
await page.waitForTimeout(5000);
```

## 🚀 性能优化

### 并行执行优化
```typescript
// playwright.config.ts
export default defineConfig({
  fullyParallel: true,
  workers: process.env.CI ? 1 : undefined, // 本地多线程，CI 单线程
  
  // 项目级并行
  projects: [
    { name: 'chromium', testDir: './src/tests/e2e' },
    { name: 'api-tests', testDir: './src/tests/api' },
  ],
});
```

### 测试隔离
```typescript
// 每个测试独立的 page 实例
test('测试 A', async ({ page }) => {
  // 使用独立的 page
});

test('测试 B', async ({ page }) => {
  // 使用另一个独立的 page
});
```

## 🔧 调试和故障排除

### 调试配置
```typescript
// playwright.config.ts
use: {
  // 失败时收集调试信息
  trace: 'on-first-retry',
  screenshot: 'only-on-failure',
  video: 'retain-on-failure',
  
  // 开发时配置
  headless: false, // 显示浏览器
  slowMo: 1000,   // 慢动作执行
},
```

### 调试技巧
```typescript
// 页面暂停，手动调试
await page.pause();

// 控制台输出
console.log('当前 URL:', page.url());
console.log('页面标题:', await page.title());

// 截图调试
await page.screenshot({ path: 'debug.png' });
```

## 📈 CI/CD 集成

### GitHub Actions 配置
```yaml
name: Playwright Tests
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: yarn install
      
      - name: Install Playwright
        run: yarn playwright install --with-deps
      
      - name: Run tests
        run: yarn test:e2e
        env:
          BASE_URL: ${{ secrets.BASE_URL }}
      
      - name: Upload test results
        uses: actions/upload-artifact@v3
        if: failure()
        with:
          name: test-results
          path: test-results/
```

### 环境配置
```bash
# .env.example
BASE_URL=https://staging.example.com
CI=true
HEADLESS=true
```

## 📋 代码质量

### TypeScript 配置
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "lib": ["ES2020"],
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    }
  }
}
```

### 代码风格
```typescript
// ✅ 推荐的代码风格
export class HomePage extends BasePage {
  private readonly searchInput = '[data-testid="search-input"]';
  
  async search(query: string): Promise<void> {
    await this.fillInput(this.searchInput, query);
    await this.page.keyboard.press('Enter');
  }
}

// 使用 async/await
// 明确的类型注解
// 清晰的方法命名
```

## 🎯 常见陷阱和解决方案

### 1. 元素选择器不稳定
**问题**: CSS 类名变化导致测试失败
**解决**: 使用 `data-testid` 或语义化选择器

### 2. 异步等待问题
**问题**: 页面加载未完成就执行操作
**解决**: 使用 Playwright 内置等待机制

### 3. 测试数据污染
**问题**: 测试之间相互影响
**解决**: 每个测试使用独立数据和清理逻辑

### 4. 网络依赖问题
**问题**: 外部 API 不稳定影响测试
**解决**: 使用 Mock 或测试环境

## 📚 学习资源

- [Playwright 官方文档](https://playwright.dev)
- [Best Practices Guide](https://playwright.dev/docs/best-practices)
- [Page Object Model](https://playwright.dev/docs/pom)
- [Testing Strategies](https://playwright.dev/docs/test-runners)

---

*此文档基于 playwright-demo 项目实际结构总结，持续更新中。*