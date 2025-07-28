import axios from 'axios';
import config from '../config';
import { logger } from './loggerService';
import { Network } from './blockchainService';
import * as transactionUtils from '../utils/transactionUtils';

/**
 * Service to verify transactions across multiple blockchains
 * This service handles all verification directly in the backend without relying on blockchain verifier contracts
 */
class TransactionVerificationService {
  // Cache of verified transactions to prevent double verification
  private verifiedTransactions: Map<string, boolean> = new Map();
  
  // Explorer API URLs
  private ethereumExplorerAPI: string = 'https://eth-sepolia.g.alchemy.com/v2/bIOWs_1tByFaHx9ig0tNJM9GTdieQP35';
  private bscExplorerAPI: string = 'https://api-testnet.bscscan.com/api';
  private solanaExplorerAPI: string = 'https://api.testnet.solana.com';
  
  // API keys - these should be in your .env file
  private ethereumApiKey: string = process.env.ETHERSCAN_API_KEY || 'IGTXZ7A1HFGBXZBZJBU3EP4V88SKN8J3P1'; // Updated with key from script.js
  private bscApiKey: string = process.env.BSCSCAN_API_KEY || '';
  
  // Transaction timeout (in milliseconds) - 30 minutes
  private transactionTimeout: number = 30 * 60 * 1000;

  constructor() {
    try {
      logger.info('Transaction Verification Service initialized with explorer API integration');
    } catch (error) {
      logger.error('Failed to initialize Transaction Verification Service', error);
      throw new Error('Failed to initialize Transaction Verification Service');
    }
  }
  
  /**
   * Verify a transaction across any supported blockchain
   * @param txHash Transaction hash
   * @param amount Expected amount of the transaction
   * @param network Network enum value (0 = ETH, 1 = BSC, 2 = SOL)
   * @returns Boolean indicating verification success
   */
  async verifyTransaction(txHash: string, amount: string, network: Network): Promise<boolean> {
    // Check if transaction was already verified
    if (this.verifiedTransactions.has(txHash)) {
      logger.info(`Transaction ${txHash} was already verified: ${this.verifiedTransactions.get(txHash)}`);
      return !!this.verifiedTransactions.get(txHash);
    }
    
    try {
      let isValid: boolean = false;
      let transactionDetails: any = null;
      
      // Check if hash format is valid for the network
      if (!this.isValidTransactionHash(txHash, network)) {
        logger.warn(`Invalid transaction hash format for ${this.getNetworkName(network)}: ${txHash}`);
        this.verifiedTransactions.set(txHash, false);
        return false;
      }
      
      // Check for skip verification mode in environment variables
      if (process.env.SKIP_BLOCKCHAIN_VERIFICATION === 'true') {
        logger.info(`SKIP_BLOCKCHAIN_VERIFICATION is enabled, considering ${txHash} as valid`);
        this.verifiedTransactions.set(txHash, true);
        return true;
      }
      
      // Verify based on network
      switch (network) {
        case Network.ETHEREUM:
          transactionDetails = await this.verifyEthereumTransaction(txHash);
          isValid = !!transactionDetails?.success;
          break;
        case Network.BSC:
          transactionDetails = await this.verifyBscTransaction(txHash);
          isValid = !!transactionDetails?.success;
          break;
        case Network.SOLANA:
          transactionDetails = await this.verifySolanaTransaction(txHash);
          isValid = !!transactionDetails?.success;
          break;
        default:
          logger.error(`Unsupported network: ${network}`);
          isValid = false;
      }
      
      // Additional validation for amount if available in transaction details
      if (isValid && transactionDetails?.value && amount) {
        // Convert both to same format for comparison (handle cases with different decimals)
        const expectedAmount = parseFloat(amount);
        const txAmount = transactionDetails.value;
        
        // Allow small difference due to gas fees or precision issues (2% tolerance)
        const tolerance = 0.02;
        const difference = Math.abs(expectedAmount - txAmount) / expectedAmount;
        
        if (difference > tolerance) {
          logger.warn(
            `Transaction ${txHash} amount mismatch: expected ${expectedAmount}, got ${txAmount} (${difference * 100}% difference)`
          );
          isValid = false;
        }
      }
      
      // Cache verification result
      this.verifiedTransactions.set(txHash, isValid);
      
      if (isValid) {
        logger.info(`Successfully verified ${this.getNetworkName(network)} transaction ${txHash}`);
      } else {
        logger.warn(`Verification failed for ${this.getNetworkName(network)} transaction ${txHash}`);
      }
      
      return isValid;
    } catch (error) {
      logger.error(`Failed to verify transaction ${txHash}`, error);
      // Cache as failed verification
      this.verifiedTransactions.set(txHash, false);
      return false;
    }
  }
  
