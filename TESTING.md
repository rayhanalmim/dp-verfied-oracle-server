# Testing the Deposit Flow with Postman and MetaMask

This guide explains how to test the complete deposit flow with your local server, Postman, and MetaMask.

## Prerequisites

1. **Server**: Running locally on port 3000
2. **Postman**: Installed on your PC
3. **MetaMask**: Configured with Sepolia testnet and USDT tokens

## Step 1: Setup MetaMask

1. Make sure MetaMask is connected to Sepolia testnet
   - Click on the network dropdown in MetaMask
   - Select "Sepolia Test Network"
   - If not available, add it:
     - Network Name: Sepolia Test Network
     - RPC URL: https://eth-sepolia.g.alchemy.com/v2/your-api-key
     - Chain ID: 11155111
     - Currency Symbol: SEP
     - Block Explorer URL: https://sepolia.etherscan.io

2. Verify your USDT balance
   - Click on "Assets" tab in MetaMask
   - You should see your USDT balance
   - If USDT is not visible, add the token:
     - Click "Import tokens"
     - Enter the USDT token address: `0x7169D38820dfd117C3FA1f22a697dBA58d90BA06`
     - Other fields should autofill
     - Click "Import"

## Step 2: Create Postman Collection

1. Open Postman and create a new collection named "Deposit Flow Testing"
2. Add the following requests:

### Request 1: Get Deposit Addresses

- **Method**: GET
- **URL**: `http://localhost:3000/api/deposit/addresses`
- **Description**: Gets the deposit addresses for all networks

### Request 2: Get Specific Network Address

- **Method**: GET
- **URL**: `http://localhost:3000/api/deposit/address/0`
- **Description**: Gets the deposit address for Ethereum (replace 0 with 1 for BSC or 2 for Solana)

### Request 3: Submit Deposit Transaction

- **Method**: POST
- **URL**: `http://localhost:3000/api/deposit/verify`
- **Headers**:
  - Content-Type: application/json
- **Body** (raw JSON):
  ```json
  {
    "userId": "user123", 
    "transactionHash": "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
    "amount": "100", 
    "network": 0
  }
  ```
  > Note: For testing, you can use any string as userId (e.g., "user123", "tester1"), but you need to provide a valid transaction hash from the network.

### Request 4: Check Deposit Status

- **Method**: GET
- **URL**: `http://localhost:3000/api/deposit/status/{transactionHash}`
- **Description**: Replace `{transactionHash}` with the actual transaction hash

### Request 5: Get User Deposits

- **Method**: GET
- **URL**: `http://localhost:3000/api/deposit/user/{userId}`
- **Description**: Replace `{userId}` with the same userId you used when creating deposits

### Request 6: Get User Deposits by Network

- **Method**: GET
- **URL**: `http://localhost:3000/api/deposit/user/{userId}?network=0`
- **Description**: Replace `{userId}` with your user ID and optionally filter by network (0, 1, or 2)

### Request 7: Test Transaction Verification (Debug)

- **Method**: GET
- **URL**: `http://localhost:3000/api/deposit/test-verify/{network}/{transactionHash}`
- **Description**: Directly tests transaction verification without creating a deposit
- **Example**: `http://localhost:3000/api/deposit/test-verify/0/0xfb2840978f13c5eba3a3fbd34fa88ed13aaa521ae6568dd688aa982cc393b5d3`
- **Parameters**:
  - `network`: Network ID (0=ETH, 1=BSC, 2=SOL)
  - `transactionHash`: Transaction hash to verify
  - `force` (optional query param): Set to `true` to force verification, e.g., `/test-verify/0/0x12345?force=true`

## Step 3: Testing the Flow

### A. Get Deposit Address

1. Send the "Get Deposit Addresses" request in Postman
2. Note the Ethereum (Sepolia) deposit address from the response
3. Alternatively, send the "Get Specific Network Address" request with `0` for Ethereum

### B. Send USDT from MetaMask

1. Open MetaMask
2. Click on your USDT token
3. Click "Send"
4. Enter the deposit address from the previous step
5. Enter the amount (e.g., 100 USDT)
6. Confirm the transaction and approve any prompts
7. Wait for the transaction to be processed on the network
8. Once confirmed, copy the transaction hash from MetaMask (click on the transaction for details)

### C. Submit Deposit Transaction in the System

1. In Postman, use the "Submit Deposit Transaction" endpoint
2. Update the request body:
   - Set `userId` to any string identifier (e.g., "user123")
   - Set `transactionHash` to the hash from MetaMask (must be a valid transaction hash)
   - Set `amount` to the amount you sent
   - Set `network` to 0 (for Ethereum/Sepolia)
3. Send the request
4. Note the deposit ID and explorer URL from the response

### D. Check Deposit Status

1. In Postman, use the "Check Deposit Status" endpoint
2. Replace `{transactionHash}` in the URL with your actual transaction hash
3. Send the request
4. The response should show the status of your deposit:
   - `pending`: Initial state
   - `verifying`: Transaction is being verified
   - `confirmed`: Deposit confirmed and tokens credited
   - `failed`: Verification failed
5. Check the `explorerUrl` field to view the transaction on the blockchain explorer

### E. View User Deposits

