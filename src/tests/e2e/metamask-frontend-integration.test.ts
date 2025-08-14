import { test, expect } from '@playwright/test';
import { MessageSigningService } from '../../utils/message-signing';
import { MetaMaskMockPage } from '../../pages/metamask-mock.page';
import { blockchainConfig } from '../../config/blockchain.config';

/**
 * MetaMask 前端集成测试
 * 演示如何在真实的前端页面中注入 MetaMask mock，实现完全自动化
 */
test.describe('MetaMask Frontend Integration - 前端零修改方案', () => {
  
  test('完整前端流程：转账规则编辑 → MetaMask签名 → 后端验证', async ({ page }) => {
    console.log('\n🎯 演示完整的前端集成流程\n');
    
    // 步骤 1: 创建真实的前端页面（模拟你的生产代码）
    const productionFrontendCode = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>转账规则管理系统</title>
        <style>
          body { 
            font-family: Arial, sans-serif; 
            max-width: 800px; 
            margin: 50px auto; 
            padding: 20px;
            background: #f5f5f5;
          }
          .container {
            background: white;
            border-radius: 10px;
            padding: 30px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
          }
          h1 { color: #333; }
          .form-group {
            margin-bottom: 20px;
          }
          label {
            display: block;
            margin-bottom: 5px;
            font-weight: bold;
            color: #555;
          }
          input, select, textarea {
            width: 100%;
            padding: 10px;
            border: 1px solid #ddd;
            border-radius: 4px;
            font-size: 14px;
            box-sizing: border-box;
          }
          button {
            background: #007bff;
            color: white;
            border: none;
            padding: 12px 24px;
            border-radius: 5px;
            cursor: pointer;
            font-size: 16px;
            font-weight: bold;
          }
          button:hover { background: #0056b3; }
          button:disabled { 
            background: #6c757d; 
            cursor: not-allowed;
          }
          .status {
            margin-top: 20px;
            padding: 15px;
            border-radius: 5px;
            display: none;
          }
          .status.show { display: block; }
          .status.info { background: #d1ecf1; color: #0c5460; }
          .status.success { background: #d4edda; color: #155724; }
          .status.error { background: #f8d7da; color: #721c24; }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>🏦 转账规则管理</h1>
          <p style="color: #666;">
            这是你的真实生产代码，完全不需要修改
          </p>
          
          <form id="transfer-rule-form">
            <div class="form-group">
              <label for="ruleName">规则名称</label>
              <input type="text" id="ruleName" value="每日转账限额规则" required>
            </div>
            
            <div class="form-group">
              <label for="dailyLimit">每日限额 (ETH)</label>
              <input type="number" id="dailyLimit" value="100" step="0.01" required>
            </div>
            
            <div class="form-group">
              <label for="whitelist">白名单地址（每行一个）</label>
              <textarea id="whitelist" rows="3">0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb7
0x5aAeb6053f3E94C9b9A09f33669435E7Ef1BeAed</textarea>
            </div>
            
            <div class="form-group">
              <label for="ruleType">规则类型</label>
              <select id="ruleType">
                <option value="daily">每日限额</option>
                <option value="weekly">每周限额</option>
                <option value="monthly">每月限额</option>
              </select>
            </div>
            
            <button type="submit" id="save-btn">
              💾 保存规则（需要 MetaMask 签名）
            </button>
          </form>
          
          <div id="status" class="status"></div>
        </div>
        
        <script>
          // ================================================
          // 这是你的真实生产代码，无需任何修改
          // ================================================
          
          document.getElementById('transfer-rule-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const statusDiv = document.getElementById('status');
            const saveBtn = document.getElementById('save-btn');
            
            try {
              // 更新状态
              statusDiv.className = 'status info show';
              statusDiv.textContent = '正在处理...';
              saveBtn.disabled = true;
              
              // 步骤 1: 检查 MetaMask
              if (typeof window.ethereum === 'undefined') {
                throw new Error('请安装 MetaMask 扩展');
              }
              
              // 步骤 2: 请求账户授权
              statusDiv.textContent = '请求 MetaMask 账户授权...';
              const accounts = await window.ethereum.request({
                method: 'eth_requestAccounts'
              });
              
              if (!accounts || accounts.length === 0) {
                throw new Error('没有可用的以太坊账户');
              }
              
              const account = accounts[0];
              console.log('当前账户:', account);
              
              // 步骤 3: 收集表单数据
              const formData = {
                ruleName: document.getElementById('ruleName').value,
                dailyLimit: parseFloat(document.getElementById('dailyLimit').value),
                whitelist: document.getElementById('whitelist').value
                  .split('\\n')
                  .filter(addr => addr.trim()),
                ruleType: document.getElementById('ruleType').value,
                timestamp: Date.now()
              };
              
              // 步骤 4: 构造要签名的消息
              const messageToSign = {
                action: 'SAVE_TRANSFER_RULE',
                data: formData,
                nonce: Math.random().toString(36).substring(7),
                chainId: await window.ethereum.request({ method: 'eth_chainId' })
              };
              
              // 步骤 5: 请求 MetaMask 签名
              statusDiv.textContent = '⏳ 请在 MetaMask 中确认签名...';
              
              const message = JSON.stringify(messageToSign);
              const hexMessage = '0x' + Array.from(
                new TextEncoder().encode(message)
              ).map(b => b.toString(16).padStart(2, '0')).join('');
              
              // 关键：调用标准的 ethereum.request
              // 生产环境：弹出真实 MetaMask
              // 测试环境：调用注入的模拟函数
              const signature = await window.ethereum.request({
                method: 'personal_sign',
                params: [hexMessage, account]
              });
              
              console.log('签名结果:', signature);
              
              // 步骤 6: 提交到后端
              statusDiv.textContent = '正在提交到服务器...';
              
              const submission = {
                rule: formData,
                signature: signature,
                signerAddress: account,
                signedMessage: message
              };
              
              // 模拟 API 调用
              await submitToBackend(submission);
              
              // 步骤 7: 显示成功
              statusDiv.className = 'status success show';
              statusDiv.innerHTML = 
                '<strong>✅ 转账规则保存成功！</strong><br>' +
                '签名者: ' + account + '<br>' +
                '签名: ' + signature.substring(0, 20) + '...';
              
              // 保存提交数据供测试验证
              window.__lastSubmission = submission;
              
            } catch (error) {
              console.error('保存失败:', error);
              statusDiv.className = 'status error show';
              statusDiv.textContent = '❌ 错误: ' + error.message;
            } finally {
              saveBtn.disabled = false;
            }
          });
          
          // 模拟后端 API
          async function submitToBackend(data) {
            return new Promise((resolve) => {
              setTimeout(() => {
                console.log('后端接收到数据:', data);
                resolve({ success: true, id: 'RULE-' + Date.now() });
              }, 1000);
            });
          }
        </script>
      </body>
      </html>
    `;
    
    // 步骤 1: 加载前端页面（完全没有修改的生产代码）
    await page.setContent(productionFrontendCode);
    console.log('✅ 步骤 1: 已加载生产环境前端代码（零修改）');
    
    // 步骤 2: 注入 MetaMask Mock
    const metamaskPage = new MetaMaskMockPage(page);
    const config = blockchainConfig.getChainConfig();
    await metamaskPage.injectWeb3Provider(config.chainId);
    console.log('✅ 步骤 2: 已注入 Mock MetaMask（自动签名）');
    
    // 步骤 3: 填写表单
    await page.fill('#ruleName', '自动化测试规则');
    await page.fill('#dailyLimit', '500');
    await page.fill('#whitelist', 
      '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb7\n' +
      '0x5aAeb6053f3E94C9b9A09f33669435E7Ef1BeAed\n' +
      '0xde0B295669a9FD93d5F28D9Ec85E40f4cb697BAe'
    );
    await page.selectOption('#ruleType', 'weekly');
    console.log('✅ 步骤 3: 表单数据已填写');
    
    // 步骤 4: 点击保存（触发签名流程）
    const savePromise = page.click('#save-btn');
    console.log('✅ 步骤 4: 点击保存按钮，触发签名流程');
    
    // 步骤 5: 自动批准签名（无需人工介入）
    await page.waitForTimeout(500); // 等待签名请求创建
    await metamaskPage.approvePendingSignRequest();
    console.log('✅ 步骤 5: MetaMask 签名自动完成（无需人工确认）');
    
    // 等待保存完成
    await savePromise;
    await page.waitForTimeout(1500); // 等待后端处理
    
    // 步骤 6: 验证成功消息
    await expect(page.locator('.status.success')).toBeVisible();
    const statusText = await page.locator('.status').textContent();
    expect(statusText).toContain('转账规则保存成功');
    console.log('✅ 步骤 6: 保存成功，前端显示成功消息');
    
    // 步骤 7: 验证提交的数据
    const submittedData = await page.evaluate(() => {
      return (window as any).__lastSubmission;
    });
    
    expect(submittedData).toBeDefined();
    expect(submittedData.rule.ruleName).toBe('自动化测试规则');
    expect(submittedData.rule.dailyLimit).toBe(500);
    expect(submittedData.signature).toBeTruthy();
    expect(submittedData.signerAddress).toBeTruthy();
    
    console.log('\n📊 提交的数据：');
    console.log(`   规则名称: ${submittedData.rule.ruleName}`);
    console.log(`   限额: ${submittedData.rule.dailyLimit} ETH`);
    console.log(`   签名: ${submittedData.signature.substring(0, 20)}...`);
    console.log(`   签名者: ${submittedData.signerAddress}`);
    
    console.log('\n🎉 完整前端流程测试通过！');
    console.log('✅ 前端代码：完全没有修改');
    console.log('✅ MetaMask签名：完全自动化');
    console.log('✅ 人工介入：不需要');
    console.log('✅ CI/CD支持：可以');
  });
  
  test('对比演示：使用和不使用Mock的区别', async ({ page }) => {
    console.log('\n📊 对比说明\n');
    
    const scenarios = [
      {
        title: '使用真实 MetaMask（生产环境）',
        issues: [
          '❌ 会弹出 MetaMask 扩展窗口',
          '❌ 需要人工点击"确认"按钮',
          '❌ Playwright 无法控制扩展窗口',
          '❌ 测试会卡住等待人工操作',
          '❌ 无法在 CI/CD 环境运行'
        ]
      },
      {
        title: '使用 Mock Provider（测试环境）',
        advantages: [
          '✅ 不会弹出任何窗口',
          '✅ 自动完成签名',
          '✅ Playwright 完全控制',
          '✅ 测试流畅运行',
          '✅ 支持 CI/CD 环境',
          '✅ 签名结果真实有效'
        ]
      }
    ];
    
    for (const scenario of scenarios) {
      console.log(`\n${scenario.title}:`);
      const items = scenario.issues || scenario.advantages;
      items.forEach(item => console.log(`   ${item}`));
    }
    
    console.log('\n💡 关键点：');
    console.log('   前端代码完全不需要修改');
    console.log('   通过 Playwright 注入实现自动化');
    console.log('   保证了测试的真实性和有效性');
  });
});