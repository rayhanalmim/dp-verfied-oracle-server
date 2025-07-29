import { Router } from 'express';
import * as transactionController from './transaction.controller';

const router = Router();

router.post('/ton/:address', transactionController.getTonTransactionByHash);
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
 * @route GET /api/transaction/wallet/:network/:address
 * @desc Get wallet transactions using Moralis API
 * @param network Network identifier (0=ETH, 1=BSC, 2=SOL)
 * @param address Wallet address
 * @query testnet Boolean flag to use testnet instead of mainnet
 * @query limit Maximum number of transactions to return (default: 10)
 * @access Public
 */
router.get('/wallet/:network/:address', transactionController.getWalletTransactions);

export default router; 