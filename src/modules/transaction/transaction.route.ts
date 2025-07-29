import { Router } from 'express';
import * as transactionController from './transaction.controller';

const router = Router();


/**
 * @route GET /api/transaction/:network/:txHash
 * @desc Get transaction details by hash using Moralis API
 * @param network Network identifier (0=ETH, 1=BSC, 2=SOL)
 * @param txHash Transaction hash
 * @query testnet Boolean flag to use testnet instead of mainnet
 * @query verbose Boolean flag to include more detailed information
 * @access Public
 */
router.get('/:network/:txHash', transactionController.getTransactionByHash);

/**
 * @route GET /ton/:address
 * @body {hash=string}
 * @param txHash Transaction hash
 * @access Public
 */
router.post('/ton/:address', transactionController.getTonTransactionByHash);

/**
 * @route GET /api/transaction/wallet/:network/:address
 * @desc Get wallet transactions using Moralis API
 * @param network Network identifier (0=ETH, 1=BSC, 2=SOL)
 * @param address Wallet address
 * @query testnet Boolean flag to use testnet instead of mainnet
 * @query limit Maximum number of transactions to return (default: 10)
 * @access Public
 */
router.get('/wallet/:network/:address', transactionController.getWalletTransactions);

/**
 * @route POST /api/transaction/deposit/create
 * @desc Create a new deposit request
 * @body {userId, amount, network, status(optional)}
 * @access Public
 */
router.post('/deposit/create', transactionController.createDepositRequest);

/**
 * @route POST /api/transaction/deposit/verify
 * @desc Verify a deposit transaction
 * @body {userId, transactionHash, network, amount}
 * @access Public
 */
router.post('/deposit/verify', transactionController.verifyDepositTransaction);

/**
 * @route GET /api/transaction/deposit/:userId/pending
 * @desc Get pending deposits for a user
 * @param userId User ID
 * @access Public
 */
router.get('/deposit/:userId/pending', transactionController.getUserPendingDeposits);

export default router; 