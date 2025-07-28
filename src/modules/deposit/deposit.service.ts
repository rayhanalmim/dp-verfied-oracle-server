import { DepositModel, DepositStatus, NetworkType } from './deposit.model';
import { Network } from '../../services/blockchainService';
import { transactionVerificationService } from '../../services/transactionVerificationService';
import { logger } from '../../services/loggerService';
import config from '../../config';

export class DepositService {
  /**
   * Get all USDT deposit addresses from the config
   * @returns Object with deposit addresses for all networks
   */
  async getAllUsdtDepositAddresses(): Promise<{ ethereum: string; bsc: string; solana: string }> {
    try {
      return {
        ethereum: config.depositAddresses.ethereum,
        bsc: config.depositAddresses.bsc,
        solana: config.depositAddresses.solana
      };
    } catch (error) {
      logger.error('Failed to get all USDT deposit addresses', error);
      throw new Error('Failed to get USDT deposit addresses');
    }
  }

  /**
   * Get USDT deposit address for a specific network
   * @param network Network identifier (0 = ETH, 1 = BSC, 2 = SOL)
   * @returns The deposit address for the specified network
   */
  async getUsdtDepositAddressByNetwork(network: Network): Promise<string> {
    try {
      switch (network) {
        case Network.ETHEREUM:
          return config.depositAddresses.ethereum;
        case Network.BSC:
          return config.depositAddresses.bsc;
        case Network.SOLANA:
          return config.depositAddresses.solana;
        default:
          throw new Error('Invalid network specified');
      }
    } catch (error) {
      logger.error(`Failed to get deposit address for network ${network}`, error);
      throw new Error(`Failed to get deposit address for network ${network}`);
    }
  }

  /**
   * Create a new deposit request
   * @param userId User ID
   * @param transactionHash Transaction hash of the deposit
   * @param depositAmount Amount deposited (in USDT)
   * @param network Network identifier (0 = ETH, 1 = BSC, 2 = SOL)
   * @returns Created deposit document
   */
  async createDepositRequest(userId: string, transactionHash: string, depositAmount: string, network: Network): Promise<any> {
    try {
      // Determine token address based on the network
      let tokenAddress = '';
      switch (network) {
        case Network.ETHEREUM:
          tokenAddress = config.ethereum.networks.ethereum.usdtAddress;
          break;
        case Network.BSC:
          tokenAddress = config.ethereum.networks.bsc.usdtAddress;
          break;
        case Network.SOLANA:
          tokenAddress = config.ethereum.networks.solana.usdtAddress;
          break;
        default:
          throw new Error('Invalid network specified');
      }

      // Create a new deposit record
      const deposit = new DepositModel({
        userId,
        transactionHash,
        network,
        tokenAddress,
        depositAmount,
        status: DepositStatus.PENDING
      });

      // Save to database
      await deposit.save();

      // Start verification process asynchronously
      this.startVerificationProcess(deposit._id.toString(), transactionHash, depositAmount, network)
        .catch(error => logger.error(`Verification failed for transaction ${transactionHash}`, error));

      return deposit;
    } catch (error) {
      logger.error('Failed to create deposit request', error);
      throw new Error('Failed to create deposit request');
    }
  }

  /**
   * Start the verification process for a deposit
   * @param depositId Deposit document ID
   * @param transactionHash Transaction hash to verify
   * @param amount Amount deposited
   * @param network Network identifier (0 = ETH, 1 = BSC, 2 = SOL)
   */
  private async startVerificationProcess(depositId: string, transactionHash: string, amount: string, network: Network): Promise<void> {
    try {
      // Update status to verifying
      await DepositModel.findByIdAndUpdate(depositId, { status: DepositStatus.VERIFYING });

      // Verify the transaction directly using our verification service
      const isVerified = await transactionVerificationService.verifyTransaction(transactionHash, amount, network);

      if (isVerified) {
        // Calculate platform tokens (example: 1:1 ratio)
        const platformTokenAmount = amount;

        // Update deposit status
        await DepositModel.findByIdAndUpdate(depositId, {
          status: DepositStatus.CONFIRMED,
          platformTokenAmount,
          verificationTimestamp: new Date()
        });

        logger.info(`Deposit confirmed for transaction ${transactionHash} on ${this.getNetworkName(network)}`);
      } else {
        await DepositModel.findByIdAndUpdate(depositId, { status: DepositStatus.FAILED });
        logger.warn(`Deposit verification failed for transaction ${transactionHash} on ${this.getNetworkName(network)}`);
      }
    } catch (error) {
      logger.error(`Error in verification process for transaction ${transactionHash}`, error);
      await DepositModel.findByIdAndUpdate(depositId, { status: DepositStatus.FAILED });
    }
  }

  /**
   * Get deposit status by transaction hash
   * @param transactionHash Transaction hash to check
   * @returns Deposit document or null if not found
   */
  async getDepositByTransactionHash(transactionHash: string): Promise<any> {
    try {
      return await DepositModel.findOne({ transactionHash });
    } catch (error) {
      logger.error('Failed to get deposit by transaction hash', error);
      throw new Error('Failed to get deposit status');
    }
  }

  /**
   * Get all deposits for a user
   * @param userId User ID
   * @returns Array of deposit documents
   */
  async getUserDeposits(userId: string): Promise<any[]> {
    try {
      return await DepositModel.find({ userId }).sort({ createdAt: -1 });
    } catch (error) {
      logger.error('Failed to get user deposits', error);
      throw new Error('Failed to get user deposits');
    }
  }

  /**
   * Get deposits filtered by network
   * @param userId User ID
   * @param network Network identifier (0 = ETH, 1 = BSC, 2 = SOL)
   * @returns Array of deposit documents
   */
  async getUserDepositsByNetwork(userId: string, network: Network): Promise<any[]> {
    try {
      return await DepositModel.find({ userId, network }).sort({ createdAt: -1 });
    } catch (error) {
      logger.error(`Failed to get user deposits for network ${network}`, error);
      throw new Error(`Failed to get user deposits for network ${network}`);
    }
  }

  /**
   * Get the network name from the network enum value
   * @param networkId Network enum value
   * @returns Network name as string
   */
  private getNetworkName(networkId: Network): string {
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
}

export const depositService = new DepositService(); 