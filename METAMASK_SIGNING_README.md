# MetaMask Message Signing with Playwright + Ethers.js

本项目实现了使用 Playwright 和 ethers.js 模拟 MetaMask 签名流程的完整解决方案，用于端到端测试需要钱包签名验证的系统功能。

## 🎯 使用场景

适用于以下场景的自动化测试：
- 关键信息创建/修改时需要钱包签名
- 表单提交需要签名验证
- 后端需要验证签名真实性
- 防篡改数据提交
- 身份认证和授权

## 🏗️ 架构设计

```
┌─────────────┐     ┌──────────────┐     ┌─────────────┐
│   前端表单   │ --> │ MetaMask签名  │ --> │  后端验证   │
└─────────────┘     └──────────────┘     └─────────────┘
       ↓                    ↓                     ↓
   填写数据             生成签名              验证签名
       ↓                    ↓                     ↓
   构造消息          Ethers.js签名         恢复地址验证
```

## 📁 项目结构

```
src/
├── utils/
│   ├── message-signing.ts     # 消息签名核心功能
│   └── backend-mock.ts        # 模拟后端验证逻辑
├── pages/
│   └── metamask-mock.page.ts  # MetaMask 交互页面对象
└── tests/e2e/
    └── metamask-signing.test.ts # 签名验证测试用例
```

## 🚀 快速开始

### 1. 运行签名测试

```bash
# 运行所有签名相关测试
yarn playwright test metamask-signing

# 调试模式
yarn playwright test metamask-signing --debug

# UI 模式
yarn playwright test metamask-signing --ui
```

### 2. 基本使用示例

```typescript
import { MessageSigningService } from './utils/message-signing';

// 创建签名服务
const signingService = new MessageSigningService();

// 签名简单消息
const message = 'Hello, Blockchain!';
const signed = await signingService.signMessage(message);

// 验证签名
const isValid = MessageSigningService.verifySignature(
  message,
  signed.signature,
  signed.address
);
```

## 💡 核心功能

### 1. 消息签名服务 (MessageSigningService)

#### 签名简单消息
```typescript
const signingService = new MessageSigningService();
const signed = await signingService.signMessage('Hello');
// 返回: { message, signature, address, timestamp }
```

#### 签名结构化数据
```typescript
const content = {
  action: 'create_order',
  data: {
    orderId: 'ORD-123',
    amount: '100.00',
    currency: 'USD'
  }
};

const signed = await signingService.signContent(content);
```

#### 验证签名
```typescript
const isValid = MessageSigningService.verifySignature(
  message,
  signature,
  expectedAddress
);
```

#### EIP-712 类型化数据签名
```typescript
const domain = {
  name: 'MyApp',
  version: '1',
  chainId: 1,
  verifyingContract: '0x...'
};

const types = {
  Order: [
    { name: 'orderId', type: 'string' },
    { name: 'amount', type: 'uint256' }
  ]
};

const value = {
  orderId: 'ORD-123',
  amount: 100
};

const signature = await signingService.signTypedData(domain, types, value);
```

### 2. MetaMask 模拟页面 (MetaMaskMockPage)

#### 注入 Web3 Provider
```typescript
const metamaskPage = new MetaMaskMockPage(page);
await metamaskPage.injectWeb3Provider();
```

#### 完整签名流程
```typescript
const result = await metamaskPage.completeSigningFlow(
  formData,
  formSelectors,
  submitButtonSelector
);
// 返回: { signature, message, address }
```

#### 处理签名请求
```typescript
// 模拟用户在 MetaMask 中批准签名
const signature = await metamaskPage.approvePendingSignRequest();
```

### 3. 后端验证服务 (BackendMockService)

#### 初始化服务
```typescript
// 设置可信地址列表
const trustedAddresses = ['0x...'];
const backend = new BackendMockService(trustedAddresses);
```

#### 验证提交
```typescript
const submission = {
  data: formData,
  signature: signature,
  signerAddress: address,
  signedMessage: message
};

const result = await backend.verifySubmission(submission);
// 返回: { isValid, signerAddress, data, error? }
```

#### 模拟 API 端点
```typescript
const response = await backend.handleApiSubmission(requestBody);
// 返回: { success, message, data? }
```

## 🔧 实际应用示例

### 示例 1：表单提交签名验证

```typescript
test('用户提交重要表单需要签名', async ({ page }) => {
  const metamask = new MetaMaskMockPage(page);
  const backend = new BackendMockService();
  
  // 1. 填写表单
  await metamask.fillForm({
    title: '重要文档',
    amount: '1000'
  }, {
    title: '#title-input',
    amount: '#amount-input'
  });
  
  // 2. 签名并提交
  const signed = await metamask.completeSigningFlow(
    formData,
    selectors
  );
  
  // 3. 后端验证
  const result = await backend.verifySubmission({
    data: formData,
    signature: signed.signature,
    signerAddress: signed.address,
    signedMessage: signed.message
  });
  
  expect(result.isValid).toBe(true);
});
```

