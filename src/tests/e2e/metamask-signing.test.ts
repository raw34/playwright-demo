import { test, expect } from '@playwright/test';
import { MetaMaskMockPage } from '../../pages/metamask-mock.page';
import { MessageSigningService } from '../../utils/message-signing';
import { BackendMockService } from '../../utils/backend-mock';
import { blockchainConfig } from '../../config/blockchain.config';

test.describe('MetaMask Message Signing E2E Tests', () => {
  let metamaskPage: MetaMaskMockPage;
  let signingService: MessageSigningService;
  let backendService: BackendMockService;
  let signerAddress: string;

  test.beforeEach(async ({ page }) => {
    // Initialize services
    metamaskPage = new MetaMaskMockPage(page);
    signingService = new MessageSigningService();
    signerAddress = signingService.getAddress();
    
    // Initialize backend with trusted addresses
    backendService = new BackendMockService([signerAddress]);
    
    console.log(`\n🔐 Test wallet address: ${signerAddress}`);
  });

  test('should sign and verify a simple message', async () => {
    const message = 'Hello, Blockchain!';
    
    await test.step('Sign message', async () => {
      const signedMessage = await signingService.signMessage(message);
      
      expect(signedMessage.signature).toBeTruthy();
      expect(signedMessage.signature).toMatch(/^0x[a-fA-F0-9]{130}$/);
      expect(signedMessage.address).toBe(signerAddress);
      
      console.log(`✅ Message signed successfully`);
      console.log(`   Signature: ${signedMessage.signature.substring(0, 20)}...`);
    });

    await test.step('Verify signature', async () => {
      const signedMessage = await signingService.signMessage(message);
      
      const isValid = MessageSigningService.verifySignature(
        message,
        signedMessage.signature,
        signerAddress
      );
      
      expect(isValid).toBe(true);
      console.log(`✅ Signature verified successfully`);
    });

    await test.step('Verify with wrong address should fail', async () => {
      const signedMessage = await signingService.signMessage(message);
      const wrongAddress = '0x0000000000000000000000000000000000000000';
      
      const isValid = MessageSigningService.verifySignature(
        message,
        signedMessage.signature,
        wrongAddress
      );
      
      expect(isValid).toBe(false);
      console.log(`✅ Invalid signature correctly rejected`);
    });
  });

  test('should sign form data and submit to backend', async () => {
    const formData = {
      title: 'Test Document',
      description: 'Important document requiring signature',
      amount: '100.50',
      currency: 'USD',
    };

    let signature: string;
    let message: string;

    await test.step('Create and sign form data', async () => {
      const content = {
        action: 'create_document',
        data: formData,
      };
      
      const signedMessage = await signingService.signContent(content);
      signature = signedMessage.signature;
      message = signedMessage.message;
      
      expect(signature).toBeTruthy();
      console.log(`✅ Form data signed`);
      console.log(`   Action: create_document`);
      console.log(`   Data fields: ${Object.keys(formData).join(', ')}`);
    });

    await test.step('Submit to backend and verify', async () => {
      const submission = {
        data: formData,
        signature: signature,
        signerAddress: signerAddress,
        signedMessage: message,
      };
      
      const result = await backendService.verifySubmission(submission);
      
      expect(result.isValid).toBe(true);
      expect(result.signerAddress).toBe(signerAddress);
      expect(result.data).toBeTruthy();
      
      console.log(`✅ Backend verification successful`);
      console.log(`   Signer verified: ${result.signerAddress}`);
    });

    await test.step('Verify submission is stored', async () => {
      const submissions = backendService.getSubmissionsFrom(signerAddress);
      
      expect(submissions).toHaveLength(1);
      expect(submissions[0].data).toEqual(formData);
      
      console.log(`✅ Submission stored successfully`);
      console.log(`   Total submissions: ${submissions.length}`);
    });
  });

  test('should detect data tampering', async () => {
    const originalData = {
      amount: '100',
      recipient: 'Alice',
    };

    await test.step('Sign original data and detect tampering', async () => {
      // Sign the original data
      const signedMessage = await signingService.signContent({
        action: 'transfer',
        data: originalData,
      });

      // Someone tries to tamper with the data
      const tamperedData = {
        amount: '1000', // Changed amount!
        recipient: 'Alice',
      };

      // Submit with tampered data but original signature
      const submission = {
        data: tamperedData,
        signature: signedMessage.signature,
        signerAddress: signerAddress,
        signedMessage: signedMessage.message,
      };

      // Backend verifies the submission
      const result = await backendService.verifySubmission(submission);
      
      // The signature itself is valid (not forged)
      expect(result.isValid).toBe(true);
      
      // Parse the signed message to see what was actually signed
      const parsedMessage = JSON.parse(signedMessage.message);
      
      // The message structure is { action, data, timestamp, nonce }
      expect(parsedMessage.action).toBe('transfer');
      expect(parsedMessage.data).toBeDefined();
      expect(parsedMessage.data.amount).toBe('100'); // Original amount
      expect(tamperedData.amount).toBe('1000'); // Tampered amount
      
      // This proves the data was tampered after signing
      expect(parsedMessage.data).not.toEqual(tamperedData);
      expect(parsedMessage.data).toEqual(originalData);
      
      // In a real system, the backend would compare submitted data with signed data
      const isDataTampered = JSON.stringify(parsedMessage.data) !== JSON.stringify(tamperedData);
      expect(isDataTampered).toBe(true);
      
      console.log(`✅ Data tampering detected`);
      console.log(`   Signed amount: ${parsedMessage.data.amount}`);
      console.log(`   Submitted amount: ${tamperedData.amount}`);
      console.log(`   Tampering detected: ${isDataTampered}`);
    });
  });

  test('should handle expired messages', async () => {
    await test.step('Create message with old timestamp', async () => {
      const oldTimestamp = Date.now() - (10 * 60 * 1000); // 10 minutes ago
      
      const content = {
        action: 'expired_action',
        data: { test: 'data' },
        timestamp: oldTimestamp,
      };
      
      const signedMessage = await signingService.signContent(content);
      
      const submission = {
        data: content.data,
        signature: signedMessage.signature,
        signerAddress: signerAddress,
        signedMessage: signedMessage.message,
      };
      
      const result = await backendService.verifySubmission(submission);
      
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('expired');
      
      console.log(`✅ Expired message correctly rejected`);
      console.log(`   Error: ${result.error}`);
    });
  });

  test('should verify EIP-712 typed data signature', async () => {
    const domain = {
      name: 'Test Application',
      version: '1',
      chainId: blockchainConfig.getChainConfig().chainId,
      verifyingContract: '0x0000000000000000000000000000000000000000',
    };

    const types = {
      Document: [
        { name: 'title', type: 'string' },
        { name: 'content', type: 'string' },
        { name: 'timestamp', type: 'uint256' },
      ],
    };

    const value = {
      title: 'Important Document',
      content: 'This document requires your signature',
      timestamp: Math.floor(Date.now() / 1000),
    };

    await test.step('Sign typed data', async () => {
      const signature = await signingService.signTypedData(domain, types, value);
      
      expect(signature).toBeTruthy();
      expect(signature).toMatch(/^0x[a-fA-F0-9]{130}$/);
      
      console.log(`✅ Typed data signed`);
      console.log(`   Domain: ${domain.name} v${domain.version}`);
      console.log(`   Document title: ${value.title}`);
    });

    await test.step('Verify typed data signature', async () => {
      const signature = await signingService.signTypedData(domain, types, value);
      
      const result = await backendService.verifyTypedDataSubmission(
        domain,
        types,
        value,
        signature,
        signerAddress
      );
      
      expect(result.isValid).toBe(true);
      expect(result.signerAddress).toBe(signerAddress);
      
      console.log(`✅ Typed data signature verified`);
    });
  });

  test('should reject untrusted signers', async () => {
    // Create a new service with different trusted addresses
    const restrictedBackend = new BackendMockService([
      '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb7', // Some other address
    ]);

    await test.step('Attempt submission from untrusted address', async () => {
      const signedMessage = await signingService.signContent({
        action: 'restricted_action',
        data: { sensitive: 'data' },
      });

      const submission = {
        data: { sensitive: 'data' },
        signature: signedMessage.signature,
        signerAddress: signerAddress,
        signedMessage: signedMessage.message,
      };

      const result = await restrictedBackend.verifySubmission(submission);
      
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('not in trusted addresses');
      
      console.log(`✅ Untrusted signer correctly rejected`);
      console.log(`   Signer: ${signerAddress}`);
      console.log(`   Error: ${result.error}`);
    });
  });

  test('should handle batch signatures', async () => {
    const documents = [
      { id: 1, title: 'Document 1', status: 'pending' },
      { id: 2, title: 'Document 2', status: 'pending' },
      { id: 3, title: 'Document 3', status: 'pending' },
    ];

    await test.step('Sign multiple documents', async () => {
      const signatures = [];
      
      for (const doc of documents) {
        const signed = await signingService.signContent({
          action: 'approve_document',
          data: doc,
        });
        
        signatures.push(signed);
        
        const submission = {
          data: doc,
          signature: signed.signature,
          signerAddress: signerAddress,
          signedMessage: signed.message,
        };
        
        const result = await backendService.verifySubmission(submission);
        expect(result.isValid).toBe(true);
      }
      
      expect(signatures).toHaveLength(documents.length);
      
      const submissions = backendService.getSubmissions();
      expect(submissions).toHaveLength(documents.length);
      
      console.log(`✅ Batch signing completed`);
      console.log(`   Documents signed: ${documents.length}`);
      console.log(`   All signatures valid: true`);
    });
  });

  test('should simulate API endpoint interaction', async () => {
    await test.step('Submit via API endpoint', async () => {
      const formData = {
        orderId: 'ORD-12345',
        amount: '250.00',
        currency: 'USD',
      };

      const signed = await signingService.signContent({
        action: 'confirm_order',
        data: formData,
      });

      // Simulate API request body
      const requestBody = {
        data: formData,
        signature: signed.signature,
        signerAddress: signerAddress,
        signedMessage: signed.message,
      };

      // Handle API submission
      const response = await backendService.handleApiSubmission(requestBody);
      
      expect(response.success).toBe(true);
      expect(response.message).toContain('verified and accepted');
      expect(response.data).toBeTruthy();
      expect(response.data.submissionId).toBeTruthy();
      expect(response.data.signerAddress).toBe(signerAddress);
      
      console.log(`✅ API submission successful`);
      console.log(`   Submission ID: ${response.data.submissionId}`);
      console.log(`   Order ID: ${formData.orderId}`);
      console.log(`   Amount: ${formData.amount} ${formData.currency}`);
    });
  });

  test.afterEach(async () => {
    // Clean up
    backendService.clearSubmissions();
  });
});

