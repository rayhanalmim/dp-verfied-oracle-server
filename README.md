# Cryptocurrency Deposit Server

This server handles cryptocurrency deposits across multiple blockchains (Ethereum, BSC, Solana) with a server-side verification flow.

## Overview

This server provides APIs for:
- Getting deposit addresses for multiple networks
- Submitting deposit transactions for verification
- Checking deposit status
- Viewing user deposits

The system has been updated to remove direct blockchain contract interactions, now handling all verification logic server-side.

## Setup

### Prerequisites
- Node.js v18+
- MongoDB
- Postman (for testing)

### Installation
1. Install dependencies:
```
npm install
```

2. Configure environment variables:
Create a `.env` file in the server directory:
```
PORT=3000
NODE_ENV=development
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/your-database

# Deposit addresses (used instead of smart contract addresses)
ETH_DEPOSIT_ADDRESS=0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
BSC_DEPOSIT_ADDRESS=0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
SOLANA_DEPOSIT_ADDRESS=G3QhuTXs97Arotoq9P2Xq531M3XSu3TQv7CTNyVJmVR2

# Token addresses
USDT_TOKEN_ADDRESS_ETH=0x7169D38820dfd117C3FA1f22a697dBA58d90BA06
USDT_TOKEN_ADDRESS_BSC=0x7169D38820dfd117C3FA1f22a697dBA58d90BA06
USDT_TOKEN_ADDRESS_SOL=0x7169D38820dfd117C3FA1f22a697dBA58d90BA06

# RPC URLs
ETH_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/your-api-key
BSC_RPC_URL=https://data-seed-prebsc-1-s1.binance.org:8545/
SOL_RPC_URL=https://api.testnet.solana.com

# API Keys
ETHERSCAN_API_KEY=your-etherscan-api-key
BSCSCAN_API_KEY=your-bscscan-api-key

# For testing/development
SKIP_BLOCKCHAIN_VERIFICATION=false
```

3. Start the development server:
```
npm run dev
```

## Recent Changes

The server has been refactored to:
1. Remove direct blockchain contract interactions
2. Implement enhanced server-side transaction verification with detailed transaction data
3. Use environment variables for deposit and token addresses
4. Add transaction timestamp and block information
5. Support value comparison between expected amount and actual transaction amount

### Key Components

- **blockchainService**: Simplified to provide network enums and utilities
- **transactionVerificationService**: Enhanced transaction verification with detailed transaction info
- **depositService**: Handles deposit creation and status management
- **verifierOracleService**: Simulates oracle functionality
- **transactionUtils**: New utility functions for processing blockchain transactions

## API Documentation

### Deposit Addresses
- `GET /api/deposit/addresses` - Get addresses for all networks
- `GET /api/deposit/address/:network` - Get address for specific network (0=ETH, 1=BSC, 2=SOL)

### Transaction Verification
- `GET /api/deposit/transaction/:network/:txHash` - Get detailed information about a transaction

### Deposit Transactions
- `POST /api/deposit/verify` - Submit a deposit for verification
  ```json
  {
    "userId": "user_id",
    "transactionHash": "0x...",
    "amount": "100",
    "network": 0
  }
  ```

### Status Check
- `GET /api/deposit/status/:transactionHash` - Check deposit status
- `GET /api/deposit/user/:userId` - Get all deposits for a user
- `GET /api/deposit/user/:userId?network=0` - Get deposits filtered by network

## Testing

### Verification Scripts
The project includes a script to test transaction verification:

```
# Run verification with real blockchain checks
npm run verify

# Run verification in test mode (skips actual blockchain verification)
npm run verify:test
```

See the [TESTING.md](./TESTING.md) file for detailed instructions on testing the deposit flow with Postman and MetaMask.

## Architecture

The system follows a modular architecture:
- `modules/` - Feature-based modules containing controllers, models, routes, and services
- `services/` - Shared services for blockchain interaction, logging, etc.
- `middleware/` - Express middleware for authentication, error handling, etc.
- `utils/` - Utility functions and helpers
- `config/` - Configuration settings
- `scripts/` - Testing and utility scripts

## Development

### Build for production
```
npm run build
```

### Run in production
```
npm run prod
``` 