### 示例 2：防止数据篡改

```typescript
test('检测并拒绝篡改的数据', async () => {
  const signing = new MessageSigningService();
  const backend = new BackendMockService();
  
  // 原始数据
  const originalData = { amount: '100' };
  const signed = await signing.signContent({
    action: 'transfer',
    data: originalData
  });
  
  // 尝试提交篡改的数据
  const tamperedData = { amount: '1000' };
  const submission = {
    data: tamperedData,  // 篡改的数据
    signature: signed.signature,  // 原始签名
    signerAddress: signed.address,
    signedMessage: signed.message
  };
  
  // 验证会通过（签名有效），但数据不匹配
  const result = await backend.verifySubmission(submission);
  const parsedMessage = JSON.parse(signed.message);
  
  expect(parsedMessage.data).not.toEqual(tamperedData);
  expect(parsedMessage.data).toEqual(originalData);
});
```

### 示例 3：批量签名

```typescript
test('批量文档签名', async () => {
  const signing = new MessageSigningService();
  const documents = [
    { id: 1, title: 'Doc 1' },
    { id: 2, title: 'Doc 2' },
    { id: 3, title: 'Doc 3' }
  ];
  
  const signatures = [];
  for (const doc of documents) {
    const signed = await signing.signContent({
      action: 'approve',
      data: doc
    });
    signatures.push(signed);
  }
  
  expect(signatures).toHaveLength(3);
});
```

## ⚙️ 配置说明

### 环境变量
确保 `.env` 文件包含必要的配置：

```env
# 钱包配置
PRIVATE_KEY=你的测试私钥
RPC_URL=https://ethereum-sepolia-rpc.publicnode.com
CHAIN_ID=11155111
```

### Playwright 配置
在 `playwright.config.ts` 中添加：

```typescript
projects: [
  {
    name: 'metamask-signing',
    testMatch: /.*metamask-signing.*\.test\.ts$/,
    use: {
      // 签名测试不需要真实浏览器
      headless: true,
    },
  },
]
```

## 🔒 安全注意事项

1. **私钥安全**
   - 仅使用测试钱包私钥
   - 不要提交真实私钥到代码库
   - 使用环境变量管理敏感信息

2. **签名验证**
   - 始终在后端验证签名
   - 检查签名者地址是否可信
   - 验证消息内容完整性

3. **防重放攻击**
   - 使用时间戳限制消息有效期
   - 添加 nonce 防止重复提交
   - 记录已处理的签名

4. **数据完整性**
   - 对消息内容进行规范化
   - 使用确定性的 JSON 序列化
   - 验证所有关键字段

## 📊 测试覆盖

测试用例包括：
- ✅ 简单消息签名和验证
- ✅ 表单数据签名提交
- ✅ 篡改数据检测
- ✅ 过期消息处理
- ✅ EIP-712 类型化数据签名
- ✅ 不可信签名者拒绝
- ✅ 批量签名处理
- ✅ API 端点模拟
- ✅ 完整 MetaMask 流程模拟

## 🛠️ 故障排除

### 常见问题

1. **签名验证失败**
   - 检查消息格式是否一致
   - 确认使用相同的签名方法
   - 验证地址大小写

2. **时间戳过期**
   - 调整 `TEST_TIMEOUT_MS` 配置
   - 同步系统时间
   - 增加有效期窗口

3. **地址不匹配**
   - 使用 `toLowerCase()` 比较地址
   - 检查 checksum 地址格式
   - 确认环境配置正确

## 🔗 相关资源

- [Ethers.js 文档](https://docs.ethers.org/)
- [EIP-191: Signed Data Standard](https://eips.ethereum.org/EIPS/eip-191)
- [EIP-712: Typed Data Signing](https://eips.ethereum.org/EIPS/eip-712)
- [MetaMask 签名文档](https://docs.metamask.io/guide/signing-data.html)
- [Playwright 文档](https://playwright.dev/)

## 📝 总结

这个解决方案提供了：
1. **完整的签名流程模拟** - 从用户操作到后端验证
2. **灵活的测试框架** - 支持多种签名场景
3. **安全的验证机制** - 防篡改、防重放
4. **易于集成** - 可快速应用到实际项目

通过 Playwright + ethers.js 的组合，可以完美模拟 MetaMask 签名流程，实现自动化的端到端测试，确保签名验证功能的可靠性和安全性。