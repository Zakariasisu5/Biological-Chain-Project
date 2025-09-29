# BioLogic Chain - Blockchain Deployment Guide

This guide will help you deploy and integrate the BioLogic Chain smart contracts for both localhost development and production environments.

## 🚀 Quick Start

### Prerequisites

1. **Node.js** (v18 or higher)
2. **MetaMask** browser extension
3. **Git** for version control
4. **Ethereum wallet** with test ETH (for testnets)

### Environment Setup

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd biologic-chain-main
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Create environment file:**
   ```bash
   cp .env.example .env
   ```

4. **Configure environment variables:**
   ```env
   # For production deployment
   PRIVATE_KEY=your_private_key_here
   SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_INFURA_KEY
   MAINNET_RPC_URL=https://mainnet.infura.io/v3/YOUR_INFURA_KEY
   ETHERSCAN_API_KEY=your_etherscan_api_key
   
   # For localhost development
   REACT_APP_CONTRACT_ADDRESS_LOCALHOST=0x...
   REACT_APP_NETWORK_NAME=localhost
   REACT_APP_CHAIN_ID=31337
   ```

## 🏠 Localhost Development

### Option 1: Using Hardhat Node

1. **Start local blockchain:**
   ```bash
   npx hardhat node
   ```

2. **Deploy contract (in new terminal):**
   ```bash
   npm run deploy:localhost
   ```

3. **Start React app:**
   ```bash
   npm run dev
   ```

### Option 2: All-in-One Command

```bash
npm run start:local
```

This will:
- Start Hardhat node
- Deploy the contract
- Start the React development server

### MetaMask Setup for Localhost

1. **Add localhost network:**
   - Network Name: `Hardhat Local`
   - RPC URL: `http://127.0.0.1:8545`
   - Chain ID: `31337`
   - Currency Symbol: `ETH`

2. **Import test account:**
   - Use one of the private keys from Hardhat's default accounts
   - Default private key: `0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80`

## 🌐 Production Deployment

### Deploy to Sepolia Testnet

1. **Configure environment:**
   ```bash
   # Add to .env
   PRIVATE_KEY=your_private_key
   SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_KEY
   ETHERSCAN_API_KEY=your_etherscan_key
   ```

2. **Deploy contract:**
   ```bash
   npm run deploy:sepolia
   ```

3. **Verify contract (optional):**
   ```bash
   npm run verify:sepolia <CONTRACT_ADDRESS>
   ```

### Deploy to Mainnet

1. **Configure environment:**
   ```bash
   # Add to .env
   PRIVATE_KEY=your_private_key
   MAINNET_RPC_URL=https://mainnet.infura.io/v3/YOUR_KEY
   ETHERSCAN_API_KEY=your_etherscan_key
   ```

2. **Deploy contract:**
   ```bash
   npm run deploy:mainnet
   ```

3. **Verify contract (optional):**
   ```bash
   npm run verify:mainnet <CONTRACT_ADDRESS>
   ```

## 📋 Contract Features

### Core Functions

- **`registerPatient()`** - Register a new patient
- **`addRecord(patient, cid, fileType, meta, recordHash)`** - Add health record
- **`getAllRecords(patient)`** - Get all patient records
- **`getRecord(patient, index)`** - Get specific record
- **`verifyRecordHash(hash)`** - Verify record exists
- **`verifyRecord(hash)`** - Mark record as verified (owner only)

### Permission Management

- **`grantAccess(provider, permissionType, durationInDays)`** - Grant access
- **`revokeAccess(provider)`** - Revoke access
- **`hasAccess(patient, provider)`** - Check access
- **`getPermission(patient, provider)`** - Get permission details

### Permission Types

- **1** - Read Only
- **2** - Read & Write
- **3** - Emergency Access

## 🔧 Frontend Integration

### Wallet Connection

The frontend automatically detects and connects to MetaMask:

```typescript
import { useBlockchain } from '@/hooks/useBlockchain';

const { 
  connectWallet, 
  isConnected, 
  account, 
  contract 
} = useBlockchain();
```

### Adding Records

```typescript
const addRecord = async (patient, cid, fileType, meta) => {
  const recordHash = generateRecordHash(meta + Date.now());
  const txHash = await addRecord(patient, cid, fileType, meta, recordHash);
  console.log('Transaction hash:', txHash);
};
```

### Loading Records

```typescript
const loadRecords = async (patient) => {
  const records = await getAllRecords(patient);
  console.log('Patient records:', records);
};
```

## 🛠️ Development Commands

```bash
# Compile contracts
npm run hardhat:compile

# Run tests
npm run hardhat:test

# Deploy to localhost
npm run deploy:localhost

# Deploy to Sepolia
npm run deploy:sepolia

# Deploy to Mainnet
npm run deploy:mainnet

# Start local development
npm run start:local

# Start React app
npm run dev

# Build for production
npm run build
```

## 🔍 Troubleshooting

### Common Issues

1. **"MetaMask not detected"**
   - Ensure MetaMask is installed and enabled
   - Check if the site is allowed to access MetaMask

2. **"Contract not deployed on network"**
   - Verify the contract address in your environment variables
   - Check if you're connected to the correct network

3. **"Transaction failed"**
   - Ensure you have enough ETH for gas fees
   - Check if the contract address is correct
   - Verify the function parameters

4. **"No access to patient records"**
   - Make sure you're calling functions with the correct patient address
   - Check if you have the required permissions

### Network Configuration

| Network | Chain ID | RPC URL | Contract Address |
|---------|----------|---------|------------------|
| Localhost | 31337 | http://127.0.0.1:8545 | Auto-generated |
| Sepolia | 11155111 | https://sepolia.infura.io/v3/... | Deploy to get |
| Mainnet | 1 | https://mainnet.infura.io/v3/... | Deploy to get |

## 📊 Contract Statistics

After deployment, you can check contract statistics:

```typescript
const stats = await getStats();
console.log('Total records:', stats.totalRecords);
console.log('Total patients:', stats.totalPatients);
```

## 🔐 Security Considerations

1. **Private Keys**: Never commit private keys to version control
2. **Environment Variables**: Use `.env` files for sensitive data
3. **Access Control**: Implement proper permission checks
4. **Gas Limits**: Set appropriate gas limits for transactions
5. **Input Validation**: Validate all inputs before contract calls

## 📝 Contract ABI

The contract ABI is automatically generated and available at:
- `src/contracts/MedicalRecords.ts`
- `artifacts/Contracts/MedicalRecords.sol/MedicalRecords.json`

## 🎯 Next Steps

1. Deploy the contract to your preferred network
2. Update the frontend environment variables
3. Test all functionality with MetaMask
4. Deploy the frontend to production
5. Monitor contract usage and gas costs

## 📞 Support

If you encounter any issues:

1. Check the troubleshooting section above
2. Review the contract deployment logs
3. Verify your environment configuration
4. Check MetaMask network settings

---

**Happy coding! 🚀**
