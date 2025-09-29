// hardhat.config.cjs
require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

const SEPOLIA_RPC_URL = process.env.SEPOLIA_RPC_URL || "";
const MAINNET_RPC_URL = process.env.MAINNET_RPC_URL || "";
const PRIVATE_KEY = process.env.PRIVATE_KEY || "";
const INFURA_API_KEY = process.env.INFURA_API_KEY || "";
const ALCHEMY_API_KEY = process.env.ALCHEMY_API_KEY || "";
const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY || "";

// Pick RPC URLs
let sepoliaUrl = SEPOLIA_RPC_URL;
let mainnetUrl = MAINNET_RPC_URL;

if (!sepoliaUrl && INFURA_API_KEY) {
  sepoliaUrl = `https://sepolia.infura.io/v3/${INFURA_API_KEY}`;
} else if (!sepoliaUrl && ALCHEMY_API_KEY) {
  sepoliaUrl = `https://eth-sepolia.g.alchemy.com/v2/${ALCHEMY_API_KEY}`;
}

if (!mainnetUrl && INFURA_API_KEY) {
  mainnetUrl = `https://mainnet.infura.io/v3/${INFURA_API_KEY}`;
} else if (!mainnetUrl && ALCHEMY_API_KEY) {
  mainnetUrl = `https://eth-mainnet.g.alchemy.com/v2/${ALCHEMY_API_KEY}`;
}

console.log("🚀 Using Sepolia RPC:", sepoliaUrl ? sepoliaUrl.slice(0, 40) + "..." : "❌ None found");
console.log("🚀 Using Mainnet RPC:", mainnetUrl ? mainnetUrl.slice(0, 40) + "..." : "❌ None found");

/** @type import('hardhat/config').HardhatUserConfig */
const config = {
  solidity: {
    version: "0.8.19",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  networks: {
    hardhat: {
      chainId: 31337,
      accounts: {
        mnemonic: "test test test test test test test test test test test junk",
        count: 20,
        accountsBalance: "10000000000000000000000", // 10000 ETH
      },
    },
    localhost: {
      url: "http://127.0.0.1:8545",
      chainId: 31337,
    },
    sepolia: {
      url: sepoliaUrl,
      accounts: PRIVATE_KEY ? [PRIVATE_KEY] : [],
      timeout: 60000,
      gasPrice: "auto",
    },
    mainnet: {
      url: mainnetUrl,
      accounts: PRIVATE_KEY ? [PRIVATE_KEY] : [],
      timeout: 60000,
      gasPrice: "auto",
    },
  },
  etherscan: {
    apiKey: {
      sepolia: ETHERSCAN_API_KEY,
      mainnet: ETHERSCAN_API_KEY,
    },
  },
  sourcify: {
    enabled: true,
  },
  gasReporter: {
    enabled: process.env.REPORT_GAS !== undefined,
    currency: "USD",
  },
};

module.exports = config;
