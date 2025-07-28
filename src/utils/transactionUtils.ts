 /**
 * Utility functions for processing blockchain transactions
 * Extracted and adapted from script.js
 */

/**
 * Convert hex value to decimal
 * @param hex Hex string (with or without 0x prefix)
 * @returns Decimal number
 */
export function hexToDecimal(hex: string): number {
    return parseInt(hex, 16);
  }
  
  /**
   * Convert hex value to Ether (or any EVM compatible coin)
   * @param hex Hex string of wei amount
   * @returns Amount in Ether
   */
  export function hexToEther(hex: string): number {
    const wei = BigInt(hex);
    return Number(wei) / Math.pow(10, 18);
  }
  
  /**
   * Convert hex value to Gwei
   * @param hex Hex string of wei amount
   * @returns Amount in Gwei
   */
  export function hexToGwei(hex: string): number {
    const wei = BigInt(hex);
    return Number(wei) / Math.pow(10, 9);
  }
  
  /**
   * Get blockchain network name from chain ID
   * @param chainId Chain ID in hex format
   * @returns Network name
   */
  export function getChainName(chainId: string): string {
    const chains: Record<string, string> = {
      '0x1': 'Ethereum Mainnet',
      '0xaa36a7': 'Sepolia Testnet',
      '0x5': 'Goerli Testnet',
      '0x89': 'Polygon',
      '0xa4b1': 'Arbitrum One',
      '0x38': 'BNB Smart Chain',
      '0x61': 'BNB Smart Chain Testnet'
    };
    return chains[chainId] || `Unknown Chain (${chainId})`;
  }
  
  /**
   * Get transaction type from type identifier
   * @param type Transaction type in hex format
   * @returns Transaction type description
   */
  export function getTransactionType(type: string): string {
    const types: Record<string, string> = {
      '0x0': 'Legacy Transaction',
      '0x1': 'EIP-2930 (Access List)',
      '0x2': 'EIP-1559 (Dynamic Fee)'
    };
    return types[type] || `Unknown Type (${type})`;
  }
  
  /**
   * Process and decode an Ethereum transaction
   * @param data Transaction data from blockchain API
   * @returns Decoded transaction object with key details
   */
  export function decodeTransaction(data: any): any {
    const tx = data.result;
  
    return {
      blockNumber: hexToDecimal(tx.blockNumber),
      transactionIndex: hexToDecimal(tx.transactionIndex),
      chainId: tx.chainId ? hexToDecimal(tx.chainId) : null,
      chainName: tx.chainId ? getChainName(tx.chainId) : 'Unknown',
      transactionType: getTransactionType(tx.type),
      from: tx.from,
      to: tx.to,
      valueInEth: hexToEther(tx.value),
      valueInWei: hexToDecimal(tx.value),
      nonce: hexToDecimal(tx.nonce),
      gasLimit: hexToDecimal(tx.gas),
      gasPriceGwei: tx.gasPrice ? hexToGwei(tx.gasPrice) : null,
      gasPriceWei: tx.gasPrice ? hexToDecimal(tx.gasPrice) : null,
      maxFeePerGasGwei: tx.maxFeePerGas ? hexToGwei(tx.maxFeePerGas) : null,
      maxPriorityFeePerGasGwei: tx.maxPriorityFeePerGas ? hexToGwei(tx.maxPriorityFeePerGas) : null,
      estimatedMaxFeeEth: tx.gas && tx.gasPrice ? (hexToDecimal(tx.gas) * hexToDecimal(tx.gasPrice)) / Math.pow(10, 18) : null,
      isSimpleTransfer: tx.input === "0x",
      signature: {
        v: tx.v ? hexToDecimal(tx.v) : null,
        r: tx.r || null,
        s: tx.s || null,
        yParity: tx.yParity ? hexToDecimal(tx.yParity) : null
      }
    };
  }
  
  /**
   * Generate an Ethereum transaction URL for a specific network
   * @param txHash Transaction hash
   * @param networkType 'mainnet' or 'testnet'
   * @param apiKey Optional API key
   * @returns URL for retrieving transaction data
   */
  export function getEthereumTransactionUrl(txHash: string, networkType: 'mainnet' | 'sepolia' | 'goerli' = 'sepolia', apiKey?: string): string {
    const baseUrls = {
      mainnet: 'https://api.etherscan.io/api',
      sepolia: 'https://api-sepolia.etherscan.io/api',
      goerli: 'https://api-goerli.etherscan.io/api'
    };
    
    const baseUrl = baseUrls[networkType];
    return `${baseUrl}?module=proxy&action=eth_getTransactionByHash&txhash=${txHash}${apiKey ? `&apikey=${apiKey}` : ''}`;
  }
  
  /**
   * Generate a BNB transaction URL for a specific network
   * @param txHash Transaction hash
   * @param isTestnet Whether to use testnet
   * @param apiKey Optional API key
   * @returns URL for retrieving transaction data
   */
  export function getBNBTransactionUrl(txHash: string, isTestnet: boolean = false, apiKey?: string): string {
    const baseUrl = isTestnet
      ? 'https://api-testnet.bscscan.com/api'
      : 'https://api.bscscan.com/api';
    
    return `${baseUrl}?module=proxy&action=eth_getTransactionByHash&txhash=${txHash}${apiKey ? `&apikey=${apiKey}` : ''}`;
  }
  
  /**
   * Get Solana transaction verification URL
   * @param txHash Transaction signature
   * @param isDevnet Whether to use devnet
   * @returns RPC URL and payload for fetching transaction
   */
  export function getSolanaTransactionVerificationData(txHash: string, isDevnet: boolean = false): { url: string; payload: any } {
    const rpcUrl = isDevnet
      ? 'https://api.devnet.solana.com'
      : 'https://api.mainnet-beta.solana.com';
    
    const payload = {
      jsonrpc: '2.0',
      id: 1,
      method: 'getTransaction',
      params: [
        txHash,
        { encoding: 'json', maxSupportedTransactionVersion: 0 }
      ]
    };
    
    return { url: rpcUrl, payload };
  }
  
  /**
   * Get block timestamp for a transaction
   * @param blockNumber Block number in hex format
   * @param network Network type (ethereum, bsc, solana)
   * @param apiKey Optional API key
   * @returns Function to fetch the timestamp
   */
  export function getBlockTimestampUrl(blockNumber: string, network: string, apiKey?: string): string {
    switch(network.toLowerCase()) {
      case 'ethereum':
      case 'sepolia':
        return `https://api-sepolia.etherscan.io/api?module=proxy&action=eth_getBlockByNumber&tag=${blockNumber}&boolean=true${apiKey ? `&apikey=${apiKey}` : ''}`;
      case 'bsc':
        return `https://api-testnet.bscscan.com/api?module=proxy&action=eth_getBlockByNumber&tag=${blockNumber}&boolean=true${apiKey ? `&apikey=${apiKey}` : ''}`;
      default:
        return ''; // For Solana, this isn't used the same way
    }
  }
  
  /**
   * Parse a block timestamp from response data
   * @param data Block data from API response
   * @returns Timestamp information object
   */
  export function parseBlockTimestamp(data: any): any {
    if (data.result && data.result.timestamp) {
      const timestamp = parseInt(data.result.timestamp, 16);
      const date = new Date(timestamp * 1000);
      
      return {
        unix: timestamp,
        iso: date.toISOString(),
        local: date.toLocaleString(),
        daysAgo: Math.floor((Date.now() - date.getTime()) / (1000 * 60 * 60 * 24))
      };
    }
    return null;
  }