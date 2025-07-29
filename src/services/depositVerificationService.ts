import { moralisService } from './moralisService';
import { transactionVerificationService } from './transactionVerificationService';
import { DepositModel, DepositStatus, NetworkType } from '../modules/deposit/deposit.model';
import { logger } from './loggerService';

/**
 * Service for verifying deposit transactions across different blockchains
 */
class DepositVerificationService {
    // Tolerance percentage for amount comparison (to account for network fees)
    private amountTolerancePercentage = 2;

    /**
     * Create a new deposit request
     * @param userId User ID making the request
     * @param amount Amount to deposit
     * @param network Network for the deposit
     * @param status Initial status (default pending)
     * @returns Created deposit request
     */
    async createDepositRequest(
        userId: string,
        amount: string,
        network: number,
        status: DepositStatus = DepositStatus.PENDING
    ) {
        try {
            // Generate a deposit address (in a real system this would come from a wallet service)
            const depositAddress = await this.getDepositAddressForNetwork(network);

            const deposit = new DepositModel({
                userId,
                network,
                depositAmount: amount,
                status,
                depositAddress,
                requestTimestamp: new Date()
            });

            await deposit.save();
            logger.info(`Created deposit request for user ${userId} on network ${network} for amount ${amount}`);

            return deposit;
        } catch (error) {
            logger.error('Error creating deposit request:', error);
            throw error;
        }
    }

    /**
     * Update an existing deposit request with transaction information
     * @param depositId ID of the deposit request to update
     * @param transactionHash Transaction hash to associate with the deposit
     */
    async updateDepositWithTransaction(depositId: string, transactionHash: string) {
        try {
            const deposit = await DepositModel.findById(depositId);

            if (!deposit) {
                throw new Error(`Deposit request ${depositId} not found`);
            }

            deposit.transactionHash = transactionHash;
            deposit.status = DepositStatus.VERIFYING;

            await deposit.save();
            logger.info(`Updated deposit ${depositId} with transaction hash ${transactionHash}`);

            return deposit;
        } catch (error) {
            logger.error(`Error updating deposit ${depositId} with transaction:`, error);
            throw error;
        }
    }

    /**
     * Verify a deposit transaction
     * @param userId User ID who made the deposit
     * @param transactionHash Transaction hash to verify
     * @param network Network ID
     * @param amount Expected amount
     * @returns Verification result object
     */
    async verifyDeposit(userId: string, transactionHash: string, network: number, amount: string) {
        try {
            // First, find any pending deposits for this user and network with matching amount
            const pendingDeposit = await DepositModel.findOne({
                userId,
                network,
                depositAmount: amount,
                status: DepositStatus.PENDING
            });

            if (!pendingDeposit) {
                logger.warn(`No pending deposit found for user ${userId} on network ${network} with amount ${amount}`);
                return {
                    success: false,
                    message: 'No matching deposit request found'
                };
            }

            // Get transaction details based on network type
            let transactionDetails;

            if (network === NetworkType.TON) {
                // For TON network
                const addressToCheck = pendingDeposit.depositAddress || '';
                transactionDetails = await moralisService.getTransactionForTon(addressToCheck, transactionHash);
            } else {
                // For other networks
                const isTestnet = process.env.NODE_ENV !== 'production'; // Use testnet in non-prod environments
                const chainId = isTestnet
                    ? moralisService.getTestnetChainId(network)
                    : moralisService.getChainId(network);

                transactionDetails = await moralisService.getTransactionByHash(transactionHash, chainId);
            }

            if (!transactionDetails || !transactionDetails.success) {
                logger.warn(`Failed to retrieve transaction details for ${transactionHash}`);
                return {
                    success: false,
                    message: 'Failed to retrieve transaction details',
                    error: transactionDetails?.error || 'Transaction not found'
                };
            }

            // 1. Verify transaction timestamp is after deposit request timestamp
            const txTimestamp = new Date(transactionDetails.data.block_timestamp);
            const requestTimestamp = pendingDeposit.requestTimestamp;

            if (txTimestamp < requestTimestamp) {
                logger.warn(`Transaction timestamp (${txTimestamp}) is before deposit request timestamp (${requestTimestamp})`);

                // Update deposit status to rejected
                pendingDeposit.status = DepositStatus.REJECTED;
                pendingDeposit.transactionHash = transactionHash;
                await pendingDeposit.save();

                return {
                    success: false,
                    message: 'Transaction occurred before deposit request'
                };
            }

            // 2. Verify amount transferred (with tolerance)
            let transferredAmount = '0';

            // Extract the transferred amount based on network type
            if (network === NetworkType.TON) {
                // For TON, check token transfers
                if (transactionDetails.data.tokenTransfers?.length > 0) {
                    // Find relevant token transfer
                    const transfer = transactionDetails.data.tokenTransfers[0];
                    transferredAmount = transfer.value;
                }
            } else if (network === NetworkType.ETHEREUM || network === NetworkType.BSC) {
                // For Ethereum and BSC, check ERC20 transfers
                if (transactionDetails.data.erc20Transfers?.length > 0) {
                    // Use the first token transfer for now
                    const transfer = transactionDetails.data.erc20Transfers[0];

                    // Convert from Wei to Ether if necessary (check for large values)
                    if (transfer.value.length > 18) {
                        transferredAmount = this.calculateTokenAmount(transfer.value, 18);
                    } else {
                        transferredAmount = transfer.value;
                    }
                }
            } else if (network === NetworkType.SOLANA) {
                // For Solana, check token transfers
                if (transactionDetails.data.tokenTransfers?.length > 0) {
                    const transfer = transactionDetails.data.tokenTransfers[0];
                    transferredAmount = transfer.value;
                }
            }

            // Compare amounts with tolerance
            const expectedAmount = parseFloat(amount);
            const actualAmount = parseFloat(transferredAmount);

            // Calculate percentage difference
            const difference = Math.abs(expectedAmount - actualAmount) / expectedAmount * 100;

            if (difference > this.amountTolerancePercentage) {
                logger.warn(`Amount mismatch: expected ${expectedAmount}, got ${actualAmount}, difference ${difference}%`);

                // Update deposit status to rejected
                pendingDeposit.status = DepositStatus.REJECTED;
                pendingDeposit.transactionHash = transactionHash;
                await pendingDeposit.save();

                return {
                    success: false,
                    message: 'Transaction amount does not match deposit request',
                    expected: expectedAmount,
                    actual: actualAmount,
                    difference: `${difference.toFixed(2)}%`
                };
            }

            // If we made it here, verification is successful
            pendingDeposit.status = DepositStatus.CONFIRMED;
            pendingDeposit.transactionHash = transactionHash;
            pendingDeposit.verificationTimestamp = new Date();
            await pendingDeposit.save();

            logger.info(`Successfully verified deposit for user ${userId}, transaction ${transactionHash}`);

            return {
                success: true,
                message: 'Deposit verified successfully',
                depositId: pendingDeposit._id,
                amount: transferredAmount
            };
        } catch (error) {
            logger.error(`Error verifying deposit transaction ${transactionHash}:`, error);
            return {
                success: false,
                message: 'Error verifying deposit',
                error: error instanceof Error ? error.message : 'Unknown error'
            };
        }
    }

