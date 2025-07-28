// Network enum that matches what was previously in the contract
enum Network {
  ETHEREUM = 0,
  BSC = 1,
  SOLANA = 2
}

/**
 * Simplified blockchain service that provides basic blockchain network utilities
 * No direct contract interactions - all verification logic is in transactionVerificationService
 */
class BlockchainService {
  /**
   * Get the network name from the network enum value
   * @param networkId Network enum value
   * @returns Network name as string
   */
  getNetworkName(networkId: Network): string {
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

export const blockchainService = new BlockchainService();
export { Network }; 