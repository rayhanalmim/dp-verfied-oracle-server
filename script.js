// Ethereum Transaction Decoder
const transactionData = {
    "jsonrpc": "2.0",
    "id": 1,
    "result": {
        "blockHash": "0x8f551c1105d4c6b4ce7b791a07254f46189939f3a28a5151e7e615015d50a921",
        "blockNumber": "0x870ef5",
        "from": "0x74ff564b68c1416227a108604ba65f747bdbbeaf",
        "gas": "0x5208",
        "gasPrice": "0x59682f2c",
        "maxFeePerGas": "0x59682f39",
        "maxPriorityFeePerGas": "0x59682f00",
        "hash": "0xde16cd4a823b593fd0c296a3998cd49afb9597067f5bd6985bb54cca54b883bc",
        "input": "0x",
        "nonce": "0x54",
        "to": "0xdc83ba145b38d35a505dc80988886dce171631be",
        "transactionIndex": "0x10",
        "value": "0x38d7ea4c68000",
        "type": "0x2",
        "accessList": [],
        "chainId": "0xaa36a7",
        "v": "0x0",
        "r": "0x3050c09d0da1352af5767648804c5ffb2e8ae125a537b23d607f9e0ee026bef3",
        "s": "0xa7ac74ba3acb2604df0629beddd69c8c3a8f5e33ffaae25b054b035885fd8a9",
        "yParity": "0x0"
    }
};

// Helper functions
function hexToDecimal(hex) {
    return parseInt(hex, 16);
}

function hexToEther(hex) {
    const wei = BigInt(hex);
    const ether = Number(wei) / Math.pow(10, 18);
    return ether;
}

function hexToGwei(hex) {
    const wei = BigInt(hex);
    const gwei = Number(wei) / Math.pow(10, 9);
    return gwei;
}

function getChainName(chainId) {
    const chains = {
        '0x1': 'Ethereum Mainnet',
        '0xaa36a7': 'Sepolia Testnet',
        '0x5': 'Goerli Testnet',
        '0x89': 'Polygon',
        '0xa4b1': 'Arbitrum One'
    };
    return chains[chainId] || `Unknown Chain (${chainId})`;
}

function getTransactionType(type) {
    const types = {
        '0x0': 'Legacy Transaction',
        '0x1': 'EIP-2930 (Access List)',
        '0x2': 'EIP-1559 (Dynamic Fee)'
    };
    return types[type] || `Unknown Type (${type})`;
}

