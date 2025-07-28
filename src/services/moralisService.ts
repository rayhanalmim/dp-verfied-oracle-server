import Moralis from 'moralis';
import { logger } from './loggerService';

/**
 * Service to interact with Moralis APIs for blockchain data
 */
class MoralisService {
  private initialized = false;
  private apiKey: string;

  constructor() {
    this.apiKey = process.env.MORALIS_API_KEY || '';
    
    if (!this.apiKey) {
      logger.warn('MORALIS_API_KEY not provided in environment variables');
      console.warn('MORALIS_API_KEY not provided in environment variables - Moralis API calls will fail');
    } else {
      console.log('Moralis service initialized with API key');
    }
  }

  /**
   * Initialize Moralis API connection
   */
  async initialize(): Promise<void> {
    if (this.initialized) return;

    try {
      if (!this.apiKey) {
        console.error('MORALIS_API_KEY is required but not provided');
        throw new Error('MORALIS_API_KEY is required');
      }

      await Moralis.start({
        apiKey: this.apiKey
      });

      this.initialized = true;
      logger.info('Moralis API initialized successfully');
      console.log('Moralis API initialized successfully');
    } catch (error) {
      logger.error('Failed to initialize Moralis API', error);
      console.error('Failed to initialize Moralis API:', error);
      throw new Error('Failed to initialize Moralis API');
    }
  }

  /**
   * Get transaction details by transaction hash
   * @param txHash Transaction hash
   * @param chainId Chain ID in hex format (0x1 = ETH, 0x38 = BSC, 0x89 = Polygon)
   * @returns Transaction details
   */
  async getTransactionByHash(txHash: string, chainId: string): Promise<any> {
    try {
      // Initialize if not already initialized
      await this.initialize();

      console.log(`Fetching transaction ${txHash} on chain ${chainId}...`);
      
      const response = await Moralis.EvmApi.transaction.getTransaction({
        chain: chainId,
        transactionHash: txHash
      });

      if (!response || !response.raw) {
        console.warn(`No data returned for transaction ${txHash}`);
        return {
          success: false,
          error: 'No transaction data returned from Moralis'
        };
      }

      console.log(`Successfully fetched transaction ${txHash}`);
      return {
        success: true,
        data: response.raw
      };
    } catch (error) {
      logger.error(`Failed to get transaction ${txHash} on chain ${chainId}`, error);
      console.error(`Failed to get transaction ${txHash} on chain ${chainId}:`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Get transaction details with verbose info by transaction hash
   * @param txHash Transaction hash
   * @param chainId Chain ID in hex format (0x1 = ETH, 0x38 = BSC, 0x89 = Polygon)
   * @returns Detailed transaction information
   */
  async getTransactionVerbose(txHash: string, chainId: string): Promise<any> {
    try {
      // Initialize if not already initialized
      await this.initialize();

      const response = await Moralis.EvmApi.transaction.getTransactionVerbose({
        chain: chainId,
        transactionHash: txHash
      });

      return {
        success: true,
        data: response
      };
    } catch (error) {
      logger.error(`Failed to get verbose transaction ${txHash} on chain ${chainId}`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Get all transactions for a wallet address
   * @param address Wallet address
   * @param chainId Chain ID in hex format (0x1 = ETH, 0x38 = BSC, 0x89 = Polygon)
   * @param limit Maximum number of transactions to return
   * @returns List of transactions
   */
  async getWalletTransactions(address: string, chainId: string, limit: number = 10): Promise<any> {
    try {
      // Initialize if not already initialized
      await this.initialize();

      const response = await Moralis.EvmApi.transaction.getWalletTransactionsVerbose({
        chain: chainId,
        address: address,
        limit: limit,
        order: 'DESC'
      });

      return {
        success: true,
        data: response.raw
      };
    } catch (error) {
      logger.error(`Failed to get transactions for wallet ${address} on chain ${chainId}`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Get chain ID for a specific network
   * @param network Network number (0 = ETH, 1 = BSC, 2 = Solana)
   * @returns Chain ID in hex format
   */
  getChainId(network: number): string {
    switch (network) {
      case 0: // ETH
        return '0x1'; // Mainnet
      case 1: // BSC
        return '0x38'; // BSC Mainnet
      case 2: // Solana - not supported by Moralis EVM API
        throw new Error('Solana is not supported by Moralis EVM API');
      default:
        throw new Error('Unsupported network');
    }
  }

  /**
   * Get chain ID for a testnet network
   * @param network Network number (0 = ETH, 1 = BSC)
   * @returns Chain ID in hex format for testnet
   */
  getTestnetChainId(network: number): string {
    switch (network) {
      case 0: // ETH
        return '0xaa36a7'; // Sepolia
      case 1: // BSC
        return '0x61'; // BSC Testnet
      case 2: // Solana - not supported by Moralis EVM API
        throw new Error('Solana is not supported by Moralis EVM API');
      default:
        throw new Error('Unsupported network');
    }
  }
}

export const moralisService = new MoralisService(); 