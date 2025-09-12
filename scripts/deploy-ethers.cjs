// Standalone deploy script using solc-js + ethers (CommonJS .cjs so it runs even with "type":"module")
const fs = require('fs');
const path = require('path');
const solc = require('solc');
const { ethers } = require('ethers');

async function main() {
  const srcPath = path.resolve(__dirname, '../contracts/MedicalRecords.sol');
  if (!fs.existsSync(srcPath)) throw new Error('contracts/MedicalRecords.sol not found');

  const source = fs.readFileSync(srcPath, 'utf8');

  const input = {
    language: 'Solidity',
    sources: {
      'MedicalRecords.sol': { content: source },
    },
    settings: {
      outputSelection: {
        '*': {
          '*': ['abi', 'evm.bytecode'],
        },
      },
    },
  };

  const output = JSON.parse(solc.compile(JSON.stringify(input)));

  if (output.errors && output.errors.length) {
    const fatal = output.errors.filter(e => e.severity === 'error');
    console.log('Solidity compile warnings/errors:');
    for (const e of output.errors) console.log(e.formattedMessage || e.message);
    if (fatal.length) throw new Error('Solidity compile failed');
  }

  const contractOutput = output.contracts['MedicalRecords.sol']?.MedicalRecords;
  if (!contractOutput) throw new Error('Compiled contract output not found');

  const abi = contractOutput.abi;
  const bytecode = contractOutput.evm.bytecode.object;
  if (!bytecode || bytecode.length === 0) throw new Error('Contract bytecode missing');

  const RPC_URL = process.env.RPC_URL || 'http://127.0.0.1:8545';
  const DEPLOYER_PRIVATE_KEY = process.env.DEPLOYER_PRIVATE_KEY || '';

  const provider = new ethers.JsonRpcProvider(RPC_URL);

  let signer;
  if (DEPLOYER_PRIVATE_KEY) {
    signer = new ethers.Wallet(DEPLOYER_PRIVATE_KEY, provider);
  } else {
    const accounts = await provider.listAccounts();
    if (accounts.length === 0) throw new Error('No unlocked accounts found on RPC and DEPLOYER_PRIVATE_KEY not set');
    signer = provider.getSigner(accounts[0]);
  }

  console.log('Deploying with signer:', (await signer.getAddress()).toString());
  const factory = new ethers.ContractFactory(abi, bytecode, signer);

  const contract = await factory.deploy();
  console.log('Transaction hash:', contract.deployTransaction?.hash);
  await contract.waitForDeployment();
  console.log('Deployed address:', contract.target);
  // write address to file for frontend convenience
  fs.writeFileSync(path.resolve(__dirname, '../.deployed_contract_address'), contract.target, 'utf8');
  console.log('Address written to .deployed_contract_address');
}

main().catch(err => {
  console.error(err);
  process.exitCode = 1;
});