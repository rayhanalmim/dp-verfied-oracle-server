function gettransaction(chain, address) {
 
    const balance = fetch(`https://api.etherscan.io/v2/api?
     chainid=${chain}
     &module=account
     &action=balance
     &address=0xb5d85cbf7cb3ee0d56b3bb207d5fc4b82f43f511
     &tag=latest&apikey=YourApiKeyToken`)
     
    return balance
}