// Decode and display transaction details
function decodeTransaction(data) {
    const tx = data.result;

    console.log("🔍 ETHEREUM TRANSACTION DECODER");
    console.log("=".repeat(50));

    console.log("\n📋 BASIC INFORMATION:");
    console.log(`Transaction Hash: ${tx.hash}`);
    console.log(`Block Hash: ${tx.blockHash}`);
    console.log(`Block Number: ${hexToDecimal(tx.blockNumber)} (${tx.blockNumber})`);
    console.log(`Transaction Index: ${hexToDecimal(tx.transactionIndex)} (${tx.transactionIndex})`);
    console.log(`Chain ID: ${hexToDecimal(tx.chainId)} - ${getChainName(tx.chainId)}`);
    console.log(`Transaction Type: ${getTransactionType(tx.type)}`);

    console.log("\n👥 ADDRESSES:");
    console.log(`From: ${tx.from}`);
    console.log(`To: ${tx.to}`);

    console.log("\n💰 VALUE & AMOUNTS:");
    console.log(`Value: ${hexToEther(tx.value)} ETH (${hexToDecimal(tx.value)} wei)`);
    console.log(`Nonce: ${hexToDecimal(tx.nonce)} (${tx.nonce})`);

    console.log("\n⛽ GAS INFORMATION:");
    console.log(`Gas Limit: ${hexToDecimal(tx.gas).toLocaleString()} units (${tx.gas})`);
    console.log(`Gas Price: ${hexToGwei(tx.gasPrice)} Gwei (${hexToDecimal(tx.gasPrice)} wei)`);
    console.log(`Max Fee Per Gas: ${hexToGwei(tx.maxFeePerGas)} Gwei (${hexToDecimal(tx.maxFeePerGas)} wei)`);
    console.log(`Max Priority Fee Per Gas: ${hexToGwei(tx.maxPriorityFeePerGas)} Gwei (${hexToDecimal(tx.maxPriorityFeePerGas)} wei)`);

    // Calculate estimated transaction fee
    const estimatedFee = hexToDecimal(tx.gas) * hexToDecimal(tx.gasPrice);
    console.log(`Estimated Max Fee: ${estimatedFee / Math.pow(10, 18)} ETH (${estimatedFee} wei)`);

    console.log("\n📝 TRANSACTION DATA:");
    console.log(`Input Data: ${tx.input === "0x" ? "No data (simple transfer)" : tx.input}`);
    console.log(`Access List: ${tx.accessList.length === 0 ? "Empty" : JSON.stringify(tx.accessList)}`);

    console.log("\n🔐 SIGNATURE:");
    console.log(`V: ${hexToDecimal(tx.v)} (${tx.v})`);
    console.log(`R: ${tx.r}`);
    console.log(`S: ${tx.s}`);
    console.log(`Y Parity: ${hexToDecimal(tx.yParity)} (${tx.yParity})`);

    console.log("\n📊 SUMMARY:");
    console.log(`This is a ${getTransactionType(tx.type)} on ${getChainName(tx.chainId)}`);
    console.log(`Transferring ${hexToEther(tx.value)} ETH from ${tx.from.slice(0, 8)}... to ${tx.to.slice(0, 8)}...`);
    console.log(`Block: ${hexToDecimal(tx.blockNumber)} | Nonce: ${hexToDecimal(tx.nonce)} | Gas: ${hexToDecimal(tx.gas).toLocaleString()}`);

    return {
        blockNumber: hexToDecimal(tx.blockNumber),
        transactionIndex: hexToDecimal(tx.transactionIndex),
        chainId: hexToDecimal(tx.chainId),
        chainName: getChainName(tx.chainId),
        transactionType: getTransactionType(tx.type),
        valueInEth: hexToEther(tx.value),
        valueInWei: hexToDecimal(tx.value),
        nonce: hexToDecimal(tx.nonce),
        gasLimit: hexToDecimal(tx.gas),
        gasPriceGwei: hexToGwei(tx.gasPrice),
        gasPriceWei: hexToDecimal(tx.gasPrice),
        maxFeePerGasGwei: hexToGwei(tx.maxFeePerGas),
        maxPriorityFeePerGasGwei: hexToGwei(tx.maxPriorityFeePerGas),
        estimatedMaxFeeEth: (hexToDecimal(tx.gas) * hexToDecimal(tx.gasPrice)) / Math.pow(10, 18),
        isSimpleTransfer: tx.input === "0x",
        signature: {
            v: hexToDecimal(tx.v),
            r: tx.r,
            s: tx.s,
            yParity: hexToDecimal(tx.yParity)
        }
    };
}

// Add this to your existing script to get timestamp
async function getBlockTimestamp(blockNumber, apiKey) {
    const url = `https://api-sepolia.etherscan.io/api?module=proxy&action=eth_getBlockByNumber&tag=${blockNumber}&boolean=true&apikey=${apiKey}`;

    try {
        const response = await fetch(url);
        const data = await response.json();

        if (data.result && data.result.timestamp) {
            const timestamp = parseInt(data.result.timestamp, 16);
            const date = new Date(timestamp * 1000);

            console.log("\n⏰ TRANSACTION TIMING:");
            console.log(`Block Timestamp: ${timestamp} (Unix)`);
            console.log(`Transaction Date: ${date.toISOString()}`);
            console.log(`Transaction Date (Local): ${date.toLocaleString()}`);
            console.log(`Days ago: ${Math.floor((Date.now() - date.getTime()) / (1000 * 60 * 60 * 24))}`);

            return {
                unix: timestamp,
                iso: date.toISOString(),
                local: date.toLocaleString(),
                daysAgo: Math.floor((Date.now() - date.getTime()) / (1000 * 60 * 60 * 24))
            };
        }
    } catch (error) {
        console.error("Error fetching block timestamp:", error);
    }
}

// Usage example:


// Run the decoder
const decodedData = decodeTransaction(transactionData);

