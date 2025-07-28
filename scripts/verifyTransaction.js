/**
 * Transaction Verification Test Script
 * 
 * This script demonstrates how to use the Deposit API to verify transactions
 */

const axios = require('axios');

// Configuration
const API_BASE_URL = 'http://localhost:3000/api';
const TEST_TRANSACTION = {
  // Test Sepolia transaction
  network: 0, // 0 = ETH, 1 = BSC, 2 = SOL
  txHash: 'de16cd4a823b593fd0c296a3998cd49afb9597067f5bd6985bb54cca54b883bc', // From script.js example
  amount: '0.001', // Amount in ETH
  userId: 'test123'
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
  console.log('🔍 Transaction Verification Test');
  console.log('===============================');
  
  // 1. Get detailed transaction info without creating a deposit
  console.log(`\n📊 Getting transaction details for ${TEST_TRANSACTION.txHash} on network ${TEST_TRANSACTION.network}...`);
  const txDetails = await callApi(`/deposit/transaction/${TEST_TRANSACTION.network}/${TEST_TRANSACTION.txHash}`);
  
  if (txDetails.success) {
    console.log('\nTransaction Details:');
    console.log(`Hash: ${txDetails.data.hash}`);
    console.log(`Network: ${txDetails.data.networkName}`);
    console.log(`Block: ${txDetails.data.blockNumber}`);
    console.log(`From: ${txDetails.data.from}`);
    console.log(`To: ${txDetails.data.to}`);
    console.log(`Value: ${txDetails.data.value} ${txDetails.data.network.includes('Ethereum') ? 'ETH' : 'BNB'}`);
    console.log(`Explorer: ${txDetails.data.explorerUrl}`);
    
    if (txDetails.data.timestamp) {
      const date = new Date(txDetails.data.timestamp * 1000);
      console.log(`Timestamp: ${date.toISOString()}`);
    }
  } else {
    console.error('Failed to get transaction details:', txDetails.error);
    process.exit(1);
  }
  
  // 2. Submit deposit for verification
  console.log('\n💰 Creating deposit verification request...');
  const depositRequest = await callApi('/deposit/verify', 'POST', {
    userId: TEST_TRANSACTION.userId,
    transactionHash: TEST_TRANSACTION.txHash,
    amount: TEST_TRANSACTION.amount,
    network: TEST_TRANSACTION.network
  });
  
  if (depositRequest.success) {
    console.log('\nDeposit Request Created:');
    console.log(`Deposit ID: ${depositRequest.data.depositId}`);
    console.log(`Status: ${depositRequest.data.status}`);
    console.log(`Explorer: ${depositRequest.data.explorerUrl}`);
  } else {
    console.error('Failed to create deposit request:', depositRequest.error);
  }
  
  // 3. Check deposit status (may still be pending at this point)
  console.log('\n🔄 Checking deposit status...');
  await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds
  
  const depositStatus = await callApi(`/deposit/status/${TEST_TRANSACTION.txHash}`);
  
  if (depositStatus.success) {
    console.log('\nCurrent Deposit Status:');
    console.log(`Status: ${depositStatus.data.status}`);
    console.log(`Amount: ${depositStatus.data.depositAmount}`);
    console.log(`Created: ${new Date(depositStatus.data.createdAt).toISOString()}`);
    console.log(`Updated: ${new Date(depositStatus.data.updatedAt).toISOString()}`);
    
    // If verification completed
    if (depositStatus.data.verificationTimestamp) {
      console.log(`Verified: ${new Date(depositStatus.data.verificationTimestamp).toISOString()}`);
    }
  } else {
    console.error('Failed to get deposit status:', depositStatus.error);
  }
  
  // 4. Get all user deposits
  console.log('\n📋 Getting all deposits for user...');
  const userDeposits = await callApi(`/deposit/user/${TEST_TRANSACTION.userId}`);
  
  if (userDeposits.success) {
    console.log(`\nFound ${userDeposits.count} deposits:`);
    userDeposits.data.forEach((deposit, i) => {
      console.log(`\n${i+1}. ${deposit.transactionHash.substring(0, 10)}...`);
      console.log(`   Network: ${deposit.networkName}`);
      console.log(`   Amount: ${deposit.depositAmount}`);
      console.log(`   Status: ${deposit.status}`);
      console.log(`   Date: ${new Date(deposit.createdAt).toLocaleString()}`);
    });
  } else {
    console.error('Failed to get user deposits:', userDeposits.error);
  }
}

// Run the main function
main().catch(console.error); 