import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env file
dotenv.config({ path: path.join(__dirname, '../../.env') });

const config = {
  port: process.env.PORT || 3000,
  nodeEnv: process.env.NODE_ENV || 'development',
  mongodbUri: process.env.MONGODB_URI || 'mongodb+srv://iotcom:aZ6DZBszmjtT9cGY@cluster0.tdvw5wt.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0',
  ethereum: {
    providerUrl: process.env.ETHEREUM_PROVIDER_URL || 'https://eth-sepolia.g.alchemy.com/v2/bIOWs_1tByFaHx9ig0tNJM9GTdieQP35',
    privateKey: process.env.PRIVATE_KEY || 'your-private-key',
    contractAddress: process.env.CONTRACT_ADDRESS || 'your-contract-address',
    networks: {
      ethereum: {
        usdtAddress: process.env.USDT_TOKEN_ADDRESS_ETH || '0x7169D38820dfd117C3FA1f22a697dBA58d90BA06',
        rpcUrl: process.env.ETH_RPC_URL || 'https://eth-sepolia.g.alchemy.com/v2/bIOWs_1tByFaHx9ig0tNJM9GTdieQP35'
      },
      bsc: {
        usdtAddress: process.env.USDT_TOKEN_ADDRESS_BSC || '0x7169D38820dfd117C3FA1f22a697dBA58d90BA06',
        rpcUrl: process.env.BSC_RPC_URL || 'https://data-seed-prebsc-1-s1.binance.org:8545/'
      },
      solana: {
        usdtAddress: process.env.USDT_TOKEN_ADDRESS_SOL || '0x7169D38820dfd117C3FA1f22a697dBA58d90BA06',
        rpcUrl: process.env.SOL_RPC_URL || 'https://api.testnet.solana.com'
      }
    }
  },
  depositAddresses: {
    ethereum: process.env.ETH_DEPOSIT_ADDRESS || '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
    bsc: process.env.BSC_DEPOSIT_ADDRESS || '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
    solana: process.env.SOLANA_DEPOSIT_ADDRESS || 'G3QhuTXs97Arotoq9P2Xq531M3XSu3TQv7CTNyVJmVR2'
  },
  verificationOptions: {
    skipBlockchainVerification: process.env.SKIP_BLOCKCHAIN_VERIFICATION === 'true',
    etherscanApiKey: process.env.ETHERSCAN_API_KEY || '',
    bscscanApiKey: process.env.BSCSCAN_API_KEY || '',
    isDevelopment: process.env.NODE_ENV === 'development'
  }
};

export default config;