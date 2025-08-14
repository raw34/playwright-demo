import { ethers } from 'ethers';
import { blockchainConfig } from '../config/blockchain.config';

export interface SignedMessage {
  message: string;
  signature: string;
  address: string;
  timestamp: number;
}

export interface ContentToSign {
  action: string;
  data: Record<string, any>;
  timestamp?: number;
  nonce?: string;
}

export class MessageSigningService {
  private wallet: ethers.Wallet;
  private provider: ethers.JsonRpcProvider;

  constructor(privateKey?: string) {
    const config = blockchainConfig.getChainConfig();
    this.provider = new ethers.JsonRpcProvider(config.rpcUrl);
    
    // Use provided private key or from config
    const key = privateKey || config.privateKey;
    this.wallet = new ethers.Wallet(key, this.provider);
  }

  /**
   * Create a standardized message from content
   */
  public createMessage(content: ContentToSign): string {
    const messageData = {
      action: content.action,
      data: content.data,
      timestamp: content.timestamp || Date.now(),
      nonce: content.nonce || this.generateNonce(),
    };
    
    // Create deterministic JSON string - sort keys at top level only
    const sortedKeys = Object.keys(messageData).sort();
    const sortedData: any = {};
    for (const key of sortedKeys) {
      sortedData[key] = messageData[key as keyof typeof messageData];
    }
    
    return JSON.stringify(sortedData);
  }

  /**
   * Sign a message using EIP-191 personal sign
   */
  public async signMessage(message: string): Promise<SignedMessage> {
    const signature = await this.wallet.signMessage(message);
    
    return {
      message,
      signature,
      address: this.wallet.address,
      timestamp: Date.now(),
    };
  }

  /**
   * Sign content directly
   */
  public async signContent(content: ContentToSign): Promise<SignedMessage> {
    const message = this.createMessage(content);
    return this.signMessage(message);
  }

  /**
   * Verify a signed message
   */
  public static verifySignature(
    message: string,
    signature: string,
    expectedAddress: string
  ): boolean {
    try {
      const recoveredAddress = ethers.verifyMessage(message, signature);
      return recoveredAddress.toLowerCase() === expectedAddress.toLowerCase();
    } catch (error) {
      console.error('Signature verification failed:', error);
      return false;
    }
  }

  /**
   * Create EIP-712 typed data signature (for advanced use cases)
   */
  public async signTypedData(
    domain: ethers.TypedDataDomain,
    types: Record<string, ethers.TypedDataField[]>,
    value: Record<string, any>
  ): Promise<string> {
    return await this.wallet.signTypedData(domain, types, value);
  }

  /**
   * Verify EIP-712 typed data signature
   */
  public static verifyTypedData(
    domain: ethers.TypedDataDomain,
    types: Record<string, ethers.TypedDataField[]>,
    value: Record<string, any>,
    signature: string,
    expectedAddress: string
  ): boolean {
    try {
      const recoveredAddress = ethers.verifyTypedData(domain, types, value, signature);
      return recoveredAddress.toLowerCase() === expectedAddress.toLowerCase();
    } catch (error) {
      console.error('Typed data verification failed:', error);
      return false;
    }
  }

  /**
   * Generate a random nonce
   */
  private generateNonce(): string {
    return ethers.hexlify(ethers.randomBytes(32));
  }

  /**
   * Get the wallet address
   */
  public getAddress(): string {
    return this.wallet.address;
  }

  /**
   * Create a hash of the message (for logging/tracking)
   */
  public static hashMessage(message: string): string {
    return ethers.keccak256(ethers.toUtf8Bytes(message));
  }
}