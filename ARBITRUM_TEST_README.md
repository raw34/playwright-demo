# Arbitrum ETH Transfer E2E Tests

本项目实现了基于 Playwright 和 ethers.js 的 Arbitrum One 网络 ETH 转账端到端测试。

## 功能特性

- ✅ 支持多环境配置（测试网/主网）
- ✅ 完整的 ETH 转账流程测试
- ✅ 自动化 gas 估算和价格获取
- ✅ 交易状态验证和余额检查
- ✅ 错误处理和边界情况测试
- ✅ 详细的测试日志输出

## 环境配置

### 1. 安装依赖

```bash
yarn install
```

### 2. 配置环境变量

项目支持多环境配置，你可以选择以下任一种方式：

#### 方式一：使用预设的环境文件（推荐）

```bash
# 使用测试环境（Sepolia）
cp .env.test .env

# 或使用生产环境（Arbitrum One）
cp .env.production .env
```

#### 方式二：创建自定义配置

创建 `.env` 文件，根据你的环境需求配置：

**测试环境（Sepolia）示例：**
```env
ENVIRONMENT=test
RPC_URL=https://ethereum-sepolia-rpc.publicnode.com
CHAIN_ID=11155111
PRIVATE_KEY=你的测试钱包私钥
RECIPIENT_ADDRESS=接收地址
```

**生产环境（Arbitrum One）示例：**
```env
ENVIRONMENT=production
RPC_URL=https://arb1.arbitrum.io/rpc
CHAIN_ID=42161
PRIVATE_KEY=你的生产钱包私钥
RECIPIENT_ADDRESS=接收地址
```

#### 方式三：使用环境特定文件

```bash
# 开发时可以同时维护多个环境文件
.env.test        # 测试环境配置
.env.production  # 生产环境配置
.env            # 当前激活的配置

# 切换环境时只需复制对应文件
cp .env.test .env      # 切换到测试环境
cp .env.production .env # 切换到生产环境
```

### 3. RPC 节点选择

你可以使用以下免费的 RPC 提供商：

- **Infura**: https://infura.io/
- **Alchemy**: https://alchemy.com/
- **QuickNode**: https://www.quicknode.com/
- **公共 RPC**: 
  - Sepolia: `https://ethereum-sepolia-rpc.publicnode.com`
  - Arbitrum: `https://arb1.arbitrum.io/rpc`

## 运行测试

### 运行所有区块链测试

```bash
yarn playwright test --project=blockchain
```

### 运行特定测试

```bash
# 仅运行转账测试
yarn playwright test arbitrum-transfer --project=blockchain

# 带调试模式
yarn playwright test arbitrum-transfer --project=blockchain --debug

# 带 UI 模式
yarn playwright test arbitrum-transfer --project=blockchain --ui
```

### 切换环境

有多种方式切换环境：

1. **替换整个 .env 文件（推荐）**
```bash
cp .env.test .env        # 切换到测试环境
cp .env.production .env  # 切换到生产环境
```

2. **修改 .env 中的配置**
   - 修改 `ENVIRONMENT` 变量
   - 确保 `CHAIN_ID` 和其他配置与环境匹配
   - Sepolia 使用 `CHAIN_ID=11155111`
   - Arbitrum One 使用 `CHAIN_ID=42161`

3. **使用环境变量覆盖**
```bash
ENVIRONMENT=production yarn test:blockchain
```

## 测试用例说明

### 1. 链连接验证
- 验证 Chain ID 是否匹配
- 检查 RPC 连接状态

### 2. 余额检查
- 检查发送方钱包余额
- 确保余额足够支付转账和 gas

### 3. Gas 估算
- 自动估算交易所需 gas
- 获取当前网络 gas 价格

### 4. ETH 转账
- 执行 ETH 转账交易
- 等待交易确认
- 验证交易状态

### 5. 批量转账
- 连续执行多笔转账
- 验证每笔交易状态

### 6. 交易收据验证
- 获取并验证交易收据
- 检查区块确认数

### 7. 错误处理
- 余额不足错误处理
- 网络错误重试机制

## 项目结构

```
src/
├── config/
│   └── blockchain.config.ts    # 区块链配置管理
├── utils/
│   └── blockchain.ts           # 区块链交互工具类
└── tests/
    └── e2e/
        └── arbitrum-transfer.test.ts  # Arbitrum 转账测试
```

## 环境变量说明

### 必需变量
- `ENVIRONMENT`: 环境标识（test 或 production）
- `RPC_URL`: 区块链 RPC 节点地址
- `CHAIN_ID`: 链 ID（Sepolia: 11155111, Arbitrum: 42161）
- `PRIVATE_KEY`: 钱包私钥
- `RECIPIENT_ADDRESS`: 转账接收地址

### 可选变量
- `TRANSFER_AMOUNT_ETH`: 转账金额（默认: 0.001 ETH）
- `GAS_LIMIT`: Gas 限制（默认: 21000）
- `MAX_FEE_PER_GAS_GWEI`: 最大 Gas 费用（Gwei）
- `MAX_PRIORITY_FEE_PER_GAS_GWEI`: 优先费（Gwei）
- `TEST_TIMEOUT_MS`: 测试超时时间（默认: 120000ms）
- `WAIT_FOR_CONFIRMATIONS`: 等待确认数（默认: 1）

## 注意事项

### 安全提醒

1. **私钥安全**：
   - 永远不要将真实的私钥提交到代码仓库
   - 使用专门的测试钱包进行测试
   - 生产环境使用环境变量或密钥管理服务

2. **测试网代币**：
   - Sepolia 测试网 ETH 可从水龙头免费获取
   - 水龙头地址：https://sepoliafaucet.com/

3. **Gas 费用**：
   - 测试前确保钱包有足够的 ETH 支付 gas
   - 可在 `.env` 中调整 gas 限制和价格

### 常见问题

1. **交易超时**
   - 增加 `TEST_TIMEOUT_MS` 的值
   - 检查网络连接和 RPC 节点状态

2. **余额不足**
   - 确保钱包有足够的 ETH
   - 减小 `TRANSFER_AMOUNT_ETH` 的值

3. **Chain ID 不匹配**
   - 检查 `.env` 中的 Chain ID 配置
   - 确保 RPC URL 对应正确的网络

## 测试报告

测试完成后，可以查看测试报告：

```bash
yarn playwright show-report
```

测试结果也会保存在以下位置：
- HTML 报告：`playwright-report/`
- JSON 结果：`test-results/results.json`
- XML 结果：`test-results/results.xml`

## 扩展功能

如需添加更多功能，可以考虑：

1. **ERC20 代币转账测试**
2. **智能合约交互测试**
3. **多签钱包测试**
4. **跨链桥接测试**
5. **DeFi 协议集成测试**

## 相关资源

- [Playwright 文档](https://playwright.dev/)
- [Ethers.js 文档](https://docs.ethers.org/)
- [Arbitrum 文档](https://docs.arbitrum.io/)
- [Sepolia 测试网](https://sepolia.dev/)

## License

MIT