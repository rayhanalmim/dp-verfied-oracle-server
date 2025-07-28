import { Request, Response } from 'express';
import { depositService } from './deposit.service';
import { logger } from '../../services/loggerService';
import { Network } from '../../services/blockchainService';
import { transactionVerificationService } from '../../services/transactionVerificationService';
import catchAsync from '../../utils/catchAsync';

export const getAllUsdtDepositAddresses = catchAsync(async (req: Request, res: Response) => {
  const depositAddresses = await depositService.getAllUsdtDepositAddresses();
  
  res.status(200).json({
    success: true,
    data: depositAddresses
  });
});

export const getUsdtDepositAddressByNetwork = catchAsync(async (req: Request, res: Response) => {
  const { network } = req.params;
  const networkId = parseInt(network);
  
  // Validate network parameter
  if (isNaN(networkId) || networkId < 0 || networkId > 2) {
    return res.status(400).json({
      success: false,
      message: 'Invalid network parameter. Valid values are: 0 (ETH), 1 (BSC), 2 (SOL)'
    });
  }
  
  const depositAddress = await depositService.getUsdtDepositAddressByNetwork(networkId);
  
  res.status(200).json({
    success: true,
    data: {
      network: networkId,
      networkName: getNetworkName(networkId),
      depositAddress
    }
  });
});

export const submitDepositTransaction = catchAsync(async (req: Request, res: Response) => {
  const { userId, transactionHash, amount, network } = req.body;
  
  // Validate input
  if (!userId || !transactionHash || !amount || network === undefined) {
    return res.status(400).json({
      success: false,
      message: 'Missing required fields: userId, transactionHash, amount, or network'
    });
  }
  
  // Validate network parameter
  const networkId = parseInt(network);
  if (isNaN(networkId) || networkId < 0 || networkId > 2) {
    return res.status(400).json({
      success: false,
      message: 'Invalid network parameter. Valid values are: 0 (ETH), 1 (BSC), 2 (SOL)'
    });
  }
  
  // Validate transaction hash format
  if (!transactionVerificationService.isValidTransactionHash(transactionHash, networkId)) {
    return res.status(400).json({
      success: false,
      message: `Invalid transaction hash format for ${getNetworkName(networkId)}`
    });
  }
  
  const deposit = await depositService.createDepositRequest(userId, transactionHash, amount, networkId);
  const explorerUrl = transactionVerificationService.getExplorerUrl(transactionHash, networkId);
  
  res.status(201).json({
    success: true,
    message: 'Deposit verification initiated',
    data: {
      depositId: deposit._id,
      network: networkId,
      networkName: getNetworkName(networkId),
      status: deposit.status,
      explorerUrl
    }
  });
});

export const getDepositStatus = catchAsync(async (req: Request, res: Response) => {
  const { transactionHash } = req.params;
  
  const deposit = await depositService.getDepositByTransactionHash(transactionHash);
  
  if (!deposit) {
    return res.status(404).json({
      success: false,
      message: 'Deposit not found'
    });
  }
  
  // Get explorer URL for the transaction
  const explorerUrl = transactionVerificationService.getExplorerUrl(deposit.transactionHash, deposit.network);
  
  res.status(200).json({
    success: true,
    data: {
      depositId: deposit._id,
      status: deposit.status,
      network: deposit.network,
      networkName: getNetworkName(deposit.network),
      transactionHash: deposit.transactionHash,
      depositAmount: deposit.depositAmount,
      platformTokenAmount: deposit.platformTokenAmount,
      createdAt: deposit.createdAt,
      updatedAt: deposit.updatedAt,
      verificationTimestamp: deposit.verificationTimestamp,
      explorerUrl
    }
  });
});

export const getUserDeposits = catchAsync(async (req: Request, res: Response) => {
  const { userId } = req.params;
  const { network } = req.query;
  
  let deposits;
  
  if (network !== undefined) {
    const networkId = parseInt(network as string);
    
    // Validate network parameter
    if (isNaN(networkId) || networkId < 0 || networkId > 2) {
      return res.status(400).json({
        success: false,
        message: 'Invalid network parameter. Valid values are: 0 (ETH), 1 (BSC), 2 (SOL)'
      });
    }
    
    deposits = await depositService.getUserDepositsByNetwork(userId, networkId);
  } else {
    deposits = await depositService.getUserDeposits(userId);
  }
  
  // Add explorer URLs to each deposit
  const depositsWithExplorerUrls = deposits.map(deposit => {
    const explorerUrl = transactionVerificationService.getExplorerUrl(deposit.transactionHash, deposit.network);
    return {
      ...deposit.toObject(),
      networkName: getNetworkName(deposit.network),
      explorerUrl
    };
  });
  
  res.status(200).json({
    success: true,
    count: deposits.length,
    data: depositsWithExplorerUrls
  });
});

/**
 * Test route for directly testing transaction verification without creating deposits
 */
export const testTransactionVerification = catchAsync(async (req: Request, res: Response) => {
  const { network, txHash } = req.params;
  const networkId = parseInt(network);
  
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
      message: `Invalid transaction hash format for ${getNetworkName(networkId)}`
    });
  }
  
  try {
    // Debug mode - force verify to true if needed
    const forceVerify = req.query.force === 'true';
    
    if (forceVerify) {
      transactionVerificationService.setTransactionVerificationStatus(txHash, true);
      logger.info(`Forced transaction ${txHash} to be verified`);
    }
    
    // Try to verify the transaction
    const isVerified = await transactionVerificationService.verifyTransaction(txHash, "0", networkId);
    const explorerUrl = transactionVerificationService.getExplorerUrl(txHash, networkId);
    
    return res.status(200).json({
      success: true,
      data: {
        transactionHash: txHash,
        network: networkId,
        networkName: getNetworkName(networkId),
        verified: isVerified,
        explorerUrl,
        note: 'This is a test endpoint for direct verification without creating deposits'
      }
    });
  } catch (error: any) {
    logger.error(`Error in test verification: ${error.message}`, error);
    return res.status(500).json({
      success: false,
      message: 'Error verifying transaction',
      error: error.message
    });
  }
});

/**
 * Get detailed information about a transaction without creating a deposit
 */
export const getTransactionDetails = catchAsync(async (req: Request, res: Response) => {
  const { network, txHash } = req.params;
  const networkId = parseInt(network);
  
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
      message: `Invalid transaction hash format for ${getNetworkName(networkId)}`
    });
  }
  
  try {
    // Get transaction details
    const details = await transactionVerificationService.getTransactionDetails(txHash, networkId);
    
    if (!details || !details.success) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found or could not be processed',
        error: details?.message || 'Unknown error'
      });
    }
    
    return res.status(200).json({
      success: true,
      data: {
        ...details,
        networkName: getNetworkName(networkId),
      }
    });
  } catch (error: any) {
    logger.error(`Error getting transaction details: ${error.message}`, error);
    return res.status(500).json({
      success: false,
      message: 'Error retrieving transaction details',
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
    default:
      return 'Unknown Network';
  }
} 