  /**
   * Verify Ethereum transaction by checking Etherscan API
   * @param txHash Transaction hash
   * @returns Object with transaction details and success status
   */
  private async verifyEthereumTransaction(txHash: string): Promise<any> {
    try {
      // For Alchemy API, we should use JSON-RPC format
      const alchemyUrl = config.ethereum.networks.ethereum.rpcUrl;
      
      logger.info(`Checking transaction ${txHash} on Ethereum Sepolia using Alchemy...`);
      
      // First check if the transaction exists using JSON-RPC
      const txResponse = await axios.post(alchemyUrl, {
        jsonrpc: '2.0',
        id: 1,
        method: 'eth_getTransactionByHash',
        params: [txHash]
      });
      
      // If no transaction found
      if (txResponse.data.error || !txResponse.data.result) {
        logger.warn(`Transaction ${txHash} not found on Ethereum Sepolia`);
        return { success: false };
      }
      
      logger.info(`Transaction found on Ethereum Sepolia: ${JSON.stringify(txResponse.data.result)}`);
      
      // Get transaction receipt to check status
      const receiptResponse = await axios.post(alchemyUrl, {
        jsonrpc: '2.0',
        id: 2,
        method: 'eth_getTransactionReceipt',
        params: [txHash]
      });
      
      // If no receipt, transaction might not be mined yet
      if (!receiptResponse.data.result) {
        logger.warn(`Receipt for transaction ${txHash} not found - transaction may not be mined yet`);
        return { success: false };
      }
      
      const receipt = receiptResponse.data.result;
      logger.info(`Transaction receipt status: ${receipt.status}, block: ${receipt.blockNumber}, gas used: ${receipt.gasUsed}`);
      
      // Check if transaction was successful (status 0x1 = success, 0x0 = failure)
      if (receipt.status !== '0x1') {
        logger.warn(`Transaction ${txHash} failed on Ethereum Sepolia with status ${receipt.status}`);
        
        // Try getting more info about the transaction
        try {
          // Use etherscan API if we have a key
          if (this.ethereumApiKey) {
            const txInfoUrl = `https://api-sepolia.etherscan.io/api?module=transaction&action=gettxreceiptstatus&txhash=${txHash}&apikey=${this.ethereumApiKey}`;
            const txInfoResponse = await axios.get(txInfoUrl);
            logger.info(`Etherscan transaction status details: ${JSON.stringify(txInfoResponse.data)}`);
          }
        } catch (err) {
          logger.error('Error getting additional transaction details', err);
        }
        
        // In development mode, we can treat failed transactions as valid for testing
        if (process.env.NODE_ENV === 'development') {
          logger.warn(`In development mode: Treating ${txHash} as valid despite failed status`);
          
          // Decode transaction data for reference
          const decodedTx = transactionUtils.decodeTransaction(txResponse.data);
          
          return { 
            success: true, 
            status: 'development_override',
            value: transactionUtils.hexToEther(txResponse.data.result.value),
            decodedTransaction: decodedTx
          };
        }
        
        return { success: false };
      }
      
      // Get block timestamp info for the transaction
      let timestamp = null;
      try {
        if (receipt.blockNumber) {
          const blockUrl = transactionUtils.getBlockTimestampUrl(receipt.blockNumber, 'ethereum', this.ethereumApiKey);
          const blockResponse = await axios.get(blockUrl);
          timestamp = transactionUtils.parseBlockTimestamp(blockResponse.data);
        }
      } catch (error) {
        logger.warn(`Error getting block timestamp for ${txHash}`, error);
      }
      
      // Decode the transaction for detailed information
      const decodedTx = transactionUtils.decodeTransaction(txResponse.data);
      
      logger.info(`Transaction ${txHash} verified successfully on Ethereum Sepolia`);
      
      return {
        success: true,
        hash: txHash,
        blockNumber: decodedTx.blockNumber,
        timestamp: timestamp?.unix || null,
        from: decodedTx.from,
        to: decodedTx.to,
        value: decodedTx.valueInEth,
        gasLimit: decodedTx.gasLimit,
        gasPrice: decodedTx.gasPriceGwei,
        network: 'Ethereum Sepolia',
        decodedTransaction: decodedTx
      };
    } catch (error) {
      logger.error(`Error verifying Ethereum transaction ${txHash}:`, error);
      
      // For development/testing, if there's an API error, still allow verification
      if (process.env.NODE_ENV === 'development') {
        logger.warn(`In development mode: Treating ${txHash} as valid despite API error`);
        return { success: true, status: 'development_override' };
      }
      
      return { success: false };
    }
  }
  
