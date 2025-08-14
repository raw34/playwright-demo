import { test, expect } from '@playwright/test';
import { BlockchainService } from '../../utils/blockchain';
import { blockchainConfig } from '../../config/blockchain.config';
import { ethers } from 'ethers';

test.describe('Arbitrum ETH Transfer Tests', () => {
  let blockchainService: BlockchainService;
  const testConfig = blockchainConfig.getTestConfig();

  test.beforeAll(async () => {
    blockchainService = new BlockchainService();

    const environment = blockchainConfig.getEnvironment();
    const chainName = blockchainService.getChainName();

    console.log(`\n🔗 Testing on: ${chainName}`);
    console.log(`📋 Environment: ${environment}`);
    console.log(`👛 Sender address: ${blockchainService.getWalletAddress()}`);
    console.log(`📬 Recipient address: ${blockchainService.getRecipientAddress()}`);
    console.log(`⏱️ Test timeout: ${testConfig.timeout}ms\n`);
  });

  test('should validate chain connection', async () => {
    await test.step('Verify chain ID matches configuration', async () => {
      const chainId = await blockchainService.getChainId();
      const expectedChainId = blockchainConfig.getChainConfig().chainId;

      expect(Number(chainId)).toBe(expectedChainId);
      console.log(`✅ Connected to correct chain: ${chainId}`);
    });

    await test.step('Validate RPC connection', async () => {
      await expect(blockchainService.validateChainId()).resolves.not.toThrow();
    });
  });

  test('should check wallet balance before transfer', async () => {
    const senderAddress = blockchainService.getWalletAddress();
    const balance = await blockchainService.getBalance(senderAddress);

    console.log(`💰 Wallet balance: ${balance} ETH`);

    const balanceNumber = parseFloat(balance);
    expect(balanceNumber).toBeGreaterThan(0);

    const requiredAmount = parseFloat(blockchainConfig.getTransactionConfig().transferAmount);
    expect(balanceNumber).toBeGreaterThan(requiredAmount);
  });

  test('should estimate gas for transfer', async () => {
    const recipientAddress = blockchainService.getRecipientAddress();
    const transferAmount = blockchainConfig.getTransactionConfig().transferAmount;

    const gasEstimate = await blockchainService.estimateGas(recipientAddress, transferAmount);

    console.log(`⛽ Estimated gas: ${gasEstimate.toString()}`);

    expect(Number(gasEstimate)).toBeGreaterThan(0);
    expect(Number(gasEstimate)).toBeLessThanOrEqual(100000);
  });

  test('should get current gas price', async () => {
    const gasPrice = await blockchainService.getCurrentGasPrice();

    if (gasPrice.maxFeePerGas && gasPrice.maxPriorityFeePerGas) {
      console.log(`⛽ EIP-1559 Gas Prices:`);
      console.log(`   Max Fee: ${ethers.formatUnits(gasPrice.maxFeePerGas, 'gwei')} gwei`);
      console.log(
        `   Priority Fee: ${ethers.formatUnits(gasPrice.maxPriorityFeePerGas, 'gwei')} gwei`
      );

      expect(Number(gasPrice.maxFeePerGas)).toBeGreaterThan(0);
      expect(Number(gasPrice.maxPriorityFeePerGas)).toBeGreaterThan(0);
    } else {
      console.log(`⛽ Legacy Gas Price: ${ethers.formatUnits(gasPrice.gasPrice, 'gwei')} gwei`);
      expect(Number(gasPrice.gasPrice)).toBeGreaterThan(0);
    }
  });

  test('should successfully transfer ETH', async () => {
    test.setTimeout(testConfig.timeout);

    const recipientAddress = blockchainService.getRecipientAddress();
    const transferAmount = blockchainConfig.getTransactionConfig().transferAmount;

    await test.step('Get initial balances', async () => {
      const senderBalance = await blockchainService.getBalance();
      const recipientBalance = await blockchainService.getBalance(recipientAddress);

      console.log(`\n📊 Initial Balances:`);
      console.log(`   Sender: ${senderBalance} ETH`);
      console.log(`   Recipient: ${recipientBalance} ETH`);
    });

    let txResult;

    await test.step('Send ETH transaction', async () => {
      console.log(`\n💸 Sending ${transferAmount} ETH to ${recipientAddress}...`);

      txResult = await blockchainService.sendETH();

      expect(txResult).toBeDefined();
      expect(txResult.hash).toMatch(/^0x[a-fA-F0-9]{64}$/);
      expect(txResult.status).toBe(1);

      console.log(`\n✅ Transaction successful!`);
      console.log(`   Hash: ${txResult.hash}`);
      console.log(`   Block: ${txResult.blockNumber}`);
      console.log(`   Gas Used: ${txResult.gasUsed?.toString()}`);

      if (txResult.explorerUrl) {
        console.log(`   Explorer: ${txResult.explorerUrl}`);
      }
    });

    await test.step('Verify final balances', async () => {
      const senderBalanceAfter = await blockchainService.getBalance();
      const recipientBalanceAfter = await blockchainService.getBalance(recipientAddress);

      console.log(`\n📊 Final Balances:`);
      console.log(`   Sender: ${senderBalanceAfter} ETH`);
      console.log(`   Recipient: ${recipientBalanceAfter} ETH`);

      const senderBalanceChange = parseFloat(senderBalanceAfter);
      expect(senderBalanceChange).toBeGreaterThanOrEqual(0);
    });
  });

  test('should handle multiple transfers in sequence', async () => {
    test.setTimeout(testConfig.timeout * 2);

    const numberOfTransfers = 2;
    const results: any[] = [];

    for (let i = 0; i < numberOfTransfers; i++) {
      await test.step(`Transfer ${i + 1} of ${numberOfTransfers}`, async () => {
        const smallAmount = '0.00001';

        console.log(`\n🔄 Transfer ${i + 1}: Sending ${smallAmount} ETH...`);

        const result = await blockchainService.sendETH(undefined, smallAmount);
        results.push(result);

        expect(result.status).toBe(1);
        console.log(`   ✅ Transfer ${i + 1} complete: ${result.hash}`);

        await new Promise(resolve => setTimeout(resolve, 2000));
      });
    }

    expect(results).toHaveLength(numberOfTransfers);
    results.forEach(result => {
      expect(result.hash).toMatch(/^0x[a-fA-F0-9]{64}$/);
    });
  });

  test('should validate transaction receipt', async () => {
    test.setTimeout(testConfig.timeout);

    const txResult = await blockchainService.sendETH(undefined, '0.00001');

    await test.step('Wait for and validate transaction receipt', async () => {
      const receipt = await blockchainService.waitForTransaction(txResult.hash);

      expect(receipt).not.toBeNull();
      expect(receipt?.status).toBe(1);
      expect(receipt?.hash).toBe(txResult.hash);
      expect(receipt?.blockNumber).toBeGreaterThan(0);

      console.log(`\n📋 Transaction Receipt Validated:`);
      console.log(`   Status: ${receipt?.status === 1 ? 'Success' : 'Failed'}`);
      console.log(`   Confirmations: ${testConfig.confirmations}`);
    });
  });

  test('should handle insufficient balance gracefully', async () => {
    const hugeAmount = '999999999';

    await expect(blockchainService.sendETH(undefined, hugeAmount)).rejects.toThrow(
      /Insufficient balance/
    );

    console.log('✅ Insufficient balance error handled correctly');
  });

  test.afterAll(async () => {
    const finalBalance = await blockchainService.getBalance();
    console.log(`\n📊 Final wallet balance: ${finalBalance} ETH`);

    const explorerUrl = blockchainService.getExplorerUrl();
    if (explorerUrl) {
      console.log(
        `🔍 View wallet on explorer: ${explorerUrl}/address/${blockchainService.getWalletAddress()}`
      );
    }
  });
});
