# 区块链测试完整指南 - Playwright + Ethers.js

本项目提供了完整的区块链相关自动化测试解决方案，包括 MetaMask 签名验证和 Arbitrum ETH 转账功能。

## 🎯 核心功能

### 1. MetaMask 签名自动化
- ✅ **全自动化** - 无需人工介入，完全自动化执行
- 🔄 **前端零修改** - 不需要修改生产代码
- 🚀 **CI/CD 兼容** - 可在任何 CI/CD 环境运行
- 🔐 **真实签名** - 使用 ethers.js 生成真实有效的签名
- 🧪 **双层测试** - 核心逻辑测试 + 完整前端集成测试

### 2. Arbitrum ETH 转账测试
- ✅ 支持多环境配置（Sepolia测试网/Arbitrum主网）
- ✅ 完整的 ETH 转账流程测试
- ✅ 自动化 gas 估算和价格获取
- ✅ 交易状态验证和余额检查

## 🏗️ 项目架构

```
┌─────────────┐     ┌──────────────┐     ┌─────────────┐
│   前端表单   │ --> │ MetaMask签名  │ --> │  后端验证   │
└─────────────┘     └──────────────┘     └─────────────┘
       ↓                    ↓                     ↓
   填写数据             生成签名              验证签名
       ↓                    ↓                     ↓
   构造消息          Ethers.js签名         恢复地址验证
```

## 📁 文件结构

```
src/
├── config/
│   └── blockchain.config.ts   # 区块链配置管理
├── utils/
│   ├── blockchain.ts          # 区块链交互工具
│   ├── message-signing.ts     # 消息签名核心功能
│   └── backend-mock.ts        # 模拟后端验证逻辑
├── pages/
│   └── metamask-mock.page.ts  # MetaMask 交互页面对象
└── tests/e2e/
    ├── metamask-auto-signing.test.ts          # 签名核心逻辑测试
    ├── metamask-frontend-integration.test.ts  # 前端集成测试
    └── arbitrum-transfer.test.ts              # Arbitrum 转账测试
```

## 🚀 快速开始

### 1. 安装依赖

```bash
yarn install
```

### 2. 配置环境变量

创建 `.env` 文件并配置以下变量：

```env
# 基础配置
ENVIRONMENT=test  # 或 production

# 区块链配置
RPC_URL=https://sepolia.infura.io/v3/YOUR_KEY  # 或 Arbitrum RPC
CHAIN_ID=11155111  # Sepolia: 11155111, Arbitrum One: 42161
PRIVATE_KEY=0x...  # 测试钱包私钥
RECIPIENT_ADDRESS=0x...  # 接收地址（用于转账测试）
```

### 3. RPC 节点选择

推荐的免费 RPC 提供商：
- **Infura**: https://infura.io/
- **Alchemy**: https://alchemy.com/
- **公共 RPC**: 
  - Sepolia: `https://ethereum-sepolia-rpc.publicnode.com`
  - Arbitrum: `https://arb1.arbitrum.io/rpc`

## 📝 测试用例说明

### MetaMask 签名测试

#### 1. 核心逻辑测试
```bash
# 运行签名核心逻辑测试
yarn playwright test metamask-auto-signing

# 测试内容：
# ✅ 完整签名流程验证 - 无需人工介入
# 🔒 数据篡改检测 - 安全性验证
# ⏰ 过期签名拒绝 - 防重放攻击
# 👤 签名者权限验证 - 权限控制
# 🌐 API 端点集成 - 后端验证
```

#### 2. 前端集成测试
```bash
# 运行前端集成测试
yarn playwright test metamask-frontend-integration

# 测试内容：
# 🌐 完整前端流程 - 真实 HTML 页面测试
# 🔄 前端代码零修改 - 生产代码不需调整
# 🤖 MetaMask Mock 注入 - 自动化签名实现
# ✅ 端到端验证 - 表单填写→签名→验证
```

### Arbitrum 转账测试

```bash
# 运行转账测试
yarn playwright test arbitrum-transfer

# 测试内容：
# - ETH 转账功能验证
# - 交易确认和状态检查
# - 余额变化验证
# - Gas 费用计算
```

## 💡 使用示例

### 前端集成示例

```javascript
// 生产环境前端代码（无需修改）
const signature = await window.ethereum.request({
  method: 'personal_sign',
  params: [hexMessage, account]
});

// 测试环境：Playwright 注入 mock
const metamaskPage = new MetaMaskMockPage(page);
await metamaskPage.injectWeb3Provider(chainId);
await metamaskPage.approvePendingSignRequest();
// 前端代码依然调用相同的 API，但会自动签名
```

### 消息签名

```typescript
import { MessageSigningService } from './utils/message-signing';

// 创建签名服务
const signingService = new MessageSigningService();

// 签名结构化数据
const content = {
  action: 'UPDATE_TRANSFER_RULE',
  data: {
    ruleName: '每日限额',
    dailyLimit: 100,
    whitelist: ['0x...']
  }
};

const signed = await signingService.signContent(content);
console.log('签名:', signed.signature);
console.log('签名者:', signed.address);
```

### ETH 转账

```typescript
import { TransferService } from './utils/blockchain';

// 创建转账服务
const transferService = new TransferService();

// 执行转账
const tx = await transferService.transferETH({
  to: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb7',
  amount: '0.001' // ETH
});

// 等待确认
const receipt = await tx.wait();
console.log('交易哈希:', receipt.transactionHash);
```

## 🔒 安全注意事项

1. **私钥管理**
   - 永远不要将私钥提交到代码仓库
   - 使用环境变量管理敏感信息
   - 在 CI/CD 中使用加密的密钥存储

2. **网络选择**
   - 开发和测试使用测试网（Sepolia）
   - 生产环境谨慎使用主网
   - 确保 Chain ID 配置正确

3. **签名验证**
   - 始终在后端验证签名有效性
   - 检查签名者权限
   - 实现防重放攻击机制（时间戳、nonce）

## 🎭 实现原理

### 前端代码零修改的秘密

```javascript
// 📌 关键点：前端代码完全一样
await window.ethereum.request({
  method: 'personal_sign',
  params: [hexMessage, account]
});

// 🎯 区别在于 window.ethereum 的来源：
// 生产环境：真实的 MetaMask 扩展
// 测试环境：Playwright 注入的 mock 对象
```

### 测试分层架构

1. **核心逻辑层** (`metamask-auto-signing.test.ts`)
   - 快速单元测试
   - 验证签名、加密、验证逻辑
   - 不涉及 UI，运行速度快

2. **前端集成层** (`metamask-frontend-integration.test.ts`)
   - 完整 E2E 测试
   - 真实 HTML/JS 页面
   - 验证用户完整流程

## 🧪 在 CI/CD 中运行

### GitHub Actions 示例

```yaml
name: E2E Tests
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: yarn install
      - run: npx playwright install
      
      - name: Run blockchain tests
        env:
          RPC_URL: ${{ secrets.RPC_URL }}
          CHAIN_ID: ${{ secrets.CHAIN_ID }}
          PRIVATE_KEY: ${{ secrets.TEST_PRIVATE_KEY }}
          RECIPIENT_ADDRESS: ${{ secrets.TEST_RECIPIENT }}
        run: |
          yarn playwright test metamask-auto-signing
          yarn playwright test arbitrum-transfer
```

## 📊 测试报告

```bash
# 生成 HTML 报告
yarn playwright test --reporter=html

# 查看报告
yarn playwright show-report
```

## 🤝 贡献指南

1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

## 📄 License

MIT

---

*使用 Playwright + Ethers.js 构建的企业级区块链测试解决方案*