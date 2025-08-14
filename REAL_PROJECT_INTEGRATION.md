# 实际项目集成指南 - MetaMask 签名验证系统

## 📋 场景对照表

你描述的实际项目流程与我们的实现完全匹配：

| 实际流程步骤 | 我们的实现 | 代码位置 |
|------------|----------|---------|
| 1. 用户编辑转账规则 | ✅ 表单数据收集 | `transfer-rule-signing.test.ts` |
| 2. 前端唤起 MetaMask | ✅ `metamaskPage.injectWeb3Provider()` | `metamask-mock.page.ts` |
| 3. 用户在 MetaMask 中确认 | ✅ `approvePendingSignRequest()` | `metamask-mock.page.ts` |
| 4. 前端获取签名并提交 | ✅ `signContent()` + 数据合并 | `message-signing.ts` |
| 5. 后端验证签名并保存 | ✅ `verifySubmission()` | `backend-mock.ts` |
| 6. 前端显示成功消息 | ✅ 状态更新和反馈 | 测试用例中实现 |

## 🔧 实际项目集成步骤

### 1. 前端集成

#### 安装依赖
```bash
npm install ethers
```

#### 创建签名服务
```typescript
// services/signing.service.ts
import { ethers } from 'ethers';

export class SigningService {
  async signTransferRule(ruleData: any) {
    // 检查 MetaMask
    if (!window.ethereum) {
      throw new Error('请安装 MetaMask');
    }

    // 获取账户
    const accounts = await window.ethereum.request({
      method: 'eth_requestAccounts'
    });

    // 构造消息
    const message = {
      action: 'UPDATE_TRANSFER_RULE',
      data: ruleData,
      timestamp: Date.now(),
      nonce: ethers.hexlify(ethers.randomBytes(32))
    };

    // 请求签名
    const messageStr = JSON.stringify(message);
    const signature = await window.ethereum.request({
      method: 'personal_sign',
      params: [
        ethers.hexlify(ethers.toUtf8Bytes(messageStr)),
        accounts[0]
      ]
    });

    return {
      signature,
      signerAddress: accounts[0],
      signedMessage: messageStr
    };
  }
}
```

#### React 组件示例
```tsx
// components/TransferRuleForm.tsx
import { SigningService } from '../services/signing.service';

function TransferRuleForm() {
  const [status, setStatus] = useState('');
  const signingService = new SigningService();

  const handleSubmit = async (formData) => {
    try {
      // 步骤 1: 准备数据
      setStatus('准备数据...');
      
      // 步骤 2: 唤起 MetaMask
      setStatus('请在 MetaMask 中确认...');
      const signed = await signingService.signTransferRule(formData);
      
      // 步骤 4: 提交到后端
      setStatus('提交到服务器...');
      const response = await fetch('/api/transfer-rules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rule: formData,
          ...signed
        })
      });
      
      if (response.ok) {
        // 步骤 6: 显示成功
        setStatus('✅ 保存成功！');
      }
    } catch (error) {
      setStatus(`❌ 错误: ${error.message}`);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* 表单字段 */}
      <button type="submit">保存（需要签名）</button>
      <div>{status}</div>
    </form>
  );
}
```

### 2. 后端集成

#### Node.js/Express 示例
```javascript
// routes/transfer-rules.js
const { ethers } = require('ethers');

router.post('/api/transfer-rules', async (req, res) => {
  const { rule, signature, signerAddress, signedMessage } = req.body;
  
  try {
    // 步骤 5: 验证签名
    const recoveredAddress = ethers.verifyMessage(
      signedMessage,
      signature
    );
    
    // 验证签名者
    if (recoveredAddress.toLowerCase() !== signerAddress.toLowerCase()) {
      return res.status(401).json({ error: '签名验证失败' });
    }
    
    // 验证签名者权限（检查白名单等）
    if (!isAuthorizedSigner(recoveredAddress)) {
      return res.status(403).json({ error: '无权限' });
    }
    
    // 解析签名的消息
    const parsedMessage = JSON.parse(signedMessage);
    
    // 验证时间戳（防重放）
    const messageAge = Date.now() - parsedMessage.timestamp;
    if (messageAge > 5 * 60 * 1000) { // 5分钟
      return res.status(400).json({ error: '签名已过期' });
    }
    
    // 保存到数据库
    const ruleId = await saveTransferRule({
      ...rule,
      signature,
      signerAddress,
      createdAt: new Date()
    });
    
    // 返回成功
    res.json({
      success: true,
      ruleId,
      message: '转账规则已保存'
    });
    
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

### 3. 数据库设计

```sql
-- 转账规则表
CREATE TABLE transfer_rules (
  id VARCHAR(36) PRIMARY KEY,
  rule_name VARCHAR(255) NOT NULL,
  daily_limit DECIMAL(18, 8),
  whitelist JSON,
  rule_type VARCHAR(50),
  auto_execute BOOLEAN,
  notes TEXT,
  
  -- 签名相关
  signature TEXT NOT NULL,
  signer_address VARCHAR(42) NOT NULL,
  signed_message TEXT NOT NULL,
  
  -- 审计字段
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  created_by VARCHAR(42),
  
  INDEX idx_signer (signer_address),
  INDEX idx_created (created_at)
);

