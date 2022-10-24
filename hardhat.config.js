const { task } = require("hardhat/config");

require("@nomicfoundation/hardhat-toolbox");
require('@openzeppelin/hardhat-upgrades');
require("@nomiclabs/hardhat-etherscan");
require("hardhat-gas-reporter");
require('dotenv').config({ path: __dirname + '/.env' })


const { ETHERSCAN_API_KEY, ALCHEMY_API_KEY, DEV_PRIVATE_KEY} = process.env;


/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    version: "0.8.17",
    settings: {
      optimizer: {
        enabled: true,
        runs: 1000,
      },
    },
  },
  gasReporter: {
    enabled: true,
  },
  networks:{
    goerli: {
      url: `https://eth-goerli.alchemyapi.io/v2/${ALCHEMY_API_KEY}`,
      accounts: [DEV_PRIVATE_KEY]
    }   
  },
  etherscan: {
    apiKey: ETHERSCAN_API_KEY,
  },

};

task("deploy-testnets", "Deploys contract on a provided network")
    .setAction(async (taskArguments, hre, runSuper) => {
        const deployLibraryontract = require("./scripts/deploy");
        await deployLibraryontract(taskArguments);
    });

task("interact", "Execute interact script")
  .setAction(async (hre, runSuper) => {
      const interact = require("./scripts/interact");
      await interact();
      
        
    });