// You can also access individual decoded values
console.log("\n🎯 QUICK ACCESS EXAMPLES:");
console.log(`Block Number: ${decodedData.blockNumber}`);
console.log(`Value in ETH: ${decodedData.valueInEth}`);
console.log(`Gas Price in Gwei: ${decodedData.gasPriceGwei}`);
console.log(`Chain: ${decodedData.chainName}`);
console.log(`Is Simple Transfer: ${decodedData.isSimpleTransfer}`);
getBlockTimestamp("0x870ef5", "IGTXZ7A1HFGBXZBZJBU3EP4V88SKN8J3P1");













// Mainnet API configuration
const MAINNET_CONFIG = {
    apiKey: "YOUR_NEW_API_KEY_HERE", // Replace with your actual API key
    baseUrl: "https://api.etherscan.io/api"
};

// Get transaction by hash (mainnet)
function getMainnetTransaction(txHash) {
    return `${MAINNET_CONFIG.baseUrl}?module=proxy&action=eth_getTransactionByHash&txhash=${txHash}&apikey=${MAINNET_CONFIG.apiKey}`;
}

// Get block details with timestamp (mainnet)
function getMainnetBlock(blockNumber) {
    return `${MAINNET_CONFIG.baseUrl}?module=proxy&action=eth_getBlockByNumber&tag=${blockNumber}&boolean=false&apikey=${MAINNET_CONFIG.apiKey}`;
}

// Get transaction list for address (includes timestamp)
function getMainnetTransactionList(address, startBlock = 0, endBlock = 99999999) {
    return `${MAINNET_CONFIG.baseUrl}?module=account&action=txlist&address=${address}&startblock=${startBlock}&endblock=${endBlock}&sort=desc&apikey=${MAINNET_CONFIG.apiKey}`;
}

// Example usage:
console.log("Mainnet Transaction URL:");
console.log(getMainnetTransaction("0x...your_tx_hash..."));

console.log("\nMainnet Address Transactions URL:");
console.log(getMainnetTransactionList("0x...your_address..."));











// BNB Chain (BSC) API configuration
const BNB_CONFIG = {
    mainnet: {
        apiKey: "YOUR_BSCSCAN_API_KEY_HERE", // Replace with your actual API key
        baseUrl: "https://api.bscscan.com/api",
        chainId: "0x38", // BSC Mainnet
        chainName: "BNB Smart Chain"
    },
    testnet: {
        apiKey: "YOUR_BSCSCAN_API_KEY_HERE", // Same key works for testnet
        baseUrl: "https://api-testnet.bscscan.com/api",
        chainId: "0x61", // BSC Testnet
        chainName: "BNB Smart Chain Testnet"
    }
};

// Get BNB transaction by hash
function getBNBTransaction(txHash, isTestnet = false) {
    const config = isTestnet ? BNB_CONFIG.testnet : BNB_CONFIG.mainnet;
    return `${config.baseUrl}?module=proxy&action=eth_getTransactionByHash&txhash=${txHash}&apikey=${config.apiKey}`;
}

// Get BNB block details with timestamp
function getBNBBlock(blockNumber, isTestnet = false) {
    const config = isTestnet ? BNB_CONFIG.testnet : BNB_CONFIG.mainnet;
    return `${config.baseUrl}?module=proxy&action=eth_getBlockByNumber&tag=${blockNumber}&boolean=false&apikey=${config.apiKey}`;
}

// Get BNB transaction list for address (includes timestamp)
function getBNBTransactionList(address, startBlock = 0, endBlock = 99999999, isTestnet = false) {
    const config = isTestnet ? BNB_CONFIG.testnet : BNB_CONFIG.mainnet;
    return `${config.baseUrl}?module=account&action=txlist&address=${address}&startblock=${startBlock}&endblock=${endBlock}&sort=desc&apikey=${config.apiKey}`;
}