  /**
   * Verify BSC transaction by checking BSCScan API
   * @param txHash Transaction hash
   * @returns Object with transaction details and success status
   */
  private async verifyBscTransaction(txHash: string): Promise<any> {
    try {
      // Use JSON-RPC format for BSC node
      const bscUrl = config.ethereum.networks.bsc.rpcUrl;
      
      logger.info(`Checking transaction ${txHash} on BSC Testnet...`);
      
      // First check if the transaction exists
      const txResponse = await axios.post(bscUrl, {
        jsonrpc: '2.0',
        id: 1,
        method: 'eth_getTransactionByHash',
        params: [txHash]
      });
      
      // If no transaction found
      if (txResponse.data.error || !txResponse.data.result) {
        logger.warn(`Transaction ${txHash} not found on BSC Testnet`);
        return { success: false };
      }
      
      logger.info(`Transaction found on BSC Testnet: ${JSON.stringify(txResponse.data.result)}`);
      
      // Get transaction receipt to check status
      const receiptResponse = await axios.post(bscUrl, {
        jsonrpc: '2.0',
        id: 2,
        method: 'eth_getTransactionReceipt',
        params: [txHash]
      });
      
      // If no receipt, transaction might not be mined yet
      if (!receiptResponse.data.result) {
        logger.warn(`Receipt for transaction ${txHash} not found - transaction may not be mined yet`);
        return { success: false };
      }
      
      const receipt = receiptResponse.data.result;
      logger.info(`Transaction receipt status: ${receipt.status}, block: ${receipt.blockNumber}, gas used: ${receipt.gasUsed}`);
      
      // Check if transaction was successful
      if (receipt.status !== '0x1') {
        logger.warn(`Transaction ${txHash} failed on BSC Testnet with status ${receipt.status}`);
        
        // Try getting additional details from BSCScan if API key is available
        try {
          if (this.bscApiKey) {
            const txInfoUrl = `https://api-testnet.bscscan.com/api?module=transaction&action=gettxreceiptstatus&txhash=${txHash}&apikey=${this.bscApiKey}`;
            const txInfoResponse = await axios.get(txInfoUrl);
            logger.info(`BSCScan transaction status details: ${JSON.stringify(txInfoResponse.data)}`);
          }
        } catch (err) {
          logger.warn('Error getting additional BSC transaction details', err);
        }
        
        // In development mode, we can treat failed transactions as valid for testing
        if (process.env.NODE_ENV === 'development') {
          logger.warn(`In development mode: Treating ${txHash} as valid despite failed status`);
          
          // Use transaction utils to decode the transaction
          const decodedTx = transactionUtils.decodeTransaction(txResponse.data);
          
          return { 
            success: true, 
            status: 'development_override',
            value: transactionUtils.hexToEther(txResponse.data.result.value),
            decodedTransaction: decodedTx
          };
        }
        
        return { success: false };
      }
      
      // Get block timestamp info for the transaction
      let timestamp = null;
      try {
        if (receipt.blockNumber) {
          const blockUrl = transactionUtils.getBlockTimestampUrl(receipt.blockNumber, 'bsc', this.bscApiKey);
          const blockResponse = await axios.get(blockUrl);
          timestamp = transactionUtils.parseBlockTimestamp(blockResponse.data);
        }
      } catch (error) {
        logger.warn(`Error getting block timestamp for BSC tx ${txHash}`, error);
      }
      
      // Decode the transaction for detailed information
      const decodedTx = transactionUtils.decodeTransaction(txResponse.data);
      
      logger.info(`Transaction ${txHash} verified successfully on BSC Testnet`);
      
      return {
        success: true,
        hash: txHash,
        blockNumber: decodedTx.blockNumber,
        timestamp: timestamp?.unix || null,
        from: decodedTx.from,
        to: decodedTx.to,
        value: decodedTx.valueInEth, // BNB value
        gasLimit: decodedTx.gasLimit,
        gasPrice: decodedTx.gasPriceGwei,
        network: 'BSC Testnet',
        chainId: txResponse.data.result.chainId,
        decodedTransaction: decodedTx
      };
    } catch (error) {
      logger.error(`Error verifying BSC transaction ${txHash}:`, error);
      
      // For development/testing
      if (process.env.NODE_ENV === 'development') {
        logger.warn(`In development mode: Treating ${txHash} as valid despite API error`);
        return { success: true, status: 'development_override' };
      }
      
      return { success: false };
    }
  }
  