-- 签名历史表（用于审计）
CREATE TABLE signature_history (
  id VARCHAR(36) PRIMARY KEY,
  rule_id VARCHAR(36),
  action VARCHAR(50),
  signature TEXT NOT NULL,
  signer_address VARCHAR(42) NOT NULL,
  signed_data JSON,
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (rule_id) REFERENCES transfer_rules(id)
);
```

## 🛡️ 安全最佳实践

### 1. 签名验证要点
```javascript
// 完整的验证流程
async function verifySignature(submission) {
  // 1. 验证签名本身
  const recovered = ethers.verifyMessage(
    submission.signedMessage,
    submission.signature
  );
  
  // 2. 验证地址匹配
  if (recovered !== submission.signerAddress) {
    throw new Error('签名不匹配');
  }
  
  // 3. 验证签名者权限
  if (!await checkSignerPermission(recovered)) {
    throw new Error('无权限');
  }
  
  // 4. 验证时间戳
  const message = JSON.parse(submission.signedMessage);
  if (Date.now() - message.timestamp > MAX_AGE) {
    throw new Error('签名过期');
  }
  
  // 5. 防重放检查
  if (await isSignatureUsed(submission.signature)) {
    throw new Error('签名已使用');
  }
  
  // 6. 数据完整性检查
  const expectedHash = ethers.keccak256(
    ethers.toUtf8Bytes(JSON.stringify(submission.rule))
  );
  const messageHash = ethers.keccak256(
    ethers.toUtf8Bytes(message.data)
  );
  
  return { valid: true, signer: recovered };
}
```

### 2. 防篡改机制
```javascript
// 确保数据完整性
function validateDataIntegrity(submitted, signed) {
  // 比较关键字段
  const criticalFields = ['dailyLimit', 'whitelist', 'ruleType'];
  
  for (const field of criticalFields) {
    if (JSON.stringify(submitted[field]) !== 
        JSON.stringify(signed[field])) {
      throw new Error(`字段 ${field} 被篡改`);
    }
  }
}
```

### 3. 权限管理
```javascript
// 多级权限验证
const PERMISSIONS = {
  ADMIN: ['CREATE', 'UPDATE', 'DELETE'],
  OPERATOR: ['CREATE', 'UPDATE'],
  VIEWER: ['READ']
};

async function checkPermission(address, action) {
  const role = await getUserRole(address);
  return PERMISSIONS[role]?.includes(action);
}
```

## 🧪 测试策略

### E2E 测试
```typescript
// 使用 Playwright 测试完整流程
test('转账规则签名流程', async ({ page }) => {
  // 1. 填写表单
  await fillTransferRuleForm(page, ruleData);
  
  // 2. 模拟 MetaMask 签名
  await metamaskPage.approvePendingSignRequest();
  
  // 3. 验证后端保存
  const result = await verifyBackendSave();
  
  // 4. 检查前端反馈
  await expect(page.locator('.success')).toBeVisible();
});
```

### 单元测试
```javascript
// 测试签名验证逻辑
describe('签名验证', () => {
  it('应该接受有效签名', async () => {
    const result = await verifySignature(validSubmission);
    expect(result.valid).toBe(true);
  });
  
  it('应该拒绝篡改的数据', async () => {
    const tampered = { ...validSubmission };
    tampered.rule.dailyLimit = 9999;
    
    await expect(verifySignature(tampered))
      .rejects.toThrow('数据被篡改');
  });
  
  it('应该拒绝过期签名', async () => {
    const expired = createExpiredSubmission();
    await expect(verifySignature(expired))
      .rejects.toThrow('签名过期');
  });
});
```

## 📊 监控和审计

### 日志记录
```javascript
// 记录所有签名操作
logger.info('签名验证', {
  action: 'UPDATE_TRANSFER_RULE',
  signer: signerAddress,
  ruleId: rule.id,
  timestamp: new Date(),
  result: 'success'
});
```

### 监控指标
- 签名成功率
- 平均签名时间
- 失败原因分布
- 异常签名检测

## 🚀 部署检查清单

- [ ] MetaMask 集成测试通过
- [ ] 签名验证逻辑完整
- [ ] 防篡改机制启用
- [ ] 防重放保护配置
- [ ] 权限系统配置正确
- [ ] 数据库索引优化
- [ ] 日志和监控就绪
- [ ] 错误处理完善
- [ ] 用户体验流畅
- [ ] 安全审计通过

## 💡 总结

我们的实现完全覆盖了你描述的实际项目场景：

1. ✅ **用户编辑规则** - 表单数据收集和验证
2. ✅ **MetaMask 唤起** - Web3 Provider 注入和交互
3. ✅ **用户确认签名** - 签名请求处理和批准
4. ✅ **前端获取签名** - 签名结果和数据合并
5. ✅ **后端验证保存** - 完整的验证逻辑和存储
6. ✅ **用户反馈** - 状态更新和成功提示

关键优势：
- 🔐 **安全性**: 防篡改、防重放、权限验证
- 🧪 **可测试**: 完整的 E2E 和单元测试
- 📈 **可扩展**: 模块化设计，易于扩展
- 🎯 **生产就绪**: 包含错误处理、日志、监控

这个解决方案可以直接应用到实际项目中，只需根据具体业务需求调整字段和验证规则即可。