// Complete BNB transaction decoder
async function decodeBNBTransaction(txHash, isTestnet = false) {
    const config = isTestnet ? BNB_CONFIG.testnet : BNB_CONFIG.mainnet;

    try {
        // Get transaction details
        const txUrl = getBNBTransaction(txHash, isTestnet);
        const txResponse = await fetch(txUrl);
        const txData = await txResponse.json();

        if (!txData.result) {
            console.error("Transaction not found");
            return;
        }

        const tx = txData.result;

        // Get block timestamp
        const blockUrl = getBNBBlock(tx.blockNumber, isTestnet);
        const blockResponse = await fetch(blockUrl);
        const blockData = await blockResponse.json();

        const timestamp = parseInt(blockData.result.timestamp, 16);
        const date = new Date(timestamp * 1000);

        console.log("🔍 BNB CHAIN TRANSACTION DECODER");
        console.log("=".repeat(50));

        console.log("\n📋 BASIC INFORMATION:");
        console.log(`Network: ${config.chainName}`);
        console.log(`Transaction Hash: ${tx.hash}`);
        console.log(`Block Number: ${parseInt(tx.blockNumber, 16)} (${tx.blockNumber})`);
        console.log(`Block Hash: ${tx.blockHash}`);

        console.log("\n⏰ TIMESTAMP:");
        console.log(`Unix Timestamp: ${timestamp}`);
        console.log(`UTC Date: ${date.toISOString().replace('T', ' ').slice(0, 19)}`);
        console.log(`Local Date: ${date.toLocaleString()}`);

        console.log("\n👥 ADDRESSES:");
        console.log(`From: ${tx.from}`);
        console.log(`To: ${tx.to}`);

        console.log("\n💰 VALUE:");
        const valueInBNB = parseInt(tx.value, 16) / Math.pow(10, 18);
        console.log(`Value: ${valueInBNB} BNB (${parseInt(tx.value, 16)} wei)`);

        console.log("\n⛽ GAS:");
        console.log(`Gas Limit: ${parseInt(tx.gas, 16).toLocaleString()} units`);
        console.log(`Gas Price: ${parseInt(tx.gasPrice, 16) / Math.pow(10, 9)} Gwei`);

        const estimatedFee = parseInt(tx.gas, 16) * parseInt(tx.gasPrice, 16);
        console.log(`Estimated Fee: ${estimatedFee / Math.pow(10, 18)} BNB`);

        console.log("\n📝 DATA:");
        console.log(`Input: ${tx.input === "0x" ? "No data (simple transfer)" : tx.input}`);
        console.log(`Nonce: ${parseInt(tx.nonce, 16)}`);

        return {
            hash: tx.hash,
            blockNumber: parseInt(tx.blockNumber, 16),
            timestamp: timestamp,
            date: date.toISOString(),
            from: tx.from,
            to: tx.to,
            valueBNB: valueInBNB,
            gasLimit: parseInt(tx.gas, 16),
            gasPriceGwei: parseInt(tx.gasPrice, 16) / Math.pow(10, 9),
            estimatedFeeBNB: estimatedFee / Math.pow(10, 18),
            network: config.chainName
        };

    } catch (error) {
        console.error("Error fetching BNB transaction:", error);
    }
}

// Usage examples:
console.log("🌐 BNB CHAIN API ENDPOINTS:");
console.log("Mainnet Transaction:", getBNBTransaction("0x...your_tx_hash..."));
console.log("Testnet Transaction:", getBNBTransaction("0x...your_tx_hash...", true));
console.log("Address Transactions:", getBNBTransactionList("0x...your_address..."));

// Example: Decode a BNB transaction
// decodeBNBTransaction("0x...your_bnb_transaction_hash...");


























// Solana RPC configuration
const SOLANA_CONFIG = {
    // Free public endpoints (rate limited)
    publicRPC: "https://api.mainnet-beta.solana.com",
    devnetRPC: "https://api.devnet.solana.com",
    testnetRPC: "https://api.testnet.solana.com",

    // Premium providers (require API keys)
    providers: {
        helius: "https://rpc.helius.xyz/?api-key=YOUR_HELIUS_API_KEY",
        quicknode: "https://YOUR_ENDPOINT.quiknode.pro/YOUR_API_KEY/",
        alchemy: "https://solana-mainnet.g.alchemy.com/v2/YOUR_API_KEY"
    }
};

