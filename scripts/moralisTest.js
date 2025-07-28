/**
 * Moralis API Test Script
 * 
 * This script demonstrates how to use the Moralis API to fetch transaction data
 */

const axios = require('axios');
require('dotenv').config(); // Load .env file

// Configuration
const API_BASE_URL = 'http://localhost:3000/api';
const TEST_BSC_TRANSACTION = {
  // BSC testnet transaction
  network: 1, // 1 = BSC
  txHash: '0x9d0cfe775d48fea6d4d9111d726b5403da77c2dffbc60ed24dedfb92feeaac40',
  testnet: true
};

const TEST_ETH_WALLET = {
  // Ethereum wallet address
  network: 0, // 0 = ETH
  address: '0x1f9090aaE28b8a3dCeaDf281B0F12828e676c326',
  testnet: false,
  limit: 5
};

// Helper function to make API calls
async function callApi(endpoint, method = 'GET', data = null) {
  try {
    const config = {
      method,
      url: `${API_BASE_URL}${endpoint}`,
      headers: {
        'Content-Type': 'application/json'
      }
    };
    
    if (data && (method === 'POST' || method === 'PUT')) {
      config.data = data;
    }
    
    const response = await axios(config);
    return response.data;
  } catch (error) {
    console.error('API Error:', error.response?.data || error.message);
    return { success: false, error: error.response?.data || error.message };
  }
}

// Main function
async function main() {
  console.log('🔍 Moralis API Test');
  console.log('===================');
  
  // 1. Get BSC transaction details
  console.log(`\n🔄 Getting BSC transaction details for ${TEST_BSC_TRANSACTION.txHash}...`);
  const txDetails = await callApi(
    `/transaction/${TEST_BSC_TRANSACTION.network}/${TEST_BSC_TRANSACTION.txHash}?testnet=${TEST_BSC_TRANSACTION.testnet}`
  );
  
  if (txDetails.success) {
    console.log('\nTransaction Details:');
    console.log(`Hash: ${txDetails.data.hash}`);
    console.log(`Network: ${txDetails.data.networkName}`);
    console.log(`Block Number: ${txDetails.data.block_number}`);
    console.log(`From: ${txDetails.data.from_address}`);
    console.log(`To: ${txDetails.data.to_address}`);
    console.log(`Value: ${txDetails.data.value}`);
    console.log(`Gas: ${txDetails.data.gas}`);
    console.log(`Gas Price: ${txDetails.data.gas_price}`);
    console.log(`Explorer: ${txDetails.data.explorerUrl}`);
  } else {
    console.error('Failed to get transaction details:', txDetails.error);
  }
  
  // 2. Get verbose transaction details
  console.log(`\n🔎 Getting detailed transaction information...`);
  const verboseTx = await callApi(
    `/transaction/${TEST_BSC_TRANSACTION.network}/${TEST_BSC_TRANSACTION.txHash}?testnet=${TEST_BSC_TRANSACTION.testnet}&verbose=true`
  );
  
  if (verboseTx.success) {
    console.log('\nVerbose Transaction Details:');
    console.log(`Hash: ${verboseTx.data.hash}`);
    console.log(`Network: ${verboseTx.data.networkName}`);
    console.log(`Block Number: ${verboseTx.data.block_number}`);
    console.log(`Block Timestamp: ${verboseTx.data.block_timestamp}`);
    console.log(`From: ${verboseTx.data.from_address}`);
    console.log(`To: ${verboseTx.data.to_address}`);
    console.log(`Value: ${verboseTx.data.value}`);
    
    if (verboseTx.data.decoded_call) {
      console.log('\nDecoded Function Call:');
      console.log(`Function: ${verboseTx.data.decoded_call.function_name || 'N/A'}`);
      console.log(`Signature: ${verboseTx.data.decoded_call.signature || 'N/A'}`);
    }
  } else {
    console.error('Failed to get verbose transaction details:', verboseTx.error);
  }
  
  // 3. Get wallet transactions
  console.log(`\n📋 Getting wallet transactions for ${TEST_ETH_WALLET.address}...`);
  const walletTx = await callApi(
    `/transaction/wallet/${TEST_ETH_WALLET.network}/${TEST_ETH_WALLET.address}?testnet=${TEST_ETH_WALLET.testnet}&limit=${TEST_ETH_WALLET.limit}`
  );
  
  if (walletTx.success && walletTx.data.result?.length > 0) {
    console.log(`\nFound ${walletTx.data.result.length} transactions:`);
    
    walletTx.data.result.forEach((tx, i) => {
      console.log(`\n${i+1}. ${tx.hash.substring(0, 10)}...`);
      console.log(`   Block: ${tx.block_number}`);
      console.log(`   From: ${tx.from_address.substring(0, 8)}...`);
      console.log(`   To: ${tx.to_address?.substring(0, 8) || 'Contract creation'}...`);
      console.log(`   Value: ${tx.value}`);
      console.log(`   Date: ${new Date(tx.block_timestamp).toLocaleString()}`);
    });
  } else {
    console.error('Failed to get wallet transactions:', walletTx.error || 'No transactions found');
  }
}

// Run the main function
main().catch(console.error); 