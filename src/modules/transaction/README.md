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