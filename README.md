# Playwright 演示项目

基于 TypeScript 构建的全面 Playwright E2E 测试框架，采用测试自动化最佳实践。

## 功能特性

- 🎭 **Playwright** - 现代浏览器自动化工具
- 🔷 **TypeScript** - 类型安全的测试开发  
- 📁 **页面对象模式** - 可维护的测试架构
- 🧪 **多种测试类型** - E2E、API 和组件测试
- 🔧 **代码质量** - ESLint + Prettier 配置
- 🚀 **CI/CD 就绪** - GitHub Actions 工作流
- 📊 **丰富报告** - 包含截图和视频的 HTML 报告

## 项目结构

```
playwright-demo/
├── src/
│   ├── pages/              # 页面对象模式类
│   │   ├── base.page.ts    # 包含通用方法的基础页面
│   │   ├── login.page.ts   # 登录页面对象
│   │   └── home.page.ts    # 首页页面对象
│   ├── tests/              # 测试文件
│   │   ├── e2e/           # 端到端测试
│   │   └── api/           # API 测试
│   ├── fixtures/          # 测试数据和夹具
│   ├── utils/             # 工具函数
│   └── config/            # 设置和清理配置
├── .github/workflows/     # CI/CD 配置
├── playwright.config.ts   # Playwright 配置文件
├── tsconfig.json         # TypeScript 配置
└── package.json          # 依赖和脚本
```

## 快速开始

1. **安装依赖**:
   ```bash
   yarn install
   ```

2. **安装浏览器**:
   ```bash
   yarn install:browsers
   ```

3. **运行测试**:
   ```bash
   yarn test
   ```

## 可用脚本

- `yarn test` - 运行所有测试
- `yarn test:headed` - 以有头模式运行测试
- `yarn test:debug` - 以调试模式运行测试
- `yarn test:ui` - 使用 Playwright UI 运行测试
- `yarn test:report` - 显示测试报告
- `yarn test:codegen` - 使用代码生成器生成测试
- `yarn lint` - 检查代码质量
- `yarn lint:fix` - 修复代码规范问题
- `yarn format` - 使用 Prettier 格式化代码
- `yarn typecheck` - 检查 TypeScript 类型

## 配置

### 环境变量

- `BASE_URL` - 测试基础 URL（默认：http://localhost:3000）
- `API_BASE_URL` - API 测试基础 URL

### 测试数据

测试数据在 `src/fixtures/test-data.ts` 中管理，包含预定义的用户和 URL。

## 最佳实践

- 使用页面对象模式编写可维护的测试
- 利用 TypeScript 实现类型安全
- 包含正面和负面测试用例
- 使用有意义的测试描述
- 添加适当的错误处理和断言
- 遵循既定的代码风格指南

## 贡献指南

1. 遵循现有的代码风格
2. 为新功能添加测试
3. 提交前运行代码检查和类型检查
4. 使用约定式提交消息

## 许可证

MIT