// Solana transaction decoder
async function decodeSolanaTransaction(txSignature, useDevnet = false) {
    const rpcUrl = useDevnet ? SOLANA_CONFIG.devnetRPC : SOLANA_CONFIG.publicRPC;

    try {
        // Get transaction details
        const response = await fetch(rpcUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                jsonrpc: "2.0",
                id: 1,
                method: "getTransaction",
                params: [
                    txSignature,
                    {
                        encoding: "json",
                        maxSupportedTransactionVersion: 0
                    }
                ]
            })
        });

        const data = await response.json();

        if (!data.result) {
            console.error("Transaction not found or error:", data.error);
            return;
        }

        const tx = data.result;
        const meta = tx.meta;
        const transaction = tx.transaction;

        console.log("🔍 SOLANA TRANSACTION DECODER");
        console.log("=".repeat(50));

        console.log("\n📋 BASIC INFORMATION:");
        console.log(`Network: ${useDevnet ? 'Solana Devnet' : 'Solana Mainnet'}`);
        console.log(`Transaction Signature: ${txSignature}`);
        console.log(`Slot: ${tx.slot}`);
        console.log(`Block Time: ${tx.blockTime}`);

        // Convert block time to readable date
        if (tx.blockTime) {
            const date = new Date(tx.blockTime * 1000);
            console.log(`UTC Date: ${date.toISOString().replace('T', ' ').slice(0, 19)}`);
            console.log(`Local Date: ${date.toLocaleString()}`);

            // Time ago calculation
            const now = new Date('2025-07-27T04:29:00Z');
            const diffMs = now.getTime() - date.getTime();
            const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
            const diffHours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            console.log(`Time Ago: ${diffDays} days, ${diffHours} hours ago`);
        }

        console.log("\n✅ TRANSACTION STATUS:");
        console.log(`Status: ${meta.err ? 'Failed' : 'Success'}`);
        if (meta.err) {
            console.log(`Error: ${JSON.stringify(meta.err)}`);
        }

        console.log("\n💰 SOL BALANCE CHANGES:");
        const preBalances = meta.preBalances;
        const postBalances = meta.postBalances;
        const accounts = transaction.message.accountKeys;

        for (let i = 0; i < accounts.length; i++) {
            const balanceChange = (postBalances[i] - preBalances[i]) / 1e9; // Convert lamports to SOL
            if (balanceChange !== 0) {
                console.log(`${accounts[i]}: ${balanceChange > 0 ? '+' : ''}${balanceChange} SOL`);
            }
        }

        console.log("\n⛽ FEES:");
        console.log(`Transaction Fee: ${meta.fee / 1e9} SOL (${meta.fee} lamports)`);

        console.log("\n📝 INSTRUCTIONS:");
        transaction.message.instructions.forEach((instruction, index) => {
            console.log(`Instruction ${index + 1}:`);
            console.log(`  Program: ${accounts[instruction.programIdIndex]}`);
            console.log(`  Accounts: ${instruction.accounts.length} accounts involved`);
            console.log(`  Data: ${instruction.data}`);
        });

        console.log("\n🔐 SIGNATURES:");
        transaction.signatures.forEach((sig, index) => {
            console.log(`Signature ${index + 1}: ${sig}`);
        });

        if (meta.logMessages && meta.logMessages.length > 0) {
            console.log("\n📄 LOG MESSAGES:");
            meta.logMessages.forEach((log, index) => {
                console.log(`${index + 1}: ${log}`);
            });
        }

        return {
            signature: txSignature,
            slot: tx.slot,
            blockTime: tx.blockTime,
            date: tx.blockTime ? new Date(tx.blockTime * 1000).toISOString() : null,
            status: meta.err ? 'Failed' : 'Success',
            fee: meta.fee / 1e9,
            balanceChanges: accounts.map((account, i) => ({
                account,
                change: (postBalances[i] - preBalances[i]) / 1e9
            })).filter(change => change.change !== 0),
            network: useDevnet ? 'Solana Devnet' : 'Solana Mainnet'
        };

    } catch (error) {
        console.error("Error fetching Solana transaction:", error);
    }
}

// Usage example:
// decodeSolanaTransaction("your_solana_transaction_signature_here");
















// TON Network API configuration
const TON_CONFIG = {
    // Official TON API endpoints
    mainnet: {
        baseUrl: "https://tonapi.io/v2",
        name: "TON Mainnet"
    },
    testnet: {
        baseUrl: "https://testnet.tonapi.io/v2",
        name: "TON Testnet"
    },

    // Alternative endpoints
    alternatives: {
        toncenter: "https://toncenter.com/api/v2",
        tonhub: "https://mainnet-v4.tonhubapi.com"
    }
};

