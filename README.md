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
- 🦊 **MetaMask 签名** - 自动化钱包签名测试（无需人工介入）
- ⛓️ **区块链集成** - 支持 Arbitrum One 和 Sepolia 测试网
- 🔐 **消息签名验证** - EIP-191 和 EIP-712 签名支持

## 项目结构

```
playwright-demo/
├── src/
│   ├── pages/              # 页面对象模式类
│   │   ├── base.page.ts    # 包含通用方法的基础页面
│   │   ├── github.page.ts  # GitHub 页面操作
│   │   ├── demo-sites.page.ts # 演示网站页面操作
│   │   ├── bilibili.page.ts # Bilibili 页面操作
│   │   └── metamask-mock.page.ts # MetaMask 模拟交互
│   ├── tests/              # 测试文件
│   │   ├── e2e/           # 端到端测试
│   │   │   ├── github.test.ts
│   │   │   ├── demo-sites.test.ts
│   │   │   ├── bilibili.test.ts
│   │   │   ├── arbitrum-transfer.test.ts # Arbitrum ETH 转账测试
│   │   │   └── metamask-auto-signing.test.ts # MetaMask 自动签名测试
│   │   └── api/           # API 测试
│   │       ├── github-api.test.ts
│   │       └── bilibili-api.test.ts
│   ├── fixtures/          # 测试数据和夹具
│   │   ├── github.data.ts
│   │   ├── demo.data.ts
│   │   └── bilibili.data.ts
│   ├── utils/             # 工具函数
│   │   ├── helpers.ts
│   │   ├── blockchain.ts  # 区块链交互工具
│   │   ├── message-signing.ts # 消息签名工具
│   │   └── backend-mock.ts # 后端验证模拟
│   └── config/            # 设置和清理配置
│       ├── global-setup.ts
│       ├── global-teardown.ts
│       └── blockchain.config.ts # 区块链配置
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

创建 `.env` 文件并配置以下变量：

```bash
# 基础配置
BASE_URL=http://localhost:3000
API_BASE_URL=https://api.example.com

# 区块链配置
RPC_URL=https://sepolia.infura.io/v3/YOUR_KEY  # 或 Arbitrum RPC
CHAIN_ID=11155111  # Sepolia: 11155111, Arbitrum One: 42161
PRIVATE_KEY=0x...  # 测试钱包私钥
RECIPIENT_ADDRESS=0x...  # 接收地址
```

### 测试数据

测试数据在 `src/fixtures/test-data.ts` 中管理，包含：
- GitHub API 测试数据（仓库信息、搜索查询等）
- 基础演示测试数据（登录凭据、测试 URL 等）

## 测试用例说明

### 区块链测试

#### MetaMask 自动签名测试 (`metamask-auto-signing.test.ts`)
- ✅ **完整签名流程验证** - 无需人工介入的自动化签名
- 🔒 **数据篡改检测** - 验证签名数据的完整性
- ⏰ **过期签名拒绝** - 防重放攻击机制
- 👤 **签名者权限验证** - 权限控制验证
- 🌐 **API 端点集成** - 后端验证集成

#### Arbitrum 转账测试 (`arbitrum-transfer.test.ts`)
- **ETH 转账功能** - 在 Arbitrum One 或 Sepolia 上执行转账
- **交易确认验证** - 验证交易成功和余额变化
- **环境配置切换** - 支持测试网和主网切换

### 常规 E2E 测试

#### GitHub E2E 测试 (`github.test.ts`)
- **GitHub 首页访问验证** - 测试 GitHub 主页加载和标题验证
- **GitHub Logo 验证** - 验证 GitHub Logo 显示
- **页面基本结构验证** - 验证页面响应和基本内容

#### 演示网站 E2E 测试 (`demo-sites.test.ts`)
- **Example.com 内容验证** - 验证示例网站的基本功能
- **HTTP API 响应测试** - 测试 API 的 JSON 响应
- **表单交互测试** - 测试登录表单的填写和提交
- **无效登录凭据测试** - 测试错误登录处理
- **页面截图功能** - 演示页面截图功能
- **响应时间测试** - 测试网站加载性能

#### Bilibili E2E 测试 (`bilibili.test.ts`)
- **Bilibili 首页访问** - 测试 Bilibili 网站访问
- **搜索功能测试** - 验证搜索功能
- **视频播放测试** - 测试视频页面加载

### API 测试 (`github-api.test.ts`)
- **GitHub 仓库信息获取** - 通过 API 获取仓库基本信息
- **仓库搜索功能** - 测试 GitHub 搜索 API
- **编程语言分布查询** - 获取仓库的编程语言统计
- **README 文件获取** - 获取仓库的 README 内容
- **提交历史获取** - 获取仓库的提交记录
- **发布版本信息** - 获取仓库的 Release 信息
- **错误处理验证** - 测试 API 错误响应处理

### 页面对象模式
- **BasePage** - 提供通用的页面操作方法
- **GitHubPage** - 封装 GitHub 网站的操作
- **DemoSitesPage** - 封装演示网站的操作

## 最佳实践

- 使用页面对象模式编写可维护的测试
- 利用 TypeScript 实现类型安全
- 选择稳定可靠的测试目标网站
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