    /**
     * Get pending deposits for a user
     * @param userId User ID
     * @returns List of pending deposits
     */
    async getPendingDepositsForUser(userId: string) {
        try {
            return await DepositModel.find({
                userId,
                status: DepositStatus.PENDING
            });
        } catch (error) {
            logger.error(`Error getting pending deposits for user ${userId}:`, error);
            throw error;
        }
    }

    /**
     * Helper method to get a deposit address for a network
     * In a real system, this would integrate with a wallet service
     */
    private async getDepositAddressForNetwork(network: number): Promise<string> {
        // These would normally come from a wallet service or configuration
        const addresses: Record<number, string> = {
            [NetworkType.ETHEREUM]: '0x4B56723cF326a1f922E3F83e5D3bD9114608Bd05',
            [NetworkType.BSC]: '0xa084c81b62ea7210b8229bfc41f6cfdb9825258a',
            [NetworkType.SOLANA]: '79WBQcB4yHboe7zxy3m2Xax2zauehTm1tE1xCxw77777',
            [NetworkType.TON]: 'UQA4P3jvl_SKKFHlNMICwqNJEGdPwDpR8LUEwKg_Z-MDI2Ei'
        };

        return addresses[network] || '';
    }

    // Fix error with BigInt exponentiation
    private calculateTokenAmount(value: string, decimals: number = 18): string {
        try {
            const valueInWei = BigInt(value);

            // Handle exponentiation manually to avoid BigInt ** operator issues
            let divisor = BigInt(1);
            for (let i = 0; i < decimals; i++) {
                divisor = divisor * BigInt(10);
            }

            // Perform division
            const majorUnits = valueInWei / divisor;
            const remainder = valueInWei % divisor;

            // Format with decimals if there's a remainder
            if (remainder === BigInt(0)) {
                return majorUnits.toString();
            } else {
                // Convert remainder to string with leading zeros
                let remainderStr = remainder.toString().padStart(decimals, '0');
                // Trim trailing zeros
                remainderStr = remainderStr.replace(/0+$/, '');
                return `${majorUnits.toString()}.${remainderStr}`;
            }
        } catch (error) {
            logger.error('Error calculating token amount:', error);
            return value; // Return original value if calculation fails
        }
    }
}

export const depositVerificationService = new DepositVerificationService(); 