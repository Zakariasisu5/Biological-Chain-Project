# 🔧 Wallet Connection Fix Guide

## 🚨 **Current Issue**
The wallet connection is failing with error: `could not coalesce error` and `UNKNOWN_ERROR`. This is typically caused by:

1. **Contract not deployed** to the local Hardhat node
2. **MetaMask not configured** for the local network
3. **Wrong contract address** in environment variables

## 🛠️ **Step-by-Step Fix**

### **Step 1: Deploy the Contract**

Since the Hardhat node is running, we need to deploy the contract to it:

1. **Open a new terminal** (keep the Hardhat node running in the first terminal)
2. **Run the deployment**:
   ```bash
   npx hardhat run scripts/quick-deploy.cjs --network localhost
   ```

### **Step 2: Configure MetaMask**

1. **Open MetaMask** in your browser
2. **Click the network dropdown** (top of MetaMask)
3. **Click "Add Network"** or "Custom RPC"
4. **Enter these details**:
   - **Network Name**: `Hardhat Local`
   - **RPC URL**: `http://127.0.0.1:8545`
   - **Chain ID**: `31337`
   - **Currency Symbol**: `ETH`
   - **Block Explorer URL**: (leave empty)

5. **Save the network** and switch to it

### **Step 3: Import Test Account**

1. **In MetaMask**, click the account icon (top right)
2. **Click "Import Account"**
3. **Select "Private Key"**
4. **Enter this private key**:
   ```
   0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
   ```
5. **Click "Import"**

This account has 10,000 ETH for testing.

### **Step 4: Test the Connection**

1. **Refresh your browser** (http://localhost:3000)
2. **Go to the Blockchain page**
3. **Click "Connect MetaMask"**
4. **Approve the connection** in MetaMask
5. **You should see**: "Wallet Connected" with your account address

## 🔍 **Troubleshooting**

### **If you still get errors:**

1. **Check the browser console** for detailed error messages
2. **Verify MetaMask is on the correct network** (Chain ID: 31337)
3. **Make sure the Hardhat node is running** (should show accounts in terminal)
4. **Check if the contract was deployed** (look for contract address in deployment output)

### **Common Error Messages:**

- **"MetaMask not detected"**: Install MetaMask browser extension
- **"User rejected connection"**: Click "Connect" again and approve in MetaMask
- **"Network error"**: Check MetaMask network settings
- **"Contract not deployed"**: Run the deployment script first

## 📋 **Quick Checklist**

- [ ] Hardhat node is running (showing accounts)
- [ ] Contract is deployed (got contract address)
- [ ] MetaMask has localhost network configured
- [ ] MetaMask is connected to localhost network
- [ ] Test account is imported in MetaMask
- [ ] Browser is refreshed after deployment

## 🎯 **Expected Result**

After following these steps, you should see:
- ✅ Wallet connection successful
- ✅ Account address displayed
- ✅ Network shows "Chain ID: 31337"
- ✅ Balance shows ETH amount
- ✅ Can submit records to blockchain
- ✅ Can load records from blockchain

## 🚀 **Next Steps**

Once the wallet is connected:
1. **Add a health record** using the form
2. **Click "Submit to Blockchain"**
3. **Wait for transaction confirmation**
4. **Click "Load My Records"** to see your data
5. **Verify the record appears** in the table

The application will now work with real blockchain data! 🎉
