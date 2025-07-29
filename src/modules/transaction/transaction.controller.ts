import { Request, Response } from 'express';
import { moralisService } from '../../services/moralisService';
import { logger } from '../../services/loggerService';
import catchAsync from '../../utils/catchAsync';
import { transactionVerificationService } from '../../services/transactionVerificationService';
import { Network } from '../../services/blockchainService';
import { depositVerificationService } from '../../services/depositVerificationService';
import { NetworkType, DepositStatus } from '../deposit/deposit.model';

/**
 * Get transaction details by hash using Moralis API
 */
export const getTransactionByHash = catchAsync(async (req: Request, res: Response) => {
  const { network, txHash } = req.params;
  const networkId = parseInt(network);

  console.log(networkId, txHash);

  // Validate network
  if (isNaN(networkId) || networkId < 0 || networkId > 2) {
    return res.status(400).json({
      success: false,
      message: 'Invalid network parameter. Valid values are: 0 (ETH), 1 (BSC), 2 (SOL)'
    });
  }

  // Validate hash format
  if (!transactionVerificationService.isValidTransactionHash(txHash, networkId)) {
    return res.status(400).json({
      success: false,
      message: `Invalid transaction hash format for network ${networkId}`
    });
  }

  try {
    // Check if we should use testnet or mainnet
    const isTestnet = req.query.testnet === 'true';

    // Get chain ID for the network
    let chainId: string;
    try {
      chainId = isTestnet
        ? moralisService.getTestnetChainId(networkId)
        : moralisService.getChainId(networkId);
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : 'Unsupported network'
      });
    }

    // Get transaction details
    const verbose = req.query.verbose === 'true';
    let transactionDetails;

    if (verbose) {
      transactionDetails = await moralisService.getTransactionVerbose(txHash, chainId);
    } else {
      transactionDetails = await moralisService.getTransactionByHash(txHash, chainId);
    }

    if (!transactionDetails.success) {
      return res.status(404).json({
        success: false,
        message: 'Failed to retrieve transaction details',
        error: transactionDetails.error
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        ...transactionDetails.data,
        networkName: getNetworkName(networkId),
        explorerUrl: transactionVerificationService.getExplorerUrl(txHash, networkId)
      }
    });
  } catch (error: any) {
    logger.error(`Error getting transaction details from Moralis: ${error.message}`, error);
    return res.status(500).json({
      success: false,
      message: 'Error retrieving transaction details',
      error: error.message
    });
  }
});

/**
 * Get wallet transactions using Moralis API
 */
export const getWalletTransactions = catchAsync(async (req: Request, res: Response) => {
  const { network, address } = req.params;
  const networkId = parseInt(network);
  const limit = parseInt(req.query.limit as string) || 10;

  // Validate network
  if (isNaN(networkId) || networkId < 0 || networkId > 2) {
    return res.status(400).json({
      success: false,
      message: 'Invalid network parameter. Valid values are: 0 (ETH), 1 (BSC), 2 (SOL)'
    });
  }

  // Validate address (simple validation)
  if (!address || !/^0x[0-9a-fA-F]{40}$/.test(address)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid wallet address format'
    });
  }

  try {
    // Check if we should use testnet or mainnet
    const isTestnet = req.query.testnet === 'true';

    // Get chain ID for the network
    let chainId: string;
    try {
      chainId = isTestnet
        ? moralisService.getTestnetChainId(networkId)
        : moralisService.getChainId(networkId);
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : 'Unsupported network'
      });
    }

    // Get wallet transactions
    const transactions = await moralisService.getWalletTransactions(address, chainId, limit);

    if (!transactions.success) {
      return res.status(404).json({
        success: false,
        message: 'Failed to retrieve wallet transactions',
        error: transactions.error
      });
    }

    // Enhance transaction data with explorer URLs
    const enhancedTransactions = transactions.data.result?.map((tx: any) => ({
      ...tx,
      explorerUrl: transactionVerificationService.getExplorerUrl(tx.hash, networkId)
    }));

    return res.status(200).json({
      success: true,
      data: {
        total: transactions.data.total,
        page: transactions.data.page,
        page_size: transactions.data.page_size,
        networkName: getNetworkName(networkId),
        result: enhancedTransactions || []
      }
    });
  } catch (error: any) {
    logger.error(`Error getting wallet transactions from Moralis: ${error.message}`, error);
    return res.status(500).json({
      success: false,
      message: 'Error retrieving wallet transactions',
      error: error.message
    });
  }
});



export const getTonTransactionByHash = catchAsync(async (req: Request, res: Response) => {
  const { address } = req.params;
  const { txHash } = req.body;

  // Basic validation for TON address
  if (!address) {
    return res.status(400).json({
      success: false,
      message: 'TON address is required'
    });
  }

  // Validate hash format
  if (!txHash || txHash.length < 10) {
    return res.status(400).json({
      success: false,
      message: 'Invalid TON transaction hash format'
    });
  }

  try {
    // Get transaction details
    const transactionDetails = await moralisService.getTransactionForTon(address, txHash);

    if (!transactionDetails || !transactionDetails.success) {
      return res.status(404).json({
        success: false,
        message: 'Failed to retrieve TON transaction details',
        error: transactionDetails?.error || 'Transaction not found'
      });
    }

    return res.status(200).json({
      success: true,
      data: transactionDetails.data
    });
  } catch (error: any) {
    logger.error(`Error getting TON transaction details: ${error.message}`, error);
    return res.status(500).json({
      success: false,
      message: 'Error retrieving TON transaction details',
      error: error.message
    });
  }
});

