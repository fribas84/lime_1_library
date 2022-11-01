const hre = require("hardhat");

const parseToDec = hex =>parseInt(hex,16);

const run = async () => {
    console.log("Ethers version: " + hre.ethers.version);
    const provider = new hre.ethers.providers.JsonRpcProvider("http://localhost:8545");
    const latestBlock = await provider.getBlock("latest");
    console.log("lastest block: " + latestBlock.hash);
    const wallet = new hre.ethers.Wallet("0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80", provider);
    const balance = await wallet.getBalance();
    console.log("Wallet Balance: " + hre.ethers.utils.formatEther(balance, 18))
    const Library = await hre.ethers.getContractFactory("LibraryV2");
    const library = await Library.deploy();

    console.log("Library Address: " + library.address);
    
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
    console.log("\tReadble Available books: " + readableAvailableBooks);

    console.log("\nBorrowing a book");
    let isbn = 9780062886149;
    let isbnHex = hre.ethers.utils.hexZeroPad(hre.ethers.utils.hexlify(isbn),6);

    const options = {value: hre.ethers.utils.parseEther("0.001")}
    await library.borrow(isbnHex,options);
    
    let stock = await library.getStock(isbnHex);
    let id = parseToDec(isbnHex);
    console.log("Book with ISBN: " + id + " has stock: " + stock);
    
    const history = await library.getBookHistory(isbnHex);
    console.log("\tHistory: " + history);

    let hasBorrowed = await library.hasBorrowed();
    console.log("\tWallet borrowed :" + hasBorrowed +" | " + parseToDec(hasBorrowed));

    console.log(" \n Return Book");
    await library.returnBook();
    hasBorrowed = await library.hasBorrowed();
    console.log("\tWallet borrowed :" + hasBorrowed +" | " + parseToDec(hasBorrowed));
    stock = await library.getStock(isbnHex);
    id = parseToDec(isbnHex);
    console.log("\tBook with ISBN: " + id + " has stock: " + stock);

    
}

run();
module.exports = run;