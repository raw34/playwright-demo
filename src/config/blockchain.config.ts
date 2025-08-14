import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

export interface ChainConfig {
  rpcUrl: string;
  chainId: number;
  privateKey: string;
  recipientAddress: string;
  name: string;
  explorer?: string;
}

export interface TransactionConfig {
  transferAmount: string;
  gasLimit: number;
  maxFeePerGas?: bigint;
  maxPriorityFeePerGas?: bigint;
}

export interface TestConfig {
  timeout: number;
  confirmations: number;
}

class BlockchainConfig {
  private environment: 'test' | 'production';
  private chainNames: Record<string, string> = {
    '11155111': 'Sepolia Testnet',
    '42161': 'Arbitrum One',
  };
  private explorerUrls: Record<string, string> = {
    '11155111': 'https://sepolia.etherscan.io',
    '42161': 'https://arbiscan.io',
  };

  constructor() {
    this.environment = (process.env.ENVIRONMENT || 'test') as 'test' | 'production';
    this.validateConfig();
  }

  private validateConfig(): void {
    const requiredEnvVars = ['RPC_URL', 'CHAIN_ID', 'PRIVATE_KEY', 'RECIPIENT_ADDRESS'];
    const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);

    if (missingVars.length > 0) {
      throw new Error(
        `Missing required environment variables: ${missingVars.join(', ')}\n` +
        `Make sure your .env file contains all required variables for the ${this.environment} environment.`
      );
    }

    // Validate chain ID matches environment
    const chainId = process.env.CHAIN_ID!;
    const expectedChainIds = {
      test: ['11155111'], // Sepolia
      production: ['42161'], // Arbitrum One
    };

    if (!expectedChainIds[this.environment].includes(chainId)) {
      throw new Error(
        `Chain ID ${chainId} is not valid for ${this.environment} environment. ` +
        `Expected one of: ${expectedChainIds[this.environment].join(', ')}`
      );
    }
  }

  public getChainConfig(): ChainConfig {
    const chainId = process.env.CHAIN_ID!;
    return {
      rpcUrl: process.env.RPC_URL!,
      chainId: parseInt(chainId, 10),
      privateKey: process.env.PRIVATE_KEY!,
      recipientAddress: process.env.RECIPIENT_ADDRESS!,
      name: this.chainNames[chainId] || `Chain ${chainId}`,
      explorer: this.explorerUrls[chainId],
    };
  }

  public getTransactionConfig(): TransactionConfig {
    const config: TransactionConfig = {
      transferAmount: process.env.TRANSFER_AMOUNT_ETH || '0.001',
      gasLimit: parseInt(process.env.GAS_LIMIT || '21000', 10),
    };

    if (process.env.MAX_FEE_PER_GAS_GWEI) {
      config.maxFeePerGas = BigInt(parseFloat(process.env.MAX_FEE_PER_GAS_GWEI) * 1e9);
    }

    if (process.env.MAX_PRIORITY_FEE_PER_GAS_GWEI) {
      config.maxPriorityFeePerGas = BigInt(
        parseFloat(process.env.MAX_PRIORITY_FEE_PER_GAS_GWEI) * 1e9
      );
    }

    return config;
  }

  public getTestConfig(): TestConfig {
    return {
      timeout: parseInt(process.env.TEST_TIMEOUT_MS || '120000', 10),
      confirmations: parseInt(process.env.WAIT_FOR_CONFIRMATIONS || '1', 10),
    };
  }

  public getEnvironment(): 'test' | 'production' {
    return this.environment;
  }

  public isTestEnvironment(): boolean {
    return this.environment === 'test';
  }

  public isProductionEnvironment(): boolean {
    return this.environment === 'production';
  }
}

export const blockchainConfig = new BlockchainConfig();