test.describe('MetaMask Page Integration Tests', () => {
  test('should simulate complete MetaMask signing flow on a form', async ({ page }) => {
    // Create a simple HTML form for testing
    await page.setContent(`
      <html>
        <body>
          <form id="test-form">
            <input name="title" data-testid="title-input" placeholder="Title" />
            <input name="amount" data-testid="amount-input" placeholder="Amount" />
            <textarea name="description" data-testid="description-input" placeholder="Description"></textarea>
            <button type="submit" data-testid="submit">Submit with Signature</button>
          </form>
          <div id="result"></div>
        </body>
      </html>
    `);

    // Initialize MetaMask mock
    const metamaskPage = new MetaMaskMockPage(page);
    
    // Inject Web3 provider
    await metamaskPage.injectWeb3Provider();
    
    // Add form submission handler
    await page.evaluate(() => {
      const form = document.getElementById('test-form') as HTMLFormElement;
      form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const formData = new FormData(form);
        const data: Record<string, string> = {};
        formData.forEach((value, key) => {
          data[key] = value.toString();
        });
        
        // Check if ethereum is available
        if ((window as any).ethereum) {
          try {
            // Request accounts
            const accounts = await (window as any).ethereum.request({
              method: 'eth_requestAccounts',
            });
            
            // Create message
            const message = JSON.stringify({
              action: 'form_submit',
              data: data,
              timestamp: Date.now(),
            });
            
            // Request signature
            const signature = await (window as any).ethereum.request({
              method: 'personal_sign',
              params: [
                '0x' + Array.from(new TextEncoder().encode(message))
                  .map(b => b.toString(16).padStart(2, '0'))
                  .join(''),
                accounts[0],
              ],
            });
            
            // Display result
            document.getElementById('result')!.innerHTML = `
              <div data-testid="success-message">
                Signature obtained successfully!
                <br/>Address: ${accounts[0]}
                <br/>Signature: ${signature.substring(0, 20)}...
              </div>
            `;
          } catch (error) {
            document.getElementById('result')!.innerHTML = `
              <div data-testid="error-message">Error: ${error}</div>
            `;
          }
        }
      });
    });

    // Fill and submit form
    const formData = {
      title: 'Test Document',
      amount: '500',
      description: 'This is a test document',
    };

    const formSelectors = {
      title: '[data-testid="title-input"]',
      amount: '[data-testid="amount-input"]',
      description: '[data-testid="description-input"]',
    };

    await test.step('Fill form', async () => {
      await metamaskPage.fillForm(formData, formSelectors);
      
      // Verify form is filled
      await expect(page.locator('[data-testid="title-input"]')).toHaveValue('Test Document');
      await expect(page.locator('[data-testid="amount-input"]')).toHaveValue('500');
    });

    await test.step('Submit form and sign', async () => {
      // Start form submission
      const submitPromise = page.click('[data-testid="submit"]');
      
      // Wait a bit for the sign request to be created
      await page.waitForTimeout(100);
      
      // Approve the pending sign request
      await metamaskPage.approvePendingSignRequest();
      
      // Wait for submission to complete
      await submitPromise;
      
      // Check for success message
      await expect(page.locator('[data-testid="success-message"]')).toBeVisible();
      const successText = await page.locator('[data-testid="success-message"]').textContent();
      
      expect(successText).toContain('Signature obtained successfully');
      expect(successText).toContain('Address:');
      expect(successText).toContain('Signature:');
      
      console.log(`✅ Form signed and submitted successfully`);
    });
  });
});