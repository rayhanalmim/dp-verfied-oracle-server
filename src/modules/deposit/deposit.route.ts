import { Router } from 'express';
import * as depositController from './deposit.controller';

const router = Router();

/**
 * @route GET /api/deposit/addresses
 * @desc Get all USDT deposit addresses for all supported networks
 * @access Public
 */
router.get('/addresses', depositController.getAllUsdtDepositAddresses);

/**
 * @route GET /api/deposit/address/:network
 * @desc Get USDT deposit address for a specific network (0=ETH, 1=BSC, 2=SOL)
 * @access Public
 */
router.get('/address/:network', depositController.getUsdtDepositAddressByNetwork);

/**
 * @route POST /api/deposit/verify
 * @desc Submit a deposit transaction for verification
 * @access Private
 */
router.post('/verify', depositController.submitDepositTransaction);

/**
 * @route GET /api/deposit/status/:transactionHash
 * @desc Get deposit status by transaction hash
 * @access Private
 */
router.get('/status/:transactionHash', depositController.getDepositStatus);

/**
 * @route GET /api/deposit/user/:userId
 * @desc Get all deposits for a user, optionally filtered by network
 * @query network - Optional network filter (0=ETH, 1=BSC, 2=SOL)
 * @access Private
 */
router.get('/user/:userId', depositController.getUserDeposits);

/**
 * @route GET /api/deposit/transaction/:network/:txHash
 * @desc Get detailed information about a transaction without creating a deposit
 * @access Private
 */
router.get('/transaction/:network/:txHash', depositController.getTransactionDetails);

/**
 * @route GET /api/deposit/test-verify/:network/:txHash
 * @desc Test route to directly verify a transaction without creating a deposit
 * @access Development only
 */
router.get('/test-verify/:network/:txHash', depositController.testTransactionVerification);

export default router; 