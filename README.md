# Cryptocurrency Deposit Server

This server handles cryptocurrency deposits across multiple blockchains (Ethereum, BSC, Solana, TON) with a server-side verification flow.

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
TON_DEPOSIT_ADDRESS=your-ton-deposit-address

# Token addresses
USDT_TOKEN_ADDRESS_ETH=0x7169D38820dfd117C3FA1f22a697dBA58d90BA06
USDT_TOKEN_ADDRESS_BSC=0x7169D38820dfd117C3FA1f22a697dBA58d90BA06
USDT_TOKEN_ADDRESS_SOL=0x7169D38820dfd117C3FA1f22a697dBA58d90BA06
USDT_TOKEN_ADDRESS_TON=your-ton-token-address

# RPC URLs
ETH_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/your-api-key
BSC_RPC_URL=https://data-seed-prebsc-1-s1.binance.org:8545/
SOL_RPC_URL=https://api.testnet.solana.com
TON_RPC_URL=https://toncenter.com/api/v2/jsonRPC

# API Keys
ETHERSCAN_API_KEY=your-etherscan-api-key
BSCSCAN_API_KEY=your-bscscan-api-key
TON_API_KEY=your-ton-api-key

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
6. Add TON blockchain support
7. Implement new deposit creation and verification flow with timestamp validation

### New Deposit Flow

The updated deposit verification system now works as follows:

1. User creates a deposit request with specified amount and network
2. System provides a deposit address for the selected network
3. After making the deposit, user submits the transaction hash for verification
4. System verifies that:
   - The transaction occurred after the deposit request was made
   - The amount matches the requested amount (within tolerance)
   - The transaction is valid on the blockchain
5. If verified successfully, the deposit is marked as confirmed

### Key Components

- **blockchainService**: Simplified to provide network enums and utilities
- **transactionVerificationService**: Enhanced transaction verification with detailed transaction info
- **depositService**: Handles deposit creation and status management
- **depositVerificationService**: New service for deposit validation and verification
- **verifierOracleService**: Simulates oracle functionality
- **transactionUtils**: New utility functions for processing blockchain transactions

## API Documentation

### Deposit Creation and Verification
- `POST /api/transaction/deposit/create` - Create a new deposit request
  ```json
  {
    "userId": "user_id",
    "amount": "100",
    "network": 0
  }
  ```
- `POST /api/transaction/deposit/verify` - Verify a deposit transaction
  ```json
  {
    "userId": "user_id",
    "transactionHash": "0x...",
    "network": 0,
    "amount": "100"
  }
  ```
- `GET /api/transaction/deposit/:userId/pending` - Get pending deposits for a user

### Deposit Addresses
- `GET /api/deposit/addresses` - Get addresses for all networks
- `GET /api/deposit/address/:network` - Get address for specific network (0=ETH, 1=BSC, 2=SOL, 3=TON)

### Transaction Verification
- `GET /api/transaction/:network/:txHash` - Get detailed information about a transaction
- `POST /api/transaction/ton/:address` - Get TON transaction by hash for an address

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

### Wallet Transactions
- `GET /api/transaction/wallet/:network/:address` - Get wallet transactions for a specified network and address

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