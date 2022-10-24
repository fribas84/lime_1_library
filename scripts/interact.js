const hre = require("hardhat");

const run = async () => {
    console.log("Ethers version: " + hre.ethers.version);
    const provider = new hre.ethers.providers.JsonRpcProvider("http://localhost:8545");
    const latestBlock = await provider.getBlock("latest");
    console.log("lastest block: " + latestBlock.hash);

    const wallet = new hre.ethers.Wallet("0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80", provider);
    const balance = await wallet.getBalance();
    console.log("Wallet Balance: " + hre.ethers.utils.formatEther(balance, 18))

    }
    
module.exports = run;