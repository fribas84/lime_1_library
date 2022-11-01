const hre = require("hardhat");
const Library = require("../artifacts/contracts/LibraryV2.sol/LibraryV2.json");

require('dotenv').config({ path: __dirname + '/.env' });

const {ALCHEMY_API_KEY, DEV_PRIVATE_KEY} = process.env;


const parseToDec = hex =>parseInt(hex,16);

const run = async () => {
    console.log("Ethers version: " + hre.ethers.version);
    const provider = new hre.ethers.providers.JsonRpcProvider(`https://eth-goerli.alchemyapi.io/v2/${ALCHEMY_API_KEY}`);
    const latestBlock = await provider.getBlock("latest");
    console.log("lastest block: " + latestBlock.hash);
    const wallet = new hre.ethers.Wallet(DEV_PRIVATE_KEY, provider);
    const balance = await wallet.getBalance();
    console.log("Wallet Balance: " + hre.ethers.utils.formatEther(balance, 18))


    const LibraryAddress = "0x6a7667E68A8A02Af2aCD543F384F4a99F36D8018";
    const library = new hre.ethers.Contract(LibraryAddress,Library.abi,wallet)
    console.log(library);
    
    console.log("\n\nAdding new books...");
 
    for(let i=0;i<5;i++){
        let isbn = 9780062886149 + i;
        let isbnHex = hre.ethers.utils.hexZeroPad(hre.ethers.utils.hexlify(isbn),6);
        let txResponse = await library.addBook(isbnHex,15);
        let txReceipt = await txResponse.wait();
        if(txReceipt.status == 1) {
            let [transferEvent] = txReceipt.events;
            let [ idHex ] = transferEvent.args;
            let stock = await library.getStock(idHex);
            //Convert stored ISBN to readable
            let id = parseToDec(idHex);
            console.log("\tNew Book was added with ISBN: " + id + " with stock: " + stock);
        }
        else{
            console.log("Trasanction failed.")
        }
    }
    
     
    console.log("\nReading Available books...");
    const rawAvailableBooks = await library.getAvailableBooks();
    console.log("\tRaw Available books: " + rawAvailableBooks);
    
    const readableAvailableBooks = rawAvailableBooks.map(book => parseToDec(book));
    console.log("\tReadable Available books: " + readableAvailableBooks);

    console.log("\nBorrowing a book");
    let isbn = 9780062886149;
    let isbnHex = hre.ethers.utils.hexZeroPad(hre.ethers.utils.hexlify(isbn),6);

    const options = {value: hre.ethers.utils.parseEther("0.001")}
     
    let txResponse = await library.borrow(isbnHex,options);;
    let txReceipt = await txResponse.wait();
    if(txReceipt.status == 1) { 
        let [transferEvent] = txReceipt.events;
        let [ idHex, addr ] = transferEvent.args;
        console.log("\tWallet :" + addr + " borrowed " + parseToDec(idHex));
    }
    let stock = await library.getStock(isbnHex);
    console.log("\tBook with ISBN: " + isbn + " has stock: " + stock);
    
    let history = await library.getBookHistory(isbnHex);
    console.log("\tHistory: " + history);

    console.log("\nReturn Book");
    hasBorrowed = await library.hasBorrowed();
    console.log("\tWallet borrowed :" + hasBorrowed +" | " + parseToDec(hasBorrowed));
    stock = await library.getStock(isbnHex);
    id = parseToDec(isbnHex);
    console.log("\tStock before return of ISBN: " + id + " has stock: " + stock);
    txResponse = await library.returnBook();
    txReceipt = await txResponse.wait();
    if(txReceipt.status == 1) { 
        let [transferEvent] = txReceipt.events;
        let [ idHex, addr ] = transferEvent.args;
        console.log("\tWallet :" + addr + " Returned " + parseToDec(hasBorrowed));
    }

    stock = await library.getStock(isbnHex);
    console.log("\tBook with ISBN: " + id + " has stock: " + stock);
    history = await library.getBookHistory(isbnHex);
    console.log("\tHistory of ISBN " + isbn +": " + history);
    
}


run();
module.exports = run;