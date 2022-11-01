const {
  time,
  loadFixture,
} = require("@nomicfoundation/hardhat-network-helpers");
const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");
const { expect } = require("chai");
const { ethers } = require("hardhat");

const parseToDec = hex =>parseInt(hex,16);

describe("Library Contract basic funcionality", function () {
  // We define a fixture to reuse the same setup in every test.
  // We use loadFixture to run this setup once, snapshot that state,
  // and reset Hardhat Network to that snapshot in every test.
  const deployLibrary= async() => {
    
    // Contracts are deployed using the first signer/account by default
    const [owner, otherAccount1, otherAccount2, otherAccount3 ] = await ethers.getSigners();
    const Library = await hre.ethers.getContractFactory("LibraryV2");
    const library = await Library.deploy();

    return { library, owner, otherAccount1, otherAccount2,otherAccount3};
  }

  const deployWithBooks= async() => {
    
    // Contracts are deployed using the first signer/account by default
    const [owner, otherAccount1, otherAccount2, otherAccount3 ] = await ethers.getSigners();
    const Library = await hre.ethers.getContractFactory("LibraryV2");
    const library = await Library.deploy();

    // Generate some ISBN, and ISBNHEX
    const isbn1 = 9780062886149;
    const isbnHex1 = ethers.utils.hexZeroPad(ethers.utils.hexlify(isbn1),6);
    const isbn2 = 9780062886150;
    const isbnHex2 = ethers.utils.hexZeroPad(ethers.utils.hexlify(isbn2),6);
    const isbn3 = 9780062886151;
    const isbnHex3 = ethers.utils.hexZeroPad(ethers.utils.hexlify(isbn3),6);
    return { library, owner, otherAccount1, otherAccount2,otherAccount3, isbn1,isbnHex1, isbn3,isbnHex2, isbn3,isbnHex3};
  }  
  describe("Deployment",  () => {
    it("Owner should be first account", async () => {
      const { library, owner } = await loadFixture(deployLibrary);
      expect(await library.owner()).to.equal(owner.address);
    });
  });

  describe("Add books to stock",  () => {
    it("Owner should be able to add one book, event emit with same ISBN", async function () {
      const {library,isbn1, isbnHex1} = await loadFixture(deployWithBooks);
      const _qty = 15;
      const txResponse = await library.addBook(isbnHex1,_qty);
      const txReceipt = await txResponse.wait();
      const [transferEvent] = txReceipt.events;
      const [ idHex ] = transferEvent.args;
      const isbn =  parseToDec(idHex);
      expect(isbn).to.equal(isbn1);
    });

    it("Not-owner cannot add books to stock", async  () => {
      const { library,otherAccount1,isbnHex1 } = await loadFixture(deployWithBooks);
       await expect( 
        library.connect(otherAccount1).addBook(isbnHex1,15))
        .to.revertedWith("Ownable: caller is not the owner");
    });
    
    it("Book 1 stock should be 15 units", async () => {
      const {library,isbnHex1} = await loadFixture(deployWithBooks);
      const _qty = 15;
      await library.addBook(isbnHex1,_qty);
      const result = await library.getStock(isbnHex1);
      expect(result).equal(_qty);
    })

    it("Add stock to extisting book, result should be 15 units", async () => {
      const {library,isbnHex1} = await loadFixture(deployWithBooks);
      const _qty = 5;
      await library.addBook(isbnHex1,_qty);
      await library.addBook(isbnHex1,10);
      const result = await library.getStock(isbnHex1);
      expect(result).equal(15);

    })
    
    it("Revert when owner wants to add a book with no stock", async  () => {
      const {library,isbnHex1} = await loadFixture(deployWithBooks);
      const _qty = 0;
      await expect(library.addBook(isbnHex1,_qty))
      .to.revertedWith("Quantity must at least 1 unit.");
    });
 
  });

  describe("Borrow books",  ()=>{
    it("Owner borrow a book", async () => {
      const {library,isbnHex1} = await loadFixture(deployWithBooks);
      const _qty = 15;
      await library.addBook(isbnHex1,_qty);
      const options = {value: ethers.utils.parseEther("0.001")}
      await expect(library.borrow(isbnHex1,options));
    })

    it("Cannot borrow a book with insufficient transfer value", async () => {
      const {library, isbnHex1} = await loadFixture(deployWithBooks);
      const _qty = 15;
      const txResponse = await library.addBook(isbnHex1,_qty);
      const txReceipt = await txResponse.wait();
      const [transferEvent] = txReceipt.events;
      const [ id ] = transferEvent.args;
      const options = {value: ethers.utils.parseEther("0.0001")}
      await expect(library.borrow(id,options)).to.revertedWith('Wrong transfer value, it should be 1 Finney.');
    })

    it("Cannot borrow a book with transfer value above fee", async () => {
      const {library,isbnHex1} = await loadFixture(deployWithBooks);
      const _qty = 15;
      await library.addBook(isbnHex1,_qty);
      const options = {value: ethers.utils.parseEther("0.1")}
      await expect(library.borrow(isbnHex1,options)).to.revertedWith('Wrong transfer value, it should be 1 Finney.');

    })

    it("Cannot borrow a book that doesnt exists", async () => {
      const {library,isbnHex1,isbnHex2} = await loadFixture(deployWithBooks);
      const _qty = 10;
      await library.addBook(isbnHex1,_qty);
      const options = {value: ethers.utils.parseEther("0.001")};
      await expect(library.borrow(isbnHex2,options));
    })

    it("Not Owner borrow a book", async () => {
      const {library,otherAccount1,isbnHex1 } = await loadFixture(deployWithBooks);
      const _qty = 10;
      await library.addBook(isbnHex1,_qty);
      const options = {value: ethers.utils.parseEther("0.001")};
      await expect(library.connect(otherAccount1).borrow(isbnHex1,options));
    })

    it("Not Owner cannot borrow a book when it has already borrowed one", async () => {
      const {library,otherAccount1,isbnHex1,isbnHex2 } = await loadFixture(deployWithBooks);
      await library.addBook(isbnHex1,10);
      const txResponse2 = await library.addBook(isbnHex2,10);
      const options = {value: ethers.utils.parseEther("0.001")};
      await library.connect(otherAccount1).borrow(isbnHex1,options);
      await expect(library.connect(otherAccount1).borrow(isbnHex2,options)).to.revertedWith('This Address has already rent a book.');
    })
  })

  describe("Return borrowed books", async  ()=>{ 
    it("Return a book", async function() {
      const {library,otherAccount1,isbnHex1 } = await loadFixture(deployWithBooks);
      const _qty = 10;
      await library.addBook(isbnHex1,_qty);
      const options = {value: ethers.utils.parseEther("0.001")};
      await library.connect(otherAccount1).borrow(isbnHex1,options);
      await library.connect(otherAccount1).returnBook();
      const zeroHex = ethers.utils.hexZeroPad(ethers.utils.hexlify(0),6);
      expect(await library.connect(otherAccount1).hasBorrowed()).equal(zeroHex);
    })

    it("Cannot return if user didn't rent any", async () => {
    const {library,otherAccount1,isbnHex1 } = await loadFixture(deployWithBooks);
      const _qty = 10;
      await library.addBook(isbnHex1,_qty);
      await expect(library.connect(otherAccount1).returnBook()).to.revertedWith('This address did not rent a book.');
    })
  })

  describe("Check history and available books", async  () => {
    it("Validate if history is accurate", async () => {
      const {library,otherAccount1,otherAccount2,otherAccount3,isbnHex1} = await loadFixture(deployWithBooks);
      const _qty = 10;
      await library.addBook(isbnHex1,_qty);
      const options = {value: ethers.utils.parseEther("0.001")};
      await library.connect(otherAccount1).borrow(isbnHex1,options);
      await library.connect(otherAccount2).borrow(isbnHex1,options);
      await library.connect(otherAccount3).borrow(isbnHex1,options);
      const borrowers = [otherAccount1.address,otherAccount2.address,otherAccount3.address]
      const history = await library.getBookHistory(isbnHex1);
      expect(history).to.eql(borrowers);
  
    })
  
    it("Get available books",async ()=>{
      const {library,isbnHex1,isbnHex2,isbnHex3} = await loadFixture(deployWithBooks);
      const _qty = 10;
      await library.addBook(isbnHex1,_qty);
      await library.addBook(isbnHex2,_qty);
      await library.addBook(isbnHex3,_qty);
      const addedBooks = [isbnHex1,isbnHex2,isbnHex3]
      const availableBooks = await library.getAvailableBooks();
      expect(availableBooks).to.eql(addedBooks);

    })
  })

  describe("Test Fallback and Receive", async () => {
    it("Validate Fallback", async () =>{
      const {library,otherAccount1} = await loadFixture(deployLibrary);
      const nonExistentFuncSignature ='nonExistentFunction(uint256,uint256)';
      const libraryContract = new ethers.Contract(
        library.address,
        [
          ...library.interface.fragments,
          `function ${nonExistentFuncSignature}`,
        ],
        otherAccount1,
      );
      const tx = libraryContract[nonExistentFuncSignature](8, 9);
      await expect(tx).to.emit(library, 'NewDepositFallback');

    })
    it("Validate Receive", async () =>{
      const {library,otherAccount1} = await loadFixture(deployLibrary);
      const tx = otherAccount1.sendTransaction({
        to: library.address,
        value: ethers.utils.parseEther("1")
      });
      await expect(tx).to.emit(library, 'NewDepositReceive');
    })
  })
  describe("Get borrow fee", async () => {
    it("Borrow fee should be 1 Finney", async ()=>{
      const {library} = await loadFixture(deployLibrary);
      const feeValue = await library.getFee();
      console.log(feeValue);
      expect(ethers.utils.formatEther(feeValue)).equal("0.001");

    })
  })
});
