import { Page } from '@playwright/test';
import { MessageSigningService, ContentToSign, SignedMessage } from '../utils/message-signing';

export interface FormData {
  title?: string;
  description?: string;
  amount?: string;
  [key: string]: any;
}

/**
 * Page object for handling MetaMask-like signing interactions
 * This simulates the MetaMask signing flow in E2E tests
 */
export class MetaMaskMockPage {
  private signingService: MessageSigningService;

  constructor(
    private page: Page,
    privateKey?: string
  ) {
    this.signingService = new MessageSigningService(privateKey);
  }

  /**
   * Fill form and prepare for signing
   */
  async fillForm(formData: FormData, formSelectors: Record<string, string>) {
    for (const [field, value] of Object.entries(formData)) {
      if (formSelectors[field]) {
        await this.page.fill(formSelectors[field], String(value));
      }
    }
  }

  /**
   * Simulate clicking the "Sign with MetaMask" button
   */
  async clickSignButton(selector: string = '[data-testid="sign-with-metamask"]') {
    await this.page.click(selector);
  }

  /**
   * Inject signing functionality into the page
   * This simulates MetaMask's ethereum provider
   */
  async injectWeb3Provider(chainId: number = 11155111) {
    const address = this.signingService.getAddress();
    
    await this.page.evaluate(({ walletAddress, chainId }) => {
      // Simulate ethereum provider
      (window as any).ethereum = {
        isMetaMask: true,
        selectedAddress: walletAddress,
        
        request: async ({ method, params }: any) => {
          switch (method) {
            case 'eth_requestAccounts':
              return [walletAddress];
            
            case 'eth_accounts':
              return [walletAddress];
            
            case 'eth_chainId':
              // Return the chain ID from config
              return '0x' + chainId.toString(16);
            
            case 'net_version':
              return chainId.toString();
            
            case 'personal_sign':
              // In real MetaMask, this would show a popup
              // For testing, we'll handle this externally
              return new Promise((resolve) => {
                (window as any).__pendingSignRequest = {
                  message: params[0],
                  resolve,
                };
              });
            
            case 'eth_signTypedData_v4':
              return new Promise((resolve) => {
                (window as any).__pendingTypedDataRequest = {
                  data: params[1],
                  resolve,
                };
              });
            
            default:
              throw new Error(`Unsupported method: ${method}`);
          }
        },
        
        on: (event: string, handler: Function) => {
          // Simulate event listeners
          console.log(`Event listener registered: ${event}`);
        },
      };
      
      // Dispatch event to notify the app that ethereum is available
      window.dispatchEvent(new Event('ethereum#initialized'));
    }, { walletAddress: address, chainId });
  }

  /**
   * Handle pending sign request (simulates user approving in MetaMask)
   */
  async approvePendingSignRequest(): Promise<string> {
    // Get the pending request from the page
    const pendingRequest = await this.page.evaluate(() => {
      return (window as any).__pendingSignRequest;
    });
    
    if (!pendingRequest) {
      throw new Error('No pending sign request found');
    }
    
    // Sign the message
    const message = this.hexToString(pendingRequest.message);
    const signedMessage = await this.signingService.signMessage(message);
    
    // Resolve the pending request with the signature
    await this.page.evaluate((signature) => {
      const request = (window as any).__pendingSignRequest;
      if (request) {
        request.resolve(signature);
        delete (window as any).__pendingSignRequest;
      }
    }, signedMessage.signature);
    
    return signedMessage.signature;
  }

  /**
   * Sign form data and submit
   */
  async signAndSubmitForm(
    formData: FormData,
    action: string = 'submit_form'
  ): Promise<SignedMessage> {
    const content: ContentToSign = {
      action,
      data: formData,
    };
    
    const signedMessage = await this.signingService.signContent(content);
    
    // Inject the signature into the page
    await this.page.evaluate((signed) => {
      (window as any).__lastSignedMessage = signed;
    }, signedMessage);
    
    return signedMessage;
  }

  /**
   * Simulate the complete signing flow
   */
  async completeSigningFlow(
    formData: FormData,
    formSelectors: Record<string, string>,
    submitButtonSelector: string = '[data-testid="submit"]'
  ): Promise<{
    signature: string;
    message: string;
    address: string;
  }> {
    // 1. Fill the form
    await this.fillForm(formData, formSelectors);
    
    // 2. Create the message to sign
    const content: ContentToSign = {
      action: 'form_submission',
      data: formData,
    };
    const message = this.signingService.createMessage(content);
    
    // 3. Sign the message
    const signedMessage = await this.signingService.signMessage(message);
    
    // 4. Inject signature into form as hidden field
    await this.page.evaluate((signed) => {
      // Create hidden inputs for signature data
      const form = document.querySelector('form');
      if (form) {
        const signatureInput = document.createElement('input');
        signatureInput.type = 'hidden';
        signatureInput.name = 'signature';
        signatureInput.value = signed.signature;
        form.appendChild(signatureInput);
        
        const addressInput = document.createElement('input');
        addressInput.type = 'hidden';
        addressInput.name = 'signerAddress';
        addressInput.value = signed.address;
        form.appendChild(addressInput);
        
        const messageInput = document.createElement('input');
        messageInput.type = 'hidden';
        messageInput.name = 'signedMessage';
        messageInput.value = signed.message;
        form.appendChild(messageInput);
      }
    }, signedMessage);
    
    // 5. Submit the form
    await this.page.click(submitButtonSelector);
    
    return {
      signature: signedMessage.signature,
      message: signedMessage.message,
      address: signedMessage.address,
    };
  }

  /**
   * Wait for transaction or signature confirmation
   */
  async waitForConfirmation(
    selector: string = '[data-testid="confirmation-message"]',
    timeout: number = 30000
  ): Promise<string> {
    await this.page.waitForSelector(selector, { timeout });
    return await this.page.textContent(selector) || '';
  }

  /**
   * Get the last error message
   */
  async getErrorMessage(
    selector: string = '[data-testid="error-message"]'
  ): Promise<string | null> {
    const element = await this.page.$(selector);
    if (element) {
      return await element.textContent();
    }
    return null;
  }

  /**
   * Helper to convert hex string to regular string
   */
  private hexToString(hex: string): string {
    if (hex.startsWith('0x')) {
      hex = hex.slice(2);
    }
    let str = '';
    for (let i = 0; i < hex.length; i += 2) {
      str += String.fromCharCode(parseInt(hex.substr(i, 2), 16));
    }
    return str;
  }

  /**
   * Get the signer's address
   */
  getSignerAddress(): string {
    return this.signingService.getAddress();
  }
}