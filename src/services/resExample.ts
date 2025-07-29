// Ton response example
const tonResponse = {
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

// solana respnse example
const solanaResponse = {
    "success": true,
    "data": {
        "hash": "4jgt2inwFPjzsrQUV6kLZxSMLx3E1THHJSBBJZ9RYjA4EWuNUPM6Qhx5A6hChVo1AhawMGiJ8BSntby1GXZidNXW",
        "from_address": "79WBQcB4yHboe7zxy3m2Xax2zauehTm1tE1xCxw77777",
        "to_address": "4AeFhpqnD5Jq6DRwpriVaF2mfYzksY6sVU8Q8z3tKKrR",
        "value": "0",
        "gas": "36106",
        "receipt_gas_used": "36106",
        "receipt_status": "1",
        "block_timestamp": "2025-07-29T15:59:45.000+06:00",
        "block_number": "356488784",
        "transaction_fee": "0.000010000000000000",
        "networkName": "Solana",
        "explorerUrl": "https://explorer.solana.com/tx/4jgt2inwFPjzsrQUV6kLZxSMLx3E1THHJSBBJZ9RYjA4EWuNUPM6Qhx5A6hChVo1AhawMGiJ8BSntby1GXZidNXW?cluster=testnet",
        "tokenTransfers": [
            {
                "tokenAddress": "Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB",
                "tokenName": "USDT",
                "decimals": 6,
                "from": "79WBQcB4yHboe7zxy3m2Xax2zauehTm1tE1xCxw77777",
                "to": "EXTsrAYLY61C4TWVQxZu2FkWumRWEs6WbLL96jvdWHR9",
                "value": "200"
            }
        ]
    }
}


// binance respnse example
const binanceResponse = {
    "success": true,
    "data": {
        "hash": "0xb2145c9868fbdbbc8f92c27717b4a3945f9ea7d29591eb2b83a5e80f2ac89d6f",
        "from_address": "0xa084c81b62ea7210b8229bfc41f6cfdb9825258a",
        "to_address": "0x55d398326f99059ff775485246999027b3197955",
        "to_address_label": "Binance-Peg BSC-USD (BSC-USD)",
        "gas": "100000",
        "gas_price": "100000000",
        "receipt_cumulative_gas_used": "21782739",
        "receipt_gas_used": "34515",
        "block_timestamp": "2025-07-29T09:59:03.000Z",
        "block_number": "55713541",
        "block_hash": "0xf57988a72f34abad1cee309d5671de82a9f3cf942886eb7fd8f9c19c8a878eff",
        "transaction_fee": "0.0000034515",
        "erc20Transfers": [
            {
                "tokenAddress": "0x55d398326f99059ff775485246999027b3197955",
                "from": "0xa084c81b62ea7210b8229bfc41f6cfdb9825258a",
                "to": "0x01dae1e95bc48db79aa40955c6165e04ff5093b6",
                "value": "351500000000000000000"
            }
        ],
        "networkName": "Binance Smart Chain",
        "explorerUrl": "https://testnet.bscscan.com/tx/0xb2145c9868fbdbbc8f92c27717b4a3945f9ea7d29591eb2b83a5e80f2ac89d6f"
    }
}


// ethereum respnse example
const ethereumResponse = {
    "success": true,
    "data": {
        "hash": "0xb69344c7179216fcf9e9df3abf8205bb91555f769873324d9fdbe5396e1c79d6",
        "from_address": "0xb3d9011cb9a68aaf42a5be71ba3e9046e4ba5370",
        "to_address": "0xdac17f958d2ee523a2206206994597c13d831ec7",
        "to_address_label": "Tether USD (USDT)",
        "gas": "64043",
        "gas_price": "333217892",
        "receipt_cumulative_gas_used": "23478700",
        "receipt_gas_used": "63209",
        "block_timestamp": "2025-07-29T09:45:35.000Z",
        "block_number": "23023988",
        "block_hash": "0x8f5785b5127eba5d6331274f23271bf08b31afc4c78784bcfc31dc8b7866133f",
        "transaction_fee": "0.000021062369735428",
        "erc20Transfers": [
            {
                "tokenAddress": "0xdac17f958d2ee523a2206206994597c13d831ec7",
                "from": "0xb3d9011cb9a68aaf42a5be71ba3e9046e4ba5370",
                "to": "0x6e011f6df7e2f45de92505de5c03d5c60f6a3070",
                "value": "450000000"
            }
        ],
        "networkName": "Ethereum",
        "explorerUrl": "https://sepolia.etherscan.io/tx/0xb69344c7179216fcf9e9df3abf8205bb91555f769873324d9fdbe5396e1c79d6"
    }
}
