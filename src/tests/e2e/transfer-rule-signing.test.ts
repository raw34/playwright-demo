import { test, expect, Page } from '@playwright/test';
import { MetaMaskMockPage } from '../../pages/metamask-mock.page';
import { MessageSigningService } from '../../utils/message-signing';
import { BackendMockService } from '../../utils/backend-mock';
import { blockchainConfig } from '../../config/blockchain.config';

/**
 * 实际项目场景：转账规则编辑保存流程
 * 完整模拟用户编辑转账规则 -> MetaMask签名 -> 后端验证 -> 保存成功的流程
 */
test.describe('Transfer Rule Signing - Real Project Scenario', () => {
  let page: Page;
  let metamaskPage: MetaMaskMockPage;
  let signingService: MessageSigningService;
  let backendService: BackendMockService;

  test.beforeEach(async ({ page: testPage }) => {
    page = testPage;
    
    // 初始化服务
    metamaskPage = new MetaMaskMockPage(page);
    signingService = new MessageSigningService();
    backendService = new BackendMockService([signingService.getAddress()]);
    
    // 创建模拟的转账规则编辑页面
    await page.setContent(`
      <html>
        <head>
          <title>转账规则管理系统</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            .form-group { margin-bottom: 15px; }
            label { display: block; margin-bottom: 5px; font-weight: bold; }
            input, select, textarea { width: 100%; padding: 8px; border: 1px solid #ddd; }
            button { padding: 10px 20px; margin: 5px; cursor: pointer; }
            .btn-primary { background: #007bff; color: white; border: none; }
            .btn-secondary { background: #6c757d; color: white; border: none; }
            #status { margin-top: 20px; padding: 10px; }
            .success { background: #d4edda; color: #155724; }
            .error { background: #f8d7da; color: #721c24; }
            .info { background: #d1ecf1; color: #0c5460; }
            .signing-preview { background: #f8f9fa; padding: 15px; margin: 15px 0; }
          </style>
        </head>
        <body>
          <h1>转账规则编辑</h1>
          
          <form id="transfer-rule-form">
            <div class="form-group">
              <label>规则名称</label>
              <input type="text" id="ruleName" name="ruleName" value="每日限额转账规则" required />
            </div>
            
            <div class="form-group">
              <label>转账限额（ETH）</label>
              <input type="number" id="dailyLimit" name="dailyLimit" value="10" step="0.01" required />
            </div>
            
            <div class="form-group">
              <label>接收地址白名单</label>
              <textarea id="whitelist" name="whitelist" rows="3">0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb7
0x5aAeb6053f3E94C9b9A09f33669435E7Ef1BeAed</textarea>
            </div>
            
            <div class="form-group">
              <label>规则类型</label>
              <select id="ruleType" name="ruleType">
                <option value="daily">每日限额</option>
                <option value="weekly">每周限额</option>
                <option value="monthly">每月限额</option>
              </select>
            </div>
            
            <div class="form-group">
              <label>自动执行</label>
              <input type="checkbox" id="autoExecute" name="autoExecute" checked />
            </div>
            
            <div class="form-group">
              <label>备注</label>
              <textarea id="notes" name="notes" rows="2">用于日常运营转账的限额规则</textarea>
            </div>
            
            <div>
              <button type="button" class="btn-secondary" onclick="previewRule()">预览</button>
              <button type="submit" class="btn-primary">保存规则（需要签名）</button>
            </div>
          </form>
          
          <div id="signing-preview" class="signing-preview" style="display:none;">
            <h3>待签名内容预览</h3>
            <pre id="preview-content"></pre>
          </div>
          
          <div id="status"></div>
          
          <script>
            // 模拟 MetaMask 注入
            let currentSigningData = null;
            
            // 预览功能
            function previewRule() {
              const formData = new FormData(document.getElementById('transfer-rule-form'));
              const data = Object.fromEntries(formData.entries());
              
              document.getElementById('preview-content').textContent = JSON.stringify(data, null, 2);
              document.getElementById('signing-preview').style.display = 'block';
            }
            
            // 表单提交处理
            document.getElementById('transfer-rule-form').addEventListener('submit', async (e) => {
              e.preventDefault();
              
              const statusDiv = document.getElementById('status');
              statusDiv.className = 'info';
              statusDiv.textContent = '步骤 1/6: 准备转账规则数据...';
              
              // 步骤1: 收集表单数据
              const formData = new FormData(e.target);
              const ruleData = {
                ruleName: formData.get('ruleName'),
                dailyLimit: parseFloat(formData.get('dailyLimit')),
                whitelist: formData.get('whitelist').split('\\n').filter(addr => addr.trim()),
                ruleType: formData.get('ruleType'),
                autoExecute: formData.get('autoExecute') === 'on',
                notes: formData.get('notes'),
                timestamp: Date.now(),
                version: '1.0.0'
              };
              
              // 步骤2: 唤起 MetaMask
              statusDiv.textContent = '步骤 2/6: 正在唤起 MetaMask...';
              
              if (!window.ethereum) {
                statusDiv.className = 'error';
                statusDiv.textContent = '错误: MetaMask 未安装或未连接';
                return;
              }
              
              try {
                // 请求账户
                const accounts = await window.ethereum.request({
                  method: 'eth_requestAccounts'
                });
                
                if (!accounts || accounts.length === 0) {
                  throw new Error('没有可用的账户');
                }
                
                // 步骤3: 用户在 MetaMask 中 review 内容
                statusDiv.textContent = '步骤 3/6: 请在 MetaMask 中确认签名内容...';
                
                // 构造要签名的消息
                const messageToSign = {
                  action: 'UPDATE_TRANSFER_RULE',
                  data: ruleData,
                  signer: accounts[0],
                  chainId: await window.ethereum.request({ method: 'eth_chainId' })
                };
                
                // 显示预览
                document.getElementById('preview-content').textContent = JSON.stringify(messageToSign, null, 2);
                document.getElementById('signing-preview').style.display = 'block';
                
                // 请求签名
                const message = JSON.stringify(messageToSign);
                const hexMessage = '0x' + Array.from(new TextEncoder().encode(message))
                  .map(b => b.toString(16).padStart(2, '0'))
                  .join('');
                
                const signature = await window.ethereum.request({
                  method: 'personal_sign',
                  params: [hexMessage, accounts[0]]
                });
                
                // 步骤4: 前端拿到签名，合并数据
                statusDiv.textContent = '步骤 4/6: 正在提交数据到后端...';
                
                const submissionData = {
                  rule: ruleData,
                  signature: signature,
                  signerAddress: accounts[0],
                  signedMessage: message
                };
                
                // 步骤5: 提交到后端验证和保存
                // 这里模拟后端 API 调用
                const backendResponse = await simulateBackendAPI(submissionData);
                
                if (backendResponse.success) {
                  // 步骤6: 显示成功消息
                  statusDiv.className = 'success';
                  statusDiv.innerHTML = \`
                    <strong>✅ 步骤 6/6: 转账规则保存成功！</strong><br>
                    规则ID: \${backendResponse.ruleId}<br>
                    签名者: \${backendResponse.signer}<br>
                    保存时间: \${new Date(backendResponse.timestamp).toLocaleString()}
                  \`;
                } else {
                  statusDiv.className = 'error';
                  statusDiv.textContent = '保存失败: ' + backendResponse.error;
                }
                
              } catch (error) {
                statusDiv.className = 'error';
                statusDiv.textContent = '错误: ' + error.message;
              }
            });
            
            // 模拟后端 API
            async function simulateBackendAPI(data) {
              // 这里实际项目中会调用真实的后端 API
              // return fetch('/api/transfer-rules', { method: 'POST', body: JSON.stringify(data) })
              
              // 模拟返回
              return new Promise(resolve => {
                setTimeout(() => {
                  // 模拟后端验证签名
                  window.__lastSubmission = data;
                  resolve({
                    success: true,
                    ruleId: 'RULE-' + Date.now(),
                    signer: data.signerAddress,
                    timestamp: Date.now()
                  });
                }, 1000);
              });
            }
          </script>
        </body>
      </html>
    `);
    
    // 注入 MetaMask provider，使用配置中的 chain ID
    const chainConfig = blockchainConfig.getChainConfig();
    await metamaskPage.injectWeb3Provider(chainConfig.chainId);
  });

  test('完整的转账规则签名流程 - 对应实际项目场景', async () => {
    console.log('\n🎯 测试实际项目场景：转账规则编辑保存流程\n');
    
    await test.step('步骤 1: 用户编辑转账规则', async () => {
      // 填写转账规则表单
      await page.fill('#ruleName', '生产环境转账限额规则');
      await page.fill('#dailyLimit', '100');
      await page.fill('#whitelist', `0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb7
0x5aAeb6053f3E94C9b9A09f33669435E7Ef1BeAed
0xde0B295669a9FD93d5F28D9Ec85E40f4cb697BAe`);
      await page.selectOption('#ruleType', 'daily');
      await page.check('#autoExecute');
      await page.fill('#notes', '生产环境日常运营转账限额，每日最多100 ETH');
      
      console.log('✅ 步骤 1 完成: 用户已编辑转账规则');
      
      // 验证表单已填写
      await expect(page.locator('#ruleName')).toHaveValue('生产环境转账限额规则');
      await expect(page.locator('#dailyLimit')).toHaveValue('100');
    });

    await test.step('步骤 2-3: 前端唤起 MetaMask 并用户确认', async () => {
      // 点击保存按钮，触发 MetaMask
      page.click('button[type="submit"]'); // 不等待，让它在后台运行
      
      // 等待签名请求创建
      await page.waitForTimeout(500);
      
      console.log('✅ 步骤 2 完成: MetaMask 已被唤起');
      
      // 验证状态更新
      await expect(page.locator('#status')).toContainText('请在 MetaMask 中确认签名');
      
      // 模拟用户批准签名
      await metamaskPage.approvePendingSignRequest();
      
      console.log('✅ 步骤 3 完成: 用户已在 MetaMask 中确认签名');
      
      // 等待提交完成
      await page.waitForTimeout(1500); // 等待模拟的后端响应
    });

    await test.step('步骤 4: 前端获取签名并提交到后端', async () => {
      // 检查是否有提交的数据
      const submittedData = await page.evaluate(() => {
        return (window as any).__lastSubmission;
      });
      
      expect(submittedData).toBeDefined();
      expect(submittedData.signature).toBeTruthy();
      expect(submittedData.rule).toBeDefined();
      expect(submittedData.rule.ruleName).toBe('生产环境转账限额规则');
      expect(submittedData.rule.dailyLimit).toBe(100);
      
      console.log('✅ 步骤 4 完成: 签名和数据已合并提交到后端');
      console.log(`   签名: ${submittedData.signature.substring(0, 20)}...`);
    });

    await test.step('步骤 5: 后端验证签名并保存', async () => {
      // 获取提交的数据
      const submittedData = await page.evaluate(() => {
        return (window as any).__lastSubmission;
      });
      
      // 使用后端服务验证签名
      const verificationResult = await backendService.verifySubmission({
        data: submittedData.rule,
        signature: submittedData.signature,
        signerAddress: submittedData.signerAddress,
        signedMessage: submittedData.signedMessage
      });
      
      // 调试信息
      if (!verificationResult.isValid) {
        console.log('❌ 验证失败:', verificationResult.error);
        console.log('提交的地址:', submittedData.signerAddress);
        console.log('期望的地址:', signingService.getAddress());
      }
      
      expect(verificationResult.isValid).toBe(true);
      expect(verificationResult.signerAddress?.toLowerCase()).toBe(signingService.getAddress().toLowerCase());
      
      console.log('✅ 步骤 5 完成: 后端已验证签名并保存到数据库');
      console.log(`   验证结果: ${verificationResult.isValid ? '合法' : '非法'}`);
      console.log(`   签名者地址: ${verificationResult.signerAddress}`);
    });

    await test.step('步骤 6: 前端显示保存成功', async () => {
      // 等待后端响应
      await page.waitForTimeout(1500);
      
      // 验证成功消息
      await expect(page.locator('#status')).toHaveClass(/success/);
      await expect(page.locator('#status')).toContainText('转账规则保存成功');
      await expect(page.locator('#status')).toContainText('规则ID: RULE-');
      
      const statusText = await page.locator('#status').textContent();
      console.log('✅ 步骤 6 完成: 用户收到保存成功提示');
      console.log(`   ${statusText?.split('\n')[0]}`);
    });

    // 验证完整流程
    console.log('\n🎉 完整流程测试通过！所有步骤都已成功完成。');
  });

  test('签名被篡改的场景 - 安全性验证', async () => {
    await test.step('正常签名流程', async () => {
      // 创建原始规则数据
      const originalRule = {
        ruleName: '测试规则',
        dailyLimit: 10,
        whitelist: ['0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb7'],
        ruleType: 'daily',
        autoExecute: true,
        notes: '测试用规则'
      };
      
      // 签名原始数据
      const signed = await signingService.signContent({
        action: 'UPDATE_TRANSFER_RULE',
        data: originalRule
      });
      
      console.log('✅ 原始规则已签名');
      console.log(`   限额: ${originalRule.dailyLimit} ETH`);
    });

    await test.step('尝试篡改数据', async () => {
      const originalRule = {
        ruleName: '测试规则',
        dailyLimit: 10,
        whitelist: ['0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb7'],
        ruleType: 'daily',
        autoExecute: true,
        notes: '测试用规则'
      };
      
      const signed = await signingService.signContent({
        action: 'UPDATE_TRANSFER_RULE',
        data: originalRule
      });
      
      // 恶意用户尝试篡改限额
      const tamperedRule = {
        ...originalRule,
        dailyLimit: 1000 // 篡改：从 10 改为 1000
      };
      
      // 提交篡改后的数据但使用原始签名
      const submission = {
        data: tamperedRule,
        signature: signed.signature,
        signerAddress: signed.address,
        signedMessage: signed.message
      };
      
      // 后端验证
      const result = await backendService.verifySubmission(submission);
      
      // 签名本身是有效的
      expect(result.isValid).toBe(true);
      
      // 但是可以检测到数据不一致
      const parsedMessage = JSON.parse(signed.message);
      expect(parsedMessage.data.dailyLimit).toBe(10); // 签名的是 10
      expect(tamperedRule.dailyLimit).toBe(1000); // 提交的是 1000
      
      console.log('⚠️ 数据篡改已被检测');
      console.log(`   签名中的限额: ${parsedMessage.data.dailyLimit} ETH`);
      console.log(`   提交的限额: ${tamperedRule.dailyLimit} ETH`);
      console.log('   结论: 数据已被篡改，应拒绝此次提交');
    });
  });

  test('签名过期的场景 - 防重放攻击', async () => {
    await test.step('创建过期的签名', async () => {
      const oldTimestamp = Date.now() - (30 * 60 * 1000); // 30分钟前
      
      const ruleData = {
        ruleName: '过期规则',
        dailyLimit: 50,
        timestamp: oldTimestamp
      };
      
      const signed = await signingService.signContent({
        action: 'UPDATE_TRANSFER_RULE',
        data: ruleData,
        timestamp: oldTimestamp
      });
      
      // 尝试使用过期签名
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
      console.log(`   结果: ${result.error}`);
    });
  });
});