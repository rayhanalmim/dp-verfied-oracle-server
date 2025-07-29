import Moralis from 'moralis';
import { logger } from './loggerService';
import { Connection, PublicKey } from '@solana/web3.js';
import base64 from 'base64-js';
import { DateTime } from 'luxon';
import { TonClient, Address } from 'ton';
import { getHttpEndpoint } from '@orbs-network/ton-access';

import { ethers } from 'ethers';

const ERC20_TRANSFER_TOPIC = '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef';

const solanaConnection = new Connection('https://api.mainnet-beta.solana.com');
const tonClient = new TonClient({
  endpoint: 'https://toncenter.com/api/v2/json-rpc'
});

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
      await this.initialize();

      console.log(`Fetching transaction ${txHash} on chain ${chainId}...`);

      if (chainId === 'solana') {
        const response = await solanaConnection.getTransaction(txHash, {
          maxSupportedTransactionVersion: 0,
          commitment: 'confirmed'
        });

        const formattedResponse = convertSolanaToEthFormat(response);
        return formattedResponse;
      }

      const response = await Moralis.EvmApi.transaction.getTransaction({
        chain: chainId,
        transactionHash: txHash
      });

      if (!response || !response.raw) {
        return {
          success: false,
          error: 'No transaction data returned from Moralis'
        };
      }

      const logs = response.raw.logs || [];
      const erc20Transfers = [];

      for (const log of logs) {
        if (
          log.topic0 === ERC20_TRANSFER_TOPIC &&
          typeof log.topic1 === 'string' &&
          typeof log.topic2 === 'string'
        ) {
          const from = '0x' + log.topic1.slice(26);
          const to = '0x' + log.topic2.slice(26);
          const valueHex = log.data;
          const value = ethers.BigNumber.from(valueHex).toString();

          erc20Transfers.push({
            tokenAddress: log.address,
            from,
            to,
            value
          });
        }
      }


      return {
        success: true,
        data: {
          ...response.raw,
          erc20Transfers
        }
      };
    } catch (error) {
      logger.error(`Failed to get transaction ${txHash} on chain ${chainId}`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Get transaction details by transaction hash
   * @param txHash Transaction hash
   * @param chainId Chain ID in hex format (0x1 = ETH, 0x38 = BSC, 0x89 = Polygon)
   * @returns Transaction details
   */
  async getTransactionForTon(address: string, targetHash: string): Promise<any> {
    try {
      const endpoint = await getHttpEndpoint();
      const client = new TonClient({ endpoint });
      const parsedAddress = Address.parse(address);

      // Fetch recent transactions (you can increase the count)
      const txs = await client.getTransactions(parsedAddress, { limit: 20 });

      console.log('address with target hash', txs);

      // If transaction is already in the logs, print raw transaction hashes for debugging
      for (const tx of txs) {
        console.log('Transaction hash (base64):', tx.hash().toString('base64'));
        console.log('Transaction hash (hex):', tx.hash().toString('hex'));
      }

      // Find matching transaction - check both hex and base64 formats
      const match = txs.find((tx: any) => {
        const txHashHex = tx.hash().toString('hex');
        const txHashBase64 = tx.hash().toString('base64');

        return txHashHex === targetHash || txHashBase64 === targetHash;
      });

      if (!match) {
        console.log("Transaction not found.");
        return null;
      }

      // Extract sender and recipient from message if available
      let from = address; // Default to the wallet address we're querying
      let to = 'N/A';
      let value = '0';
      let body = '0x';

      // Debug log the message structure
      console.log('inMessage structure:', JSON.stringify(match.inMessage?.info || {}, (key, value) =>
        typeof value === 'bigint' ? value.toString() : value));

      if (match.inMessage) {
        const msg: any = match.inMessage;

        // Try different property paths to find sender/receiver
        if (msg.info && msg.info.src) {
          from = msg.info.src.toString();
        }

        if (msg.info && msg.info.dest) {
          to = msg.info.dest.toString();
        } else if (msg.info && msg.info.dst) {
          to = msg.info.dst.toString();
        }

        // Check for value in different locations
        if (msg.info && msg.info.value) {
          value = msg.info.value.coins ? msg.info.value.coins.toString() : msg.info.value.toString();
        }

        // Safely handle body conversion - it might be a Cell object
        if (msg.body) {
          try {
            // Check if it's a Cell object with a toString method
            if (typeof msg.body.toBoc === 'function') {
              // Cell objects can be converted to Buffer using toBoc()
              body = '0x' + Buffer.from(msg.body.toBoc()).toString('hex');
            } else if (Buffer.isBuffer(msg.body)) {
              body = '0x' + msg.body.toString('hex');
            } else if (typeof msg.body === 'string') {
              body = '0x' + Buffer.from(msg.body).toString('hex');
            } else {
              body = '0x' + JSON.stringify(msg.body);
            }
          } catch (e) {
            console.error('Error converting message body:', e);
            body = '0x';
          }
        }
      }

      // Get the hash in both formats
      const hashHex = match.hash().toString('hex');
      const hashBase64 = match.hash().toString('base64');

      // Calculate transaction fee
      const totalFees = match.totalFees && match.totalFees.coins ?
        (Number(match.totalFees.coins) / 1_000_000_000).toFixed(9) : "0";

      // Format response to match Ethereum transaction format
      return {
        success: true,
        data: {
          hash: hashHex,
          from_address: from,
          to_address: to,
          value: value,
          block_timestamp: new Date(match.now * 1000).toISOString(),
          block_number: match.lt.toString(),
          block_hash: "0x" + Buffer.from(match.stateUpdate?.newHash || '').toString('hex'),
          transaction_fee: totalFees,
          networkName: "TON",
          explorerUrl: `https://tonscan.org/tx/${hashHex}`
        }
      };

    } catch (error) {
      logger.error(`Failed to get TON transaction ${targetHash}`, error);
      console.error(`Failed to get TON transaction ${targetHash}:`, error);
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
      case 2:
        return 'solana'
      case 3:
        return 'ton'
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
      case 2:
        return 'solana'
      case 3:
        return 'ton'
      default:
        throw new Error('Unsupported network');
    }
  }
}

export const moralisService = new MoralisService();

function convertSolanaToEthFormat(solanaResponse: any) {
  if (!solanaResponse) return null;

  console.log(solanaResponse);

  const data = solanaResponse;
  const message = data?.transaction?.message;
  const meta = data?.meta;

  if (!message || !meta) {
    console.error('Invalid Solana transaction format');
    return null;
  }

  // Safely access accountKeys with fallback to empty array
  const accountKeys = message?.staticAccountKeys || message?.accountKeys || [];

  if (!accountKeys || accountKeys.length === 0) {
    console.error('No account keys found in transaction');
    return {
      success: false,
      error: 'Invalid transaction format: No account keys found'
    };
  }

  // Get sender address (first account in accountKeys)
  const fromAddress = accountKeys[0];

  // Try to get the 'to' address from instructions
  // This is a best effort since Solana doesn't have a direct "to" address concept like EVM
  let toAddress = accountKeys.length > 1 ? accountKeys[1] : fromAddress; // Default to second account or sender
  try {
    // Look for transfer instruction - this is a simplification
    // For more complex cases, would need to check program IDs and instruction data
    if (message?.instructions && message?.instructions.length > 0) {
      // Try to find a transfer instruction
      for (const instruction of message?.instructions) {
        if (instruction.accounts && instruction.accounts.length > 1) {
          const receiverIndex = instruction.accounts[1];
          if (accountKeys[receiverIndex]) {
            toAddress = accountKeys[receiverIndex];
            break;
          }
        }
      }
    }
  } catch (e) {
    console.warn('Error identifying recipient address', e);
    // Use fallback already set
  }

  // Calculate value in lamports (SOL's smallest unit)
  const preBalance = meta?.preBalances?.[0] || 0;
  const postBalance = meta?.postBalances?.[0] || 0;
  const fee = meta?.fee || 0;
  const value = (preBalance - postBalance - fee).toString();

  // Convert fee to SOL (1 SOL = 1,000,000,000 lamports)
  const solFee = (fee / 1_000_000_000).toFixed(18);

  // Format timestamp
  const blockTime = data?.blockTime ?
    DateTime.fromSeconds(data?.blockTime).toISO() :
    new Date().toISOString();

  // Get transaction signature safely
  const signature = data?.transaction?.signatures?.[0] || '';

  // Create explorer URL
  const explorerUrl = signature ? `https://explorer.solana.com/tx/${signature}` : '';

  // Extract token transfers by analyzing logs and token balances
  const tokenTransfers = extractTokenTransfers(meta, accountKeys);

  return {
    success: true,
    data: {
      hash: signature,
      from_address: fromAddress,
      to_address: toAddress,
      value: value,
      gas: meta.computeUnitsConsumed?.toString() || "0",
      receipt_gas_used: meta.computeUnitsConsumed?.toString() || "0",
      receipt_status: meta.status?.Ok !== undefined ? "1" : "0",
      block_timestamp: blockTime,
      block_number: data.slot?.toString() || "0",
      transaction_fee: solFee,
      networkName: "Solana",
      explorerUrl: explorerUrl,
      tokenTransfers: tokenTransfers
    }
  };
}

/**
 * Extract SPL token transfer information from transaction metadata
 * @param meta Transaction metadata
 * @param accountKeys List of account keys in the transaction
 * @returns Array of token transfers
 */
function extractTokenTransfers(meta: any, accountKeys: any[]): any[] {
  if (!meta || !meta.preTokenBalances || !meta.postTokenBalances) {
    return [];
  }

  // Map of known token symbols by mint address
  const knownTokens: Record<string, string> = {
    'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v': 'USDC',
    'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB': 'USDT',
    '7dHbWXmci3dT8UFYWYZweBLXgycu7Y3iL6trKn1Y7ARj': 'stSOL',
    'So11111111111111111111111111111111111111112': 'SOL',
    'mSoLzYCxHdYgdzU16g5QSh3i5K3z3KZK7ytfqcJm7So': 'mSOL',
    '4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R': 'RAY',
    'DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263': 'BONK'
  };

  const preTokenBalances = meta.preTokenBalances || [];
  const postTokenBalances = meta.postTokenBalances || [];
  const logMessages = meta.logMessages || [];

  // Find the first sender account (usually the signer)
  const senderAccount = accountKeys[0] || '';

  // Track tokens being swapped
  const tokenTransfers: any[] = [];

  // Extract the token information
  for (const mint of Object.keys(knownTokens)) {
    const tokenName = knownTokens[mint];

    // Find pre and post balances for this mint
    const preBalance = preTokenBalances.find((b: any) => b.mint === mint);
    const postBalance = postTokenBalances.find((b: any) => b.mint === mint);

    // If we find both, we can calculate the difference
    if (preBalance && postBalance) {
      const preAmount = BigInt(preBalance.uiTokenAmount?.amount || '0');
      const postAmount = BigInt(postBalance.uiTokenAmount?.amount || '0');
      const decimals = preBalance.uiTokenAmount?.decimals || 0;

      // If amounts are different, there was a transfer
      if (preAmount !== postAmount) {
        const diff = Math.abs(Number(preAmount - postAmount)).toString();
        const isReceived = postAmount > preAmount;

        tokenTransfers.push({
          tokenAddress: mint,
          tokenName: tokenName,
          decimals: decimals,
          from: isReceived ? '' : senderAccount,
          to: isReceived ? senderAccount : '',
          value: diff
        });
      }
    }
    // If we only find one, it might be a new token received or completely sent
    else if (preBalance && !postBalance) {
      tokenTransfers.push({
        tokenAddress: mint,
        tokenName: tokenName,
        decimals: preBalance.uiTokenAmount?.decimals || 0,
        from: senderAccount,
        to: '',
        value: preBalance.uiTokenAmount?.amount || '0'
      });
    }
    else if (!preBalance && postBalance) {
      tokenTransfers.push({
        tokenAddress: mint,
        tokenName: tokenName,
        decimals: postBalance.uiTokenAmount?.decimals || 0,
        from: '',
        to: senderAccount,
        value: postBalance.uiTokenAmount?.amount || '0'
      });
    }
  }

  // If no tokens were found, try to analyze all token balances
  if (tokenTransfers.length === 0) {
    for (const postBalance of postTokenBalances) {
      const mint = postBalance.mint;
      if (!mint) continue;

      // Find the matching pre-balance for this mint and account
      const preBalance = preTokenBalances.find((b: any) =>
        b.mint === mint && b.accountIndex === postBalance.accountIndex
      );

      const tokenName = knownTokens[mint] || 'Unknown';
      const decimals = postBalance.uiTokenAmount?.decimals || 0;

      // If we found both pre and post, calculate the difference
      if (preBalance) {
        const preAmount = BigInt(preBalance.uiTokenAmount?.amount || '0');
        const postAmount = BigInt(postBalance.uiTokenAmount?.amount || '0');

        if (preAmount !== postAmount) {
          const diff = Math.abs(Number(preAmount - postAmount)).toString();
          const isReceived = postAmount > preAmount;

          // Try to determine owner from the token account data
          let ownerAddress = '';
          if (postBalance.owner) {
            ownerAddress = postBalance.owner;
          } else if (preBalance.owner) {
            ownerAddress = preBalance.owner;
          }

          tokenTransfers.push({
            tokenAddress: mint,
            tokenName: tokenName,
            decimals: decimals,
            from: isReceived ? '' : (ownerAddress || senderAccount),
            to: isReceived ? (ownerAddress || senderAccount) : '',
            value: diff
          });
        }
      }
      // Handle new token accounts
      else {
        tokenTransfers.push({
          tokenAddress: mint,
          tokenName: tokenName,
          decimals: decimals,
          from: '',
          to: postBalance.owner || senderAccount,
          value: postBalance.uiTokenAmount?.amount || '0'
        });
      }
    }

    // Also check if any tokens were completely sent (only in preBalance)
    for (const preBalance of preTokenBalances) {
      const mint = preBalance.mint;
      if (!mint) continue;

      // Check if this token account is gone in post balances
      const postBalance = postTokenBalances.find((b: any) =>
        b.mint === mint && b.accountIndex === preBalance.accountIndex
      );

      // If no matching post balance, the token was completely sent
      if (!postBalance) {
        const tokenName = knownTokens[mint] || 'Unknown';

        tokenTransfers.push({
          tokenAddress: mint,
          tokenName: tokenName,
          decimals: preBalance.uiTokenAmount?.decimals || 0,
          from: preBalance.owner || senderAccount,
          to: '',
          value: preBalance.uiTokenAmount?.amount || '0'
        });
      }
    }
  }

  // Try to complete the transfers by analyzing logs
  const updatedTransfers = tokenTransfers.map(transfer => {
    // If we're missing from or to, try to find them in log messages
    if (!transfer.from || !transfer.to) {
      // Look for program IDs from logs that might be involved
      const programIds = logMessages
        .filter((log: string) => log && log.includes('Program') && log.includes('invoke'))
        .map((log: string) => {
          const match = log.match(/Program (\w+) invoke/);
          return match ? match[1] : null;
        })
        .filter(Boolean);

      // Filter out common system programs
      const relevantProgramIds = programIds.filter((id: string) =>
        id !== 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA' && // Token program
        id !== '11111111111111111111111111111111' && // System program
        id !== 'ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL' && // Associated Token program
        id !== 'ComputeBudget111111111111111111111111111111' // Compute budget program
      );

      // If we found relevant program IDs and need a sender or receiver
      if (relevantProgramIds.length > 0) {
        // Assume first program might be a DEX or swap program
        const swapProgram = relevantProgramIds[0];

        if (!transfer.from) transfer.from = senderAccount;
        if (!transfer.to) transfer.to = swapProgram;
      }
      else {
        // Default fallback
        if (!transfer.from) transfer.from = senderAccount;
        if (!transfer.to) {
          // Try to find another account that might be a recipient
          for (let i = 1; i < accountKeys.length; i++) {
            if (accountKeys[i] && accountKeys[i] !== senderAccount) {
              transfer.to = accountKeys[i];
              break;
            }
          }
        }
      }
    }

    return transfer;
  });

  return updatedTransfers;
}