// TON transaction decoder
async function decodeTONTransaction(txHash, isTestnet = false) {
    const config = isTestnet ? TON_CONFIG.testnet : TON_CONFIG.mainnet;

    try {
        console.log("🔍 TON TRANSACTION DECODER");
        console.log("=".repeat(50));
        console.log(`Current Time: 2025-07-27 04:30:43 UTC`);
        console.log(`User: rayhanalmim`);
        console.log(`Network: ${config.name}`);

        // Get transaction details
        const response = await fetch(`${config.baseUrl}/blockchain/transactions/${txHash}`);

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();

        console.log("\n📋 BASIC INFORMATION:");
        console.log(`Transaction Hash: ${data.hash || txHash}`);
        console.log(`Block: ${data.mc_block_seqno || 'N/A'}`);
        console.log(`Logical Time: ${data.lt || 'N/A'}`);
        console.log(`Account: ${data.account?.address || 'N/A'}`);

        console.log("\n⏰ TIMESTAMP:");
        if (data.utime) {
            const timestamp = data.utime;
            const date = new Date(timestamp * 1000);

            console.log(`Unix Timestamp: ${timestamp}`);
            console.log(`UTC Date: ${date.toISOString().replace('T', ' ').slice(0, 19)}`);
            console.log(`Local Date: ${date.toLocaleString()}`);

            // Calculate time difference
            const currentTime = new Date('2025-07-27T04:30:43Z');
            const diffMs = currentTime.getTime() - date.getTime();
            const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
            const diffHours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

            console.log(`Time Ago: ${diffDays} days, ${diffHours} hours, ${diffMins} minutes ago`);
        }

        console.log("\n✅ TRANSACTION STATUS:");
        console.log(`Success: ${data.success !== false ? 'Yes' : 'No'}`);
        console.log(`Aborted: ${data.aborted || false}`);
        console.log(`Destroyed: ${data.destroyed || false}`);

        console.log("\n💰 VALUE TRANSFERS:");
        if (data.in_msg && data.in_msg.value) {
            const inValue = parseInt(data.in_msg.value) / 1e9; // Convert nanotons to TON
            console.log(`Incoming: ${inValue} TON`);
            console.log(`From: ${data.in_msg.source?.address || 'N/A'}`);
            console.log(`To: ${data.in_msg.destination?.address || 'N/A'}`);
        }

        if (data.out_msgs && data.out_msgs.length > 0) {
            console.log("\nOutgoing Messages:");
            data.out_msgs.forEach((msg, index) => {
                if (msg.value) {
                    const outValue = parseInt(msg.value) / 1e9;
                    console.log(`  ${index + 1}: ${outValue} TON to ${msg.destination?.address || 'N/A'}`);
                }
            });
        }

        console.log("\n⛽ FEES:");
        if (data.total_fees) {
            const totalFees = parseInt(data.total_fees) / 1e9;
            console.log(`Total Fees: ${totalFees} TON`);
        }

        if (data.compute_phase) {
            console.log("\n🔧 COMPUTE PHASE:");
            console.log(`Success: ${data.compute_phase.success || false}`);
            console.log(`Gas Used: ${data.compute_phase.gas_used || 0}`);
            console.log(`Gas Limit: ${data.compute_phase.gas_limit || 0}`);
            if (data.compute_phase.gas_fees) {
                console.log(`Gas Fees: ${parseInt(data.compute_phase.gas_fees) / 1e9} TON`);
            }
        }

        console.log("\n📝 TRANSACTION DATA:");
        console.log(`Transaction Type: ${data.transaction_type || 'N/A'}`);
        console.log(`Workchain: ${data.account?.workchain || 0}`);

        if (data.in_msg && data.in_msg.msg_data) {
            console.log(`Message Data: ${data.in_msg.msg_data.text || 'Binary data'}`);
        }

        return {
            hash: data.hash || txHash,
            timestamp: data.utime,
            date: data.utime ? new Date(data.utime * 1000).toISOString() : null,
            success: data.success !== false,
            block: data.mc_block_seqno,
            account: data.account?.address,
            incomingValue: data.in_msg?.value ? parseInt(data.in_msg.value) / 1e9 : 0,
            totalFees: data.total_fees ? parseInt(data.total_fees) / 1e9 : 0,
            network: config.name,
            gasUsed: data.compute_phase?.gas_used || 0
        };

    } catch (error) {
        console.error("Error fetching TON transaction:", error);

        // Try alternative endpoint
        console.log("\n🔄 Trying alternative endpoint...");
        return await decodeTONTransactionAlternative(txHash, isTestnet);
    }
}

