// hardhat.config.cjs
require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

const SEPOLIA_RPC_URL = process.env.SEPOLIA_RPC_URL || "";
const PRIVATE_KEY = process.env.PRIVATE_KEY || "";
const INFURA_API_KEY = process.env.INFURA_API_KEY || "";
const ALCHEMY_API_KEY = process.env.ALCHEMY_API_KEY || "";

let sepoliaUrl = SEPOLIA_RPC_URL; // default from .env
if (!sepoliaUrl && INFURA_API_KEY) {
  sepoliaUrl = `https://sepolia.infura.io/v3/${INFURA_API_KEY}`;
} else if (!sepoliaUrl && ALCHEMY_API_KEY) {
  sepoliaUrl = `https://eth-sepolia.g.alchemy.com/v2/${ALCHEMY_API_KEY}`;
}

/** @type import('hardhat/config').HardhatUserConfig */
const config = {
  solidity: "0.8.19",
  networks: {
    sepolia: {
      url: sepoliaUrl,
      accounts: PRIVATE_KEY ? [PRIVATE_KEY] : [],
    },
  },
};

module.exports = config;