1. In Postman, use the "Get User Deposits" endpoint
2. Replace `{userId}` in the URL with the same userId you used when creating the deposit
3. Send the request
4. The response should list all deposits for the user, including the one you just created
5. To filter by network, use the "Get User Deposits by Network" endpoint

## Finding Real Transaction Hashes for Testing

If you don't want to spend real tokens, you can use existing transaction hashes from blockchain explorers:

### Ethereum Sepolia

1. Go to [Sepolia Etherscan](https://sepolia.etherscan.io/)
2. Look for recent transactions (especially token transfers)
3. Copy a transaction hash to use in your testing
4. Example: `0x5a141e5450bedfc0ed371d7cf1406dbb152bce13e562a0815b944645045b8c85`

### BSC Testnet

1. Go to [BSC Testnet Explorer](https://testnet.bscscan.com/)
2. Look for recent transactions
3. Copy a transaction hash to use in your testing
4. Example: `0x9e84f0e6911c2efb4268a8b32380d82d4051df77058842247500a53a35918284`

### Solana Testnet

1. Go to [Solana Explorer (Testnet)](https://explorer.solana.com/?cluster=testnet)
2. Look for recent transactions
3. Copy a transaction signature to use in your testing
4. Example: `5cxWaEyxN4UcF6hHRVMZRz7tNxDMwXVeEyeBCT1UxFBzaqhjg5XHXDfUEFD2XwK5R5EQ2De72WdQkZG3FZJeGtbF`

## Debugging Transaction Verification Issues

If you're experiencing issues with transaction verification, the test endpoint provides a way to diagnose problems without creating deposits.

### Using the Test Verification Endpoint

1. Use the "Test Transaction Verification" endpoint in Postman:
   ```
   GET http://localhost:3000/api/deposit/test-verify/0/0xfb2840978f13c5eba3a3fbd34fa88ed13aaa521ae6568dd688aa982cc393b5d3
   ```

2. The response will show:
   - Whether the transaction format is valid
   - Whether the verification was successful
   - Explorer URL for the transaction
   - Any error details if verification failed

3. Check the server logs for detailed debugging information, including:
   - API calls to blockchain explorers
   - Response data from explorers
   - Validation steps
   - Error messages

4. Common verification failures and solutions:

   | Problem | Possible Cause | Solution |
   |---------|----------------|----------|
   | "Invalid transaction hash format" | Hash doesn't match network format | Ensure hash follows correct format for the network |
   | "Transaction not found" | Transaction doesn't exist on the blockchain | Use a real transaction hash from explorer |
   | "API error" | Rate limiting from explorer APIs | Get free API keys from Etherscan/BSCScan |
   | "Transaction status failed" | Transaction exists but failed on-chain | Use a successful transaction hash |
   | Timeout errors | Network connectivity issues | Check your internet connection |

### Forcing Transaction Verification

For testing purposes, you can bypass verification by adding the `force=true` query parameter:

```
GET http://localhost:3000/api/deposit/test-verify/0/0xfb2840978f13c5eba3a3fbd34fa88ed13aaa521ae6568dd688aa982cc393b5d3?force=true
```

This will force the transaction to be considered valid regardless of blockchain status.

### Environment Variables for Verification Control

The server supports several environment variables to control verification:

1. `NODE_ENV=development` - Makes the system more permissive for testing
2. `SKIP_BLOCKCHAIN_VERIFICATION=true` - Bypasses actual blockchain calls
3. `ETHERSCAN_API_KEY`, `BSCSCAN_API_KEY` - Add API keys to avoid rate limiting

To update these, create a `.env` file in the server directory with these variables.

## Testing Tips

1. **Simplified User ID**: The system has been modified to accept any string as userId instead of requiring a MongoDB ObjectId.

2. **Transaction Hash Format**: The system now validates transaction hash formats:
   - Ethereum/BSC: 0x followed by 64 hex characters
   - Solana: Base58 encoded string (typically 43-44 characters)

3. **Real Transaction Verification**: The system now verifies transactions against blockchain explorers:
   - Transactions must exist on the blockchain
   - Transactions must be successful (status = 1)

4. **Explorer Integration**: All API responses now include an `explorerUrl` field that links to the transaction on the appropriate blockchain explorer.

## Troubleshooting

1. **"Transaction not found" error**: This happens when you try to use a transaction hash that doesn't exist on the blockchain. Use a real transaction hash from the explorer.

2. **"Invalid transaction hash format" error**: Ensure you're using the correct format for the network:
   - Ethereum/BSC: `0x` followed by 64 hex characters
   - Solana: Base58 encoded string (typically 43-44 characters)

3. **"Transaction verification failed" error**: The transaction might exist but failed, or doesn't have enough confirmations yet.

4. **API Key errors**: The blockchain explorer APIs might limit requests without API keys. Consider getting free API keys for Etherscan, BSCScan, etc., and adding them to your `.env` file.

## Security Considerations

- This testing setup uses hardcoded deposit addresses from the configuration
- In production, ensure proper security measures are implemented
- Avoid using real valuable tokens for testing

## Understanding Verification Flow

The updated verification flow:

1. Validates the transaction hash format
2. Checks if the transaction exists on the blockchain (via explorer APIs)
3. Verifies the transaction was successful
4. Updates the deposit status accordingly
5. Returns explorer URLs to allow viewing transactions on the blockchain 