/**
 * Create a deposit request
 * This endpoint creates a pending deposit request for a user
 */
export const createDepositRequest = catchAsync(async (req: Request, res: Response) => {
  const { userId, amount, network, status } = req.body;

  // Validate required fields
  if (!userId || !amount || network === undefined) {
    return res.status(400).json({
      success: false,
      message: 'Missing required fields: userId, amount, or network'
    });
  }

  // Validate network parameter
  const networkId = parseInt(String(network));
  if (isNaN(networkId) || networkId < 0 || networkId > 3) { // Added TON (3)
    return res.status(400).json({
      success: false,
      message: 'Invalid network parameter. Valid values are: 0 (ETH), 1 (BSC), 2 (SOL), 3 (TON)'
    });
  }

  // Validate amount format (should be numeric string)
  if (isNaN(parseFloat(amount))) {
    return res.status(400).json({
      success: false,
      message: 'Invalid amount format'
    });
  }

  // Convert status if provided
  let depositStatus = DepositStatus.PENDING;
  if (status) {
    if (Object.values(DepositStatus).includes(status as DepositStatus)) {
      depositStatus = status as DepositStatus;
    } else {
      return res.status(400).json({
        success: false,
        message: 'Invalid status value'
      });
    }
  }

  try {
    // Create the deposit request
    const deposit = await depositVerificationService.createDepositRequest(
      userId,
      amount,
      networkId,
      depositStatus
    );

    // Return deposit details with deposit address
    return res.status(201).json({
      success: true,
      message: 'Deposit request created successfully',
      data: {
        depositId: deposit._id,
        userId: deposit.userId,
        network: deposit.network,
        networkName: getNetworkName(deposit.network),
        amount: deposit.depositAmount,
        status: deposit.status,
        depositAddress: deposit.depositAddress,
        createdAt: deposit.createdAt
      }
    });
  } catch (error: any) {
    logger.error(`Error creating deposit request: ${error.message}`, error);
    return res.status(500).json({
      success: false,
      message: 'Error creating deposit request',
      error: error.message
    });
  }
});

/**
 * Verify a deposit transaction
 * This endpoint verifies if a transaction is valid for a pending deposit
 */
export const verifyDepositTransaction = catchAsync(async (req: Request, res: Response) => {
  const { userId, transactionHash, network, amount } = req.body;

  // Validate required fields
  if (!userId || !transactionHash || network === undefined || !amount) {
    return res.status(400).json({
      success: false,
      message: 'Missing required fields: userId, transactionHash, network, or amount'
    });
  }

  // Validate network parameter
  const networkId = parseInt(String(network));
  if (isNaN(networkId) || networkId < 0 || networkId > 3) { // Added TON (3)
    return res.status(400).json({
      success: false,
      message: 'Invalid network parameter. Valid values are: 0 (ETH), 1 (BSC), 2 (SOL), 3 (TON)'
    });
  }

  // Validate hash format (except in TON which has special handling)
  if (networkId !== NetworkType.TON && !transactionVerificationService.isValidTransactionHash(transactionHash, networkId)) {
    return res.status(400).json({
      success: false,
      message: `Invalid transaction hash format for ${getNetworkName(networkId)}`
    });
  }

  try {
    // Verify the deposit
    const verificationResult = await depositVerificationService.verifyDeposit(
      userId,
      transactionHash,
      networkId,
      amount
    );

    if (!verificationResult.success) {
      return res.status(400).json({
        success: false,
        message: verificationResult.message || 'Deposit verification failed',
        details: verificationResult
      });
    }

    // Return successful verification
    return res.status(200).json({
      success: true,
      message: 'Deposit verified successfully',
      data: verificationResult
    });
  } catch (error: any) {
    logger.error(`Error verifying deposit transaction: ${error.message}`, error);
    return res.status(500).json({
      success: false,
      message: 'Error verifying deposit transaction',
      error: error.message
    });
  }
});

/**
 * Get pending deposits for a user
 */
export const getUserPendingDeposits = catchAsync(async (req: Request, res: Response) => {
  const { userId } = req.params;

  if (!userId) {
    return res.status(400).json({
      success: false,
      message: 'User ID is required'
    });
  }

  try {
    const deposits = await depositVerificationService.getPendingDepositsForUser(userId);

    // Enhance deposits with network names
    const enhancedDeposits = deposits.map(deposit => ({
      ...deposit.toObject(),
      networkName: getNetworkName(deposit.network)
    }));

    return res.status(200).json({
      success: true,
      count: deposits.length,
      data: enhancedDeposits
    });
  } catch (error: any) {
    logger.error(`Error getting pending deposits for user ${userId}: ${error.message}`, error);
    return res.status(500).json({
      success: false,
      message: 'Error retrieving pending deposits',
      error: error.message
    });
  }
});

// Helper function to get network name
function getNetworkName(networkId: number): string {
  switch (networkId) {
    case Network.ETHEREUM:
      return 'Ethereum';
    case Network.BSC:
      return 'Binance Smart Chain';
    case Network.SOLANA:
      return 'Solana';
    case NetworkType.TON:
      return 'TON';
    default:
      return 'Unknown Network';
  }
} 