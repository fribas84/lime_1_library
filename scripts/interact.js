const hre = require("hardhat");

const run = async () => {
    console.log("Ethers version: " + hre.ethers.version);
    const provider = new hre.ethers.providers.JsonRpcProvider("http://localhost:8545");
    const latestBlock = await provider.getBlock("latest");
    console.log("lastest block: " + latestBlock.hash);
    const wallet = new hre.ethers.Wallet("0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80", provider);
    const balance = await wallet.getBalance();
    console.log("Wallet Balance: " + hre.ethers.utils.formatEther(balance, 18))
    const Library = await hre.ethers.getContractFactory("Library");
    const library = await Library.deploy();

    console.log("Library Address: " + library.address);

    const txResponse = await library.addBook("newBook",15);
    
    const txReceipt = await txResponse.wait();
    if(txReceipt.status == 1) {
        const [transferEvent] = txReceipt.events;
        const [ id ] = transferEvent.args;
        const stock = await library.getStock(id);
        console.log("New Book was added with ID: " + id + " with stock: " + stock);
    }
    else{
        console.log("Trasanction failed.")
    }



    
    }
    
module.exports = run;