  /**
   * Verify Solana transaction by checking Solana API
   * @param txHash Transaction hash
   * @returns Object with transaction details and success status
   */
  private async verifySolanaTransaction(txHash: string): Promise<any> {
    try {
      // Get Solana transaction verification data
      const solanaData = transactionUtils.getSolanaTransactionVerificationData(txHash, true); // true = devnet/testnet
      
      // Query Solana transaction info
      const response = await axios.post(solanaData.url, solanaData.payload);
      
      // Check if transaction exists
      if (!response.data.result) {
        logger.warn(`Transaction ${txHash} not found on Solana Testnet`);
        return { success: false };
      }
      
      const txData = response.data.result;
      
      // Check if transaction was successful (no error)
      if (txData.meta && txData.meta.err) {
        logger.warn(`Transaction ${txHash} exists but failed on Solana Testnet: ${JSON.stringify(txData.meta.err)}`);
        
        // In development mode, we can treat failed transactions as valid for testing
        if (process.env.NODE_ENV === 'development') {
          logger.warn(`In development mode: Treating ${txHash} as valid despite failed status`);
          
          // Extract value changes (simplified)
          let value = 0;
          if (txData.meta.preBalances && txData.meta.postBalances && txData.meta.preBalances.length > 0) {
            // Estimate the main value transfer by looking at the balance changes
            const preBalance = txData.meta.preBalances[0];
            const postBalance = txData.meta.postBalances[0];
            value = Math.abs(postBalance - preBalance) / 1e9; // Convert lamports to SOL
          }
          
          return { 
            success: true, 
            status: 'development_override',
            value: value,
            solanaTransaction: txData
          };
        }
        
        return { success: false, error: txData.meta.err };
      }
      
      // Calculate SOL transfers from balance changes
      let valueTransfer = 0;
      const balanceChanges = [];
      
      if (txData.meta.preBalances && txData.meta.postBalances) {
        for (let i = 0; i < txData.meta.preBalances.length; i++) {
          const preBalance = txData.meta.preBalances[i];
          const postBalance = txData.meta.postBalances[i];
          const change = (postBalance - preBalance) / 1e9; // Convert lamports to SOL
          
          if (change !== 0) {
            balanceChanges.push({
              account: txData.transaction.message.accountKeys[i],
              change: change
            });
            
            // Track the largest value transfer
            if (Math.abs(change) > Math.abs(valueTransfer)) {
              valueTransfer = change;
            }
          }
        }
      }
      
      logger.info(`Transaction ${txHash} verified on Solana Testnet with ${balanceChanges.length} balance changes`);
      
      return {
        success: true,
        hash: txHash,
        slot: txData.slot,
        blockTime: txData.blockTime || null,
        timestamp: txData.blockTime || null,
        value: Math.abs(valueTransfer), // Absolute value of the transfer
        fee: txData.meta.fee ? txData.meta.fee / 1e9 : null,
        balanceChanges: balanceChanges,
        network: 'Solana Testnet',
        solanaTransaction: txData
      };
    } catch (error) {
      logger.error(`Error verifying Solana transaction ${txHash}:`, error);
      
      // For development/testing
      if (process.env.NODE_ENV === 'development') {
        logger.warn(`In development mode: Treating ${txHash} as valid despite API error`);
        return { success: true, status: 'development_override' };
      }
      
      return { success: false };
    }
  }
  
