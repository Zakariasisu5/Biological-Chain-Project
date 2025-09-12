// hardhat.config.cjs
require("dotenv").config();
require("@nomicfoundation/hardhat-toolbox");

const SEPOLIA_RPC_URL = process.env.SEPOLIA_RPC_URL || "";
const PRIVATE_KEY = process.env.PRIVATE_KEY || "";

/** @type import("hardhat/config").HardhatUserConfig */
const config = {
  solidity: "0.8.24",
  networks: {
    hardhat: {},
    // Example testnet:
     sepolia: {
      url: SEPOLIA_RPC_URL || "",
      accounts: PRIVATE_KEY ? [PRIVATE_KEY] : [],
    },
  },
  paths: {
    sources: "contracts",
    cache: "node_modules/.cache/hardhat",
    artifacts: "artifacts",
  },
};

module.exports = config;