// Alternative TON API using TONCenter
async function decodeTONTransactionAlternative(txHash, isTestnet = false) {
    const baseUrl = isTestnet
        ? "https://testnet.toncenter.com/api/v2"
        : "https://toncenter.com/api/v2";

    try {
        const response = await fetch(`${baseUrl}/getTransactions?address=${txHash}&limit=1`);
        const data = await response.json();

        if (data.ok && data.result.length > 0) {
            const tx = data.result[0];

            console.log("\n📋 ALTERNATIVE TON API RESULT:");
            console.log(`Transaction ID: ${tx.transaction_id?.hash || txHash}`);
            console.log(`Unix Time: ${tx.utime}`);
            console.log(`Logical Time: ${tx.transaction_id?.lt}`);

            if (tx.utime) {
                const date = new Date(tx.utime * 1000);
                console.log(`UTC Date: ${date.toISOString().replace('T', ' ').slice(0, 19)}`);
            }

            return {
                hash: tx.transaction_id?.hash || txHash,
                timestamp: tx.utime,
                logicalTime: tx.transaction_id?.lt,
                network: isTestnet ? "TON Testnet" : "TON Mainnet"
            };
        }
    } catch (error) {
        console.error("Alternative TON API also failed:", error);
    }
}

// Get TON account transactions
async function getTONAccountTransactions(address, limit = 10, isTestnet = false) {
    const config = isTestnet ? TON_CONFIG.testnet : TON_CONFIG.mainnet;

    try {
        const response = await fetch(`${config.baseUrl}/blockchain/accounts/${address}/transactions?limit=${limit}`);
        const data = await response.json();

        console.log(`\n📜 TON ACCOUNT TRANSACTIONS (${config.name}):`);
        console.log(`Address: ${address}`);
        console.log(`Showing last ${limit} transactions:`);

        if (data.transactions && data.transactions.length > 0) {
            data.transactions.forEach((tx, index) => {
                const date = tx.utime ? new Date(tx.utime * 1000).toISOString().slice(0, 19) : 'N/A';
                const value = tx.in_msg?.value ? (parseInt(tx.in_msg.value) / 1e9).toFixed(4) : '0';

                console.log(`${index + 1}. ${tx.hash} | ${date} | ${value} TON`);
            });
        }

        return data.transactions || [];
    } catch (error) {
        console.error("Error fetching TON account transactions:", error);
    }
}

// Complete TON decoder with multiple methods
async function completeTONDecoder(identifier, type = 'transaction', isTestnet = false) {
    console.log(`\n🔍 TON BLOCKCHAIN DECODER`);
    console.log(`Current Time: 2025-07-27 04:30:43 UTC`);
    console.log(`User: rayhanalmim`);
    console.log(`Network: ${isTestnet ? 'TON Testnet' : 'TON Mainnet'}`);
    console.log("=".repeat(50));

    switch (type.toLowerCase()) {
        case 'transaction':
        case 'tx':
            return await decodeTONTransaction(identifier, isTestnet);

        case 'account':
        case 'address':
            return await getTONAccountTransactions(identifier, 10, isTestnet);

        default:
            console.error("Type must be 'transaction' or 'account'");
    }
}

// Usage examples:
console.log("🌐 TON API ENDPOINTS:");
console.log("Mainnet Transaction:", `${TON_CONFIG.mainnet.baseUrl}/blockchain/transactions/{hash}`);
console.log("Testnet Transaction:", `${TON_CONFIG.testnet.baseUrl}/blockchain/transactions/{hash}`);
console.log("Account Transactions:", `${TON_CONFIG.mainnet.baseUrl}/blockchain/accounts/{address}/transactions`);

// Example usage:
// completeTONDecoder("your_ton_transaction_hash", "transaction");
// completeTONDecoder("your_ton_address", "account");




