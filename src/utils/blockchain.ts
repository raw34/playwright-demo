import { ethers } from 'ethers';
import { blockchainConfig, ChainConfig, TransactionConfig } from '../config/blockchain.config';

export interface TransactionResult {
  hash: string;
  from: string;
  to: string;
  value: string;
  gasUsed?: bigint;
  effectiveGasPrice?: bigint;
  status?: number;
  blockNumber?: number;
  explorerUrl?: string;
}

export class BlockchainService {
  private provider: ethers.JsonRpcProvider;
  private wallet: ethers.Wallet;
  private chainConfig: ChainConfig;
  private transactionConfig: TransactionConfig;

  constructor() {
    this.chainConfig = blockchainConfig.getChainConfig();
    this.transactionConfig = blockchainConfig.getTransactionConfig();

    this.provider = new ethers.JsonRpcProvider(this.chainConfig.rpcUrl);
    this.wallet = new ethers.Wallet(this.chainConfig.privateKey, this.provider);
  }

  async getBalance(address?: string): Promise<string> {
    const targetAddress = address || this.wallet.address;
    const balance = await this.provider.getBalance(targetAddress);
    return ethers.formatEther(balance);
  }

  async getChainId(): Promise<bigint> {
    const network = await this.provider.getNetwork();
    return network.chainId;
  }

  async validateChainId(): Promise<void> {
    const actualChainId = await this.getChainId();
    const expectedChainId = BigInt(this.chainConfig.chainId);

    if (actualChainId !== expectedChainId) {
      throw new Error(
        `Chain ID mismatch! Expected ${expectedChainId} (${this.chainConfig.name}), ` +
          `but connected to ${actualChainId}`
      );
    }
  }

  async estimateGas(to: string, value: string): Promise<bigint> {
    const tx = {
      to,
      value: ethers.parseEther(value),
    };

    try {
      const gasEstimate = await this.wallet.estimateGas(tx);
      return gasEstimate;
    } catch (error) {
      console.warn('Gas estimation failed, using default gas limit:', error);
      return BigInt(this.transactionConfig.gasLimit);
    }
  }

  async getCurrentGasPrice(): Promise<{
    gasPrice: bigint;
    maxFeePerGas?: bigint;
    maxPriorityFeePerGas?: bigint;
  }> {
    const feeData = await this.provider.getFeeData();

    if (feeData.maxFeePerGas && feeData.maxPriorityFeePerGas) {
      return {
        gasPrice: feeData.gasPrice || BigInt(0),
        maxFeePerGas: this.transactionConfig.maxFeePerGas || feeData.maxFeePerGas,
        maxPriorityFeePerGas:
          this.transactionConfig.maxPriorityFeePerGas || feeData.maxPriorityFeePerGas,
      };
    }

    return {
      gasPrice: feeData.gasPrice || BigInt(20000000000),
    };
  }

  async sendETH(
    to?: string,
    amount?: string,
    waitForConfirmations?: number
  ): Promise<TransactionResult> {
    const recipientAddress = to || this.chainConfig.recipientAddress;
    const transferAmount = amount || this.transactionConfig.transferAmount;
    const confirmations = waitForConfirmations ?? blockchainConfig.getTestConfig().confirmations;

    await this.validateChainId();

    const balanceBefore = await this.getBalance();
    console.log(`Sender balance before: ${balanceBefore} ETH`);

    if (parseFloat(balanceBefore) < parseFloat(transferAmount)) {
      throw new Error(
        `Insufficient balance! Have ${balanceBefore} ETH, ` +
          `need at least ${transferAmount} ETH plus gas`
      );
    }

    const gasPrice = await this.getCurrentGasPrice();
    const gasLimit = await this.estimateGas(recipientAddress, transferAmount);

    const tx: ethers.TransactionRequest = {
      to: recipientAddress,
      value: ethers.parseEther(transferAmount),
      gasLimit,
    };

    if (gasPrice.maxFeePerGas && gasPrice.maxPriorityFeePerGas) {
      tx.maxFeePerGas = gasPrice.maxFeePerGas;
      tx.maxPriorityFeePerGas = gasPrice.maxPriorityFeePerGas;
      tx.type = 2;
    } else {
      tx.gasPrice = gasPrice.gasPrice;
    }

    console.log('Sending transaction with params:', {
      to: recipientAddress,
      value: `${transferAmount} ETH`,
      gasLimit: gasLimit.toString(),
      ...gasPrice,
    });

    const txResponse = await this.wallet.sendTransaction(tx);
    console.log(`Transaction sent! Hash: ${txResponse.hash}`);

    const receipt = await txResponse.wait(confirmations);

    if (!receipt) {
      throw new Error('Transaction receipt is null');
    }

    const result: TransactionResult = {
      hash: receipt.hash,
      from: receipt.from,
      to: receipt.to || recipientAddress,
      value: transferAmount,
      gasUsed: receipt.gasUsed,
      effectiveGasPrice: receipt.gasPrice,
      status: receipt.status ?? undefined,
      blockNumber: receipt.blockNumber,
    };

    if (this.chainConfig.explorer) {
      result.explorerUrl = `${this.chainConfig.explorer}/tx/${receipt.hash}`;
    }

    console.log(`Transaction confirmed in block ${receipt.blockNumber}`);
    console.log(`Gas used: ${ethers.formatUnits(receipt.gasUsed, 'gwei')} gwei`);

    if (result.explorerUrl) {
      console.log(`View on explorer: ${result.explorerUrl}`);
    }

    return result;
  }

  async waitForTransaction(
    txHash: string,
    confirmations?: number
  ): Promise<ethers.TransactionReceipt | null> {
    const waitConfirmations = confirmations ?? blockchainConfig.getTestConfig().confirmations;
    return await this.provider.waitForTransaction(txHash, waitConfirmations);
  }

  getWalletAddress(): string {
    return this.wallet.address;
  }

  getRecipientAddress(): string {
    return this.chainConfig.recipientAddress;
  }

  getChainName(): string {
    return this.chainConfig.name;
  }

  getExplorerUrl(): string | undefined {
    return this.chainConfig.explorer;
  }
}
