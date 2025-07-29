# Transaction API

This module provides APIs for fetching transaction data from various blockchains using Moralis API.

## Setup

1. Obtain a Moralis API key from [Moralis.io](https://moralis.io)
2. Add the API key to your `.env` file:
```
MORALIS_API_KEY=your-moralis-api-key
```

## API Endpoints

### Get Transaction By Hash

Fetch transaction details by transaction hash.

- **URL:** `/api/transaction/:network/:txHash`
- **Method:** `GET`
- **URL Params:**
  - `network`: Network identifier (0=ETH, 1=BSC, 2=SOL)
  - `txHash`: Transaction hash
- **Query Params:**
  - `testnet`: Boolean flag to use testnet instead of mainnet (default: false)
  - `verbose`: Boolean flag to include more detailed information (default: false)
- **Success Response:**
  - **Code:** 200
  - **Content:**
    ```json
    {
      "success": true,
      "data": {
        "hash": "0x9d0cfe775d48fea6d4d9111d726b5403da77c2dffbc60ed24dedfb92feeaac40",
        "block_number": "27373823",
        "from_address": "0x95222290dd7278aa3ddd389cc1e1d165cc4bafe5",
        "to_address": "0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c",
        "value": "8678000000000000000",
        "gas": "21000",
        "gas_price": "5000000000",
        "input": "0x",
        "receipt_gas_used": "21000",
        "receipt_status": "1",
        "block_timestamp": "2022-07-01T12:00:00.000Z",
        "networkName": "Binance Smart Chain",
        "explorerUrl": "https://testnet.bscscan.com/tx/0x9d0cfe775d48fea6d4d9111d726b5403da77c2dffbc60ed24dedfb92feeaac40"
      }
    }
    ```

### Get Wallet Transactions

Fetch all transactions for a wallet address.

- **URL:** `/api/transaction/wallet/:network/:address`
- **Method:** `GET`
- **URL Params:**
  - `network`: Network identifier (0=ETH, 1=BSC, 2=SOL)
  - `address`: Wallet address
- **Query Params:**
  - `testnet`: Boolean flag to use testnet instead of mainnet (default: false)
  - `limit`: Maximum number of transactions to return (default: 10)
- **Success Response:**
  - **Code:** 200
  - **Content:**
    ```json
    {
      "success": true,
      "data": {
        "total": 42,
        "page": 0,
        "page_size": 5,
        "networkName": "Ethereum",
        "result": [
          {
            "hash": "0x1f9090aaE28b8a3dCeaDf281B0F12828e676c326",
            "block_number": "18791022",
            "from_address": "0x1f9090aaE28b8a3dCeaDf281B0F12828e676c326",
            "to_address": "0x6b175474e89094c44da98b954eedeac495271d0f",
            "value": "0",
            "gas": "90000",
            "gas_price": "19000000000",
            "block_timestamp": "2023-09-15T14:32:11.000Z",
            "explorerUrl": "https://etherscan.io/tx/0x1f9090aaE28b8a3dCeaDf281B0F12828e676c326"
          },
          // More transactions...
        ]
      }
    }
    ```

### Get TON Transaction By Hash

Fetch transaction details for a TON address by hash.

- **URL:** `/api/transaction/ton/:address`
- **Method:** `POST`
- **URL Params:**
  - `address`: TON wallet address
- **Request Body:**
  ```json
  {
    "txHash": "47759564452f010ee9c2f0634550834e8a7f2127b23c5aea511135e1e59cbfcd"
  }
  ```
- **Success Response:**
  - **Code:** 200
  - **Content:**
    ```json
    {
      "success": true,
      "data": {
        "hash": "47759564452f010ee9c2f0634550834e8a7f2127b23c5aea511135e1e59cbfcd",
        "from_address": "UQA4P3jvl_SKKFHlNMICwqNJEGdPwDpR8LUEwKg_Z-MDI2Ei",
        "to_address": "EQA4P3jvl_SKKFHlNMICwqNJEGdPwDpR8LUEwKg_Z-MDIzzn",
        "value": "0",
        "block_timestamp": "2025-07-21T11:04:12.000Z",
        "block_number": "59634102000001",
        "block_hash": "0x19769f7c3bc5f9812d21cefe26d9242a9ea4595784900155365d44108b51b495",
        "transaction_fee": "0.002855350",
        "networkName": "TON",
        "explorerUrl": "https://tonscan.org/tx/47759564452f010ee9c2f0634550834e8a7f2127b23c5aea511135e1e59cbfcd",
        "tokenTransfers": [
          {
            "tokenName": "USDT",
            "tokenAddress": "EQBynBO23ywHy_CgarY9NK9FTz0yDsG82PtcbSTQgGoXwiuA",
            "decimals": 6,
            "from": "",
            "to": "EQA4P3jvl_SKKFHlNMICwqNJEGdPwDpR8LUEwKg_Z-MDIzzn",
            "value": "10"
          }
        ]
      }
    }
    ```

### Create Deposit Request

Create a new deposit request for a user.

- **URL:** `/api/transaction/deposit/create`
- **Method:** `POST`
- **Request Body:**
  ```json
  {
    "userId": "user123",
    "amount": "10",
    "network": 0,
    "status": "pending" // Optional
  }
  ```
- **Success Response:**
  - **Code:** 201
  - **Content:**
    ```json
    {
      "success": true,
      "message": "Deposit request created successfully",
      "data": {
        "depositId": "6123abc456def789ghi",
        "userId": "user123",
        "network": 0,
        "networkName": "Ethereum",
        "amount": "10",
        "status": "pending",
        "depositAddress": "0x4B56723cF326a1f922E3F83e5D3bD9114608Bd05",
        "createdAt": "2023-11-15T08:00:00.000Z"
      }
    }
    ```

### Verify Deposit Transaction

Verify a deposit transaction for a previously created deposit request.

- **URL:** `/api/transaction/deposit/verify`
- **Method:** `POST`
- **Request Body:**
  ```json
  {
    "userId": "user123",
    "transactionHash": "0xb69344c7179216fcf9e9df3abf8205bb91555f769873324d9fdbe5396e1c79d6",
    "network": 0,
    "amount": "10"
  }
  ```
- **Success Response:**
  - **Code:** 200
  - **Content:**
    ```json
    {
      "success": true,
      "message": "Deposit verified successfully",
      "data": {
        "depositId": "6123abc456def789ghi",
        "amount": "10"
      }
    }
    ```
- **Error Response:**
  - **Code:** 400
  - **Content:**
    ```json
    {
      "success": false,
      "message": "Transaction amount does not match deposit request",
      "details": {
        "expected": 10,
        "actual": 5,
        "difference": "50.00%"
      }
    }
    ```

### Get Pending Deposits for User

Get all pending deposits for a specific user.

- **URL:** `/api/transaction/deposit/:userId/pending`
- **Method:** `GET`
- **URL Params:**
  - `userId`: User ID
- **Success Response:**
  - **Code:** 200
  - **Content:**
    ```json
    {
      "success": true,
      "count": 2,
      "data": [
        {
          "_id": "6123abc456def789ghi",
          "userId": "user123",
          "network": 0,
          "networkName": "Ethereum",
          "depositAmount": "10",
          "status": "pending",
          "depositAddress": "0x4B56723cF326a1f922E3F83e5D3bD9114608Bd05",
          "createdAt": "2023-11-15T08:00:00.000Z",
          "requestTimestamp": "2023-11-15T08:00:00.000Z"
        },
        {
          "_id": "6123def456abc789jkl",
          "userId": "user123",
          "network": 1,
          "networkName": "Binance Smart Chain",
          "depositAmount": "20",
          "status": "pending",
          "depositAddress": "0xa084c81b62ea7210b8229bfc41f6cfdb9825258a",
          "createdAt": "2023-11-15T09:30:00.000Z",
          "requestTimestamp": "2023-11-15T09:30:00.000Z"
        }
      ]
    }
    ```

## Deposit Verification Process

The deposit verification flow works as follows:

1. User creates a deposit request through `POST /api/transaction/deposit/create`
   - System assigns a deposit address based on the selected network
   - System stores the request timestamp for later verification

2. User makes the deposit to the provided address on the selected blockchain network

3. User submits the transaction hash through `POST /api/transaction/deposit/verify`
   - System verifies that the transaction occurred after the deposit request
   - System checks that the amount matches the requested amount (within tolerance)
   - System verifies the transaction is valid on the blockchain

4. If verification is successful:
   - Deposit is marked as confirmed
   - User can proceed with using the deposited funds
   - API returns success with deposit details

5. If verification fails:
   - Deposit is marked as rejected
   - API returns the reason for rejection (timestamp mismatch, amount mismatch, etc.)

## Testing

You can test the API using the included script:

```
npm run moralis
```

This will make API calls to fetch:
1. A BSC transaction by hash
2. Detailed verbose transaction information 
3. Transactions for an Ethereum wallet address

Make sure your server is running (`npm run dev`) and you have configured your Moralis API key correctly. 