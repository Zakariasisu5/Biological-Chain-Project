import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";

const config: HardhatUserConfig = {
  solidity: "0.8.19",
  networks: {
    hardhat: {} as any,
    // add testnet/mainnet config if needed
    // goerli / sepolia example:
    // sepolia: {
    //   url: process.env.ALCHEMY_SEPOLIA_RPC,
    //   accounts: process.env.DEPLOYER_PRIVATE_KEY ? [process.env.DEPLOYER_PRIVATE_KEY] : []
    // }
  },
  paths: {
    sources: "contracts",
    cache: "node_modules/.cache/hardhat",
    artifacts: "artifacts",
  },
};

export default config;