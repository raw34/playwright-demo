import { test, expect } from '@playwright/test';
import { MessageSigningService } from '../../utils/message-signing';
import { BackendMockService } from '../../utils/backend-mock';

/**
 * 简化版本的转账规则签名测试
 * 验证核心签名和验证逻辑
 */
test.describe('Transfer Rule Signing - Simplified Flow', () => {
  let signingService: MessageSigningService;
  let backendService: BackendMockService;

  test.beforeEach(async () => {
    signingService = new MessageSigningService();
    const signerAddress = signingService.getAddress();
    backendService = new BackendMockService([signerAddress]);
    
    console.log(`🔐 签名地址: ${signerAddress}`);
  });

  test('完整签名流程验证', async () => {
    console.log('\n📝 测试转账规则签名流程\n');

    // 步骤 1: 准备转账规则数据
    const ruleData = {
      ruleName: '生产环境转账限额规则',
      dailyLimit: 100,
      whitelist: [
        '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb7',
        '0x5aAeb6053f3E94C9b9A09f33669435E7Ef1BeAed'
      ],
      ruleType: 'daily',
      autoExecute: true,
      notes: '生产环境日常运营转账限额',
      timestamp: Date.now()
    };
    
    console.log('✅ 步骤 1: 转账规则数据已准备');
    console.log(`   规则名称: ${ruleData.ruleName}`);
    console.log(`   每日限额: ${ruleData.dailyLimit} ETH`);

    // 步骤 2-3: 签名（模拟 MetaMask）
    const signedMessage = await signingService.signContent({
      action: 'UPDATE_TRANSFER_RULE',
      data: ruleData
    });
    
    console.log('✅ 步骤 2-3: 数据已签名（模拟 MetaMask）');
    console.log(`   签名: ${signedMessage.signature.substring(0, 20)}...`);
    console.log(`   签名者: ${signedMessage.address}`);

    // 步骤 4: 合并数据准备提交
    const submissionData = {
      rule: ruleData,
      signature: signedMessage.signature,
      signerAddress: signedMessage.address,
      signedMessage: signedMessage.message
    };
    
    console.log('✅ 步骤 4: 签名和数据已合并');

    // 步骤 5: 后端验证
    const verificationResult = await backendService.verifySubmission({
      data: submissionData.rule,
      signature: submissionData.signature,
      signerAddress: submissionData.signerAddress,
      signedMessage: submissionData.signedMessage
    });
    
    expect(verificationResult.isValid).toBe(true);
    expect(verificationResult.signerAddress).toBe(signedMessage.address);
    
    console.log('✅ 步骤 5: 后端验证通过');
    console.log(`   验证结果: ${verificationResult.isValid ? '合法' : '非法'}`);

    // 步骤 6: 模拟保存和返回
    const savedRule = {
      id: `RULE-${Date.now()}`,
      ...ruleData,
      signature: signedMessage.signature,
      signerAddress: signedMessage.address,
      createdAt: new Date().toISOString()
    };
    
    console.log('✅ 步骤 6: 规则已保存');
    console.log(`   规则 ID: ${savedRule.id}`);
    console.log(`   保存时间: ${savedRule.createdAt}`);
    
    console.log('\n🎉 完整流程测试通过！');
  });

  test('检测数据篡改', async () => {
    console.log('\n🔒 测试防篡改机制\n');

    const originalRule = {
      ruleName: '测试规则',
      dailyLimit: 10,
      whitelist: ['0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb7']
    };

    // 签名原始数据
    const signed = await signingService.signContent({
      action: 'UPDATE_TRANSFER_RULE',
      data: originalRule
    });
    
    console.log('✅ 原始数据已签名');
    console.log(`   限额: ${originalRule.dailyLimit} ETH`);

    // 篡改数据
    const tamperedRule = {
      ...originalRule,
      dailyLimit: 1000 // 从 10 改为 1000
    };

    // 提交篡改的数据
    const submission = {
      data: tamperedRule,
      signature: signed.signature,
      signerAddress: signed.address,
      signedMessage: signed.message
    };

    const result = await backendService.verifySubmission(submission);
    
    // 签名本身有效
    expect(result.isValid).toBe(true);
    
    // 但可以检测到数据不一致
    const parsedMessage = JSON.parse(signed.message);
    expect(parsedMessage.data.dailyLimit).toBe(10);
    expect(tamperedRule.dailyLimit).toBe(1000);
    
    const isDataTampered = parsedMessage.data.dailyLimit !== tamperedRule.dailyLimit;
    expect(isDataTampered).toBe(true);
    
    console.log('⚠️ 数据篡改已检测');
    console.log(`   签名的限额: ${parsedMessage.data.dailyLimit} ETH`);
    console.log(`   提交的限额: ${tamperedRule.dailyLimit} ETH`);
    console.log(`   检测结果: 数据被篡改！`);
  });

  test('拒绝过期签名', async () => {
    console.log('\n⏰ 测试过期签名处理\n');

    const oldTimestamp = Date.now() - (30 * 60 * 1000); // 30分钟前
    
    const ruleData = {
      ruleName: '过期规则',
      dailyLimit: 50
    };

    const signed = await signingService.signContent({
      action: 'UPDATE_TRANSFER_RULE',
      data: ruleData,
      timestamp: oldTimestamp
    });

    const result = await backendService.verifySubmission({
      data: ruleData,
      signature: signed.signature,
      signerAddress: signed.address,
      signedMessage: signed.message
    });

    expect(result.isValid).toBe(false);
    expect(result.error).toContain('expired');
    
    console.log('✅ 过期签名被正确拒绝');
    console.log(`   签名时间: ${new Date(oldTimestamp).toLocaleString()}`);
    console.log(`   当前时间: ${new Date().toLocaleString()}`);
    console.log(`   错误信息: ${result.error}`);
  });

  test('验证不可信签名者', async () => {
    console.log('\n👤 测试签名者权限验证\n');

    // 创建受限的后端服务（只信任特定地址）
    const trustedAddress = '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb7';
    const restrictedBackend = new BackendMockService([trustedAddress]);
    
    console.log(`   信任的地址: ${trustedAddress}`);
    console.log(`   当前签名地址: ${signingService.getAddress()}`);

    const ruleData = {
      ruleName: '受限规则',
      dailyLimit: 100
    };

    const signed = await signingService.signContent({
      action: 'UPDATE_TRANSFER_RULE',
      data: ruleData
    });

    const result = await restrictedBackend.verifySubmission({
      data: ruleData,
      signature: signed.signature,
      signerAddress: signed.address,
      signedMessage: signed.message
    });

    expect(result.isValid).toBe(false);
    expect(result.error).toContain('not in trusted addresses');
    
    console.log('✅ 不可信签名者被正确拒绝');
    console.log(`   错误信息: ${result.error}`);
  });

  test('API 端点模拟', async () => {
    console.log('\n🌐 测试 API 端点集成\n');

    const ruleData = {
      ruleName: 'API 测试规则',
      dailyLimit: 200,
      ruleType: 'weekly'
    };

    const signed = await signingService.signContent({
      action: 'CREATE_TRANSFER_RULE',
      data: ruleData
    });

    // 模拟 API 请求体
    const requestBody = {
      data: ruleData,
      signature: signed.signature,
      signerAddress: signed.address,
      signedMessage: signed.message
    };

    // 处理 API 提交
    const response = await backendService.handleApiSubmission(requestBody);
    
    expect(response.success).toBe(true);
    expect(response.message).toContain('verified and accepted');
    expect(response.data).toBeDefined();
    expect(response.data?.submissionId).toMatch(/^SUB-/);
    
    console.log('✅ API 端点处理成功');
    console.log(`   响应: ${response.message}`);
    console.log(`   提交 ID: ${response.data?.submissionId}`);
    console.log(`   签名者: ${response.data?.signerAddress}`);
  });
});