  /**
   * Check if the transaction hash format is valid for the given network
   * @param txHash Transaction hash
   * @param network Network enum value
   * @returns Boolean indicating if the format is valid
   */
  isValidTransactionHash(txHash: string, network: Network): boolean {
    // In development mode, be more permissive with hash formats
    if (process.env.NODE_ENV === 'development') {
      return !!txHash && txHash.length > 10;
    }
    
    // Check for null/empty hash
    if (!txHash) return false;
    
    switch (network) {
      case Network.ETHEREUM:
      case Network.BSC:
        // ETH and BSC: 0x followed by 64 hex characters
        return /^0x[0-9a-fA-F]{64}$/.test(txHash);
      case Network.SOLANA:
        // Solana: Base58 encoded string (alphanumeric, typically 43-44 chars)
        return /^[1-9A-HJ-NP-Za-km-z]{43,44}$/.test(txHash);
      default:
        return false;
    }
  }
  
  /**
   * Check if a transaction has been verified
   * @param txHash Transaction hash to check
   * @returns Whether the transaction has been verified
   */
  isTransactionVerified(txHash: string): boolean {
    return this.verifiedTransactions.has(txHash) && !!this.verifiedTransactions.get(txHash);
  }
  
  /**
   * For testing/debugging: Force a transaction to be considered verified
   * @param txHash Transaction hash
   * @param status Verification status
   */
  setTransactionVerificationStatus(txHash: string, status: boolean): void {
    this.verifiedTransactions.set(txHash, status);
    logger.info(`Manually set transaction ${txHash} verification status to ${status}`);
  }
  
  /**
   * Get the network name from the network enum value
   * @param networkId Network enum value
   * @returns Network name as string
   */
  getNetworkName(networkId: Network): string {
    switch (networkId) {
      case Network.ETHEREUM:
        return 'Ethereum';
      case Network.BSC:
        return 'Binance Smart Chain';
      case Network.SOLANA:
        return 'Solana';
      default:
        return 'Unknown Network';
    }
  }
  
  /**
   * Get explorer URL for a transaction
   * @param txHash Transaction hash
   * @param network Network enum value
   * @returns Explorer URL string
   */
  getExplorerUrl(txHash: string, network: Network): string {
    switch (network) {
      case Network.ETHEREUM:
        return `https://sepolia.etherscan.io/tx/${txHash}`;
      case Network.BSC:
        return `https://testnet.bscscan.com/tx/${txHash}`;
      case Network.SOLANA:
        return `https://explorer.solana.com/tx/${txHash}?cluster=testnet`;
      default:
        return '';
    }
  }

  /**
   * Get detailed information about a transaction without affecting verification status
   * @param txHash Transaction hash to check
   * @param network Network enum value (0 = ETH, 1 = BSC, 2 = SOL)
   * @returns Transaction details if available
   */
  async getTransactionDetails(txHash: string, network: Network): Promise<any> {
    try {
      // Check if hash format is valid for the network
      if (!this.isValidTransactionHash(txHash, network)) {
        logger.warn(`Invalid transaction hash format for ${this.getNetworkName(network)}: ${txHash}`);
        return { success: false, message: 'Invalid transaction hash format' };
      }
      
      // Get details based on network
      let details;
      switch (network) {
        case Network.ETHEREUM:
          details = await this.verifyEthereumTransaction(txHash);
          break;
        case Network.BSC:
          details = await this.verifyBscTransaction(txHash);
          break;
        case Network.SOLANA:
          details = await this.verifySolanaTransaction(txHash);
          break;
        default:
          logger.error(`Unsupported network: ${network}`);
          return { success: false, message: 'Unsupported network' };
      }
      
      // Add explorer URL
      if (details) {
        details.explorerUrl = this.getExplorerUrl(txHash, network);
      }
      
      return details;
    } catch (error) {
      logger.error(`Failed to get transaction details for ${txHash}`, error);
      return { 
        success: false, 
        message: 'Error retrieving transaction details',
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }
}

export const transactionVerificationService = new TransactionVerificationService(); 