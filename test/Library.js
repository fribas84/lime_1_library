const {
  time,
  loadFixture,
} = require("@nomicfoundation/hardhat-network-helpers");
const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");
const { expect } = require("chai");

describe("Library Contract basic funcionality", function () {
  // We define a fixture to reuse the same setup in every test.
  // We use loadFixture to run this setup once, snapshot that state,
  // and reset Hardhat Network to that snapshot in every test.
  async function deployLibrary() {
    
    // Contracts are deployed using the first signer/account by default
    const [owner, otherAccount1, otherAccount2, otherAccount3 ] = await ethers.getSigners();
    const Library = await hre.ethers.getContractFactory("Library");
    const library = await Library.deploy();
    return { library, owner, otherAccount1, otherAccount2,otherAccount3};
  }

  describe("Deployment",  () => {
    it("Owner should be first account", async () => {
      const { library, owner } = await loadFixture(deployLibrary);

      expect(await library.owner()).to.equal(owner.address);
    });
  });

  describe("Add books to stock",  () => {
    it("Owner should be able to add one book with stock, and the returned ID should be 1", async function () {
      const {library} = await loadFixture(deployLibrary);
      const _qty = 50;
      const txResponse = await library.addBook("testing",_qty);
      const txReceipt = await txResponse.wait();
      const [transferEvent] = txReceipt.events;
      const [ id ] = transferEvent.args;

      expect(id).to.equal(1);
    });

    it("Not-owner cannot add books to stock", async  () => {
      const { library,otherAccount1 } = await loadFixture(deployLibrary);
       await expect( 
        library.connect(otherAccount1).addBook("testing",50))
        .to.revertedWith("Ownable: caller is not the owner");
    });
    
    it("Book 1 stock should be 50 units", async () => {
      const {library} = await loadFixture(deployLibrary);
      const _qty = 50;
      const txResponse = await library.addBook("testing",_qty);
      const txReceipt = await txResponse.wait();
      const [transferEvent] = txReceipt.events;
      const [ id ] = transferEvent.args;
      const result = await library.getStock(id);
      expect(result).equal(50);
    })

    it("Add stock to extisting book, result should be 15 units", async () => {
      const {library} = await loadFixture(deployLibrary);
      const _qty = 5;
      const txResponse = await library.addBook("testing",_qty);
      const txReceipt = await txResponse.wait();
      const [transferEvent] = txReceipt.events;
      const [ id ] = transferEvent.args;

      const txResponse2 = await library.addBook("testing",10);
      const txReceipt2 = await txResponse2.wait();
      const [transferEvent2] = txReceipt.events;
      const [ id2 ] = transferEvent.args;

      const result = await library.getStock(id2);
      expect(result).equal(15);

    })

    it("getID should return the same ID as addBook", async ()=>{
      const {library} = await loadFixture(deployLibrary);
      const _qty = 5;
      const txResponse = await library.addBook("testing",_qty);
      const txReceipt = await txResponse.wait();
      const [transferEvent] = txReceipt.events;
      const [ id ] = transferEvent.args;
      const retunedId = await library.getID("testing");
      expect(id).equal(retunedId);

    })
    
    it("Revert when owner wants to add a book with no stock.", async  () => {
      const {library} = await loadFixture(deployLibrary);
      const _qty = 0;
      await expect(library.addBook("testing",_qty))
      .to.revertedWith("Quantity must at least 1 unit.");
    });
 
  });

  describe("Borrow books",  ()=>{
    it("Owner borrow a book", async () => {
      const {library} = await loadFixture(deployLibrary);
      const _qty = 50;
      const txResponse = await library.addBook("testing",_qty);
      const txReceipt = await txResponse.wait();
      const [transferEvent] = txReceipt.events;
      const [ id ] = transferEvent.args;
      const options = {value: ethers.utils.parseEther("0.001")}
      await expect(library.borrow(id,options));
    })

    it("Cannot borrow a book with insufficient transfer value", async () => {
      const {library} = await loadFixture(deployLibrary);
      const _qty = 50;
      const txResponse = await library.addBook("testing",_qty);
      const txReceipt = await txResponse.wait();
      const [transferEvent] = txReceipt.events;
      const [ id ] = transferEvent.args;
      const options = {value: ethers.utils.parseEther("0.0001")}
      await expect(library.borrow(id,options)).to.revertedWith('Wrong transfer value, it should be 1 Finney.');
    })

    it("Cannot borrow a book with transfer value above fee", async () => {
      const {library} = await loadFixture(deployLibrary);
      const _qty = 50;
      const txResponse = await library.addBook("testing",_qty);
      const txReceipt = await txResponse.wait();
      const [transferEvent] = txReceipt.events;
      const [ id ] = transferEvent.args;
      const options = {value: ethers.utils.parseEther("0.1")}
      await expect(library.borrow(id,options)).to.revertedWith('Wrong transfer value, it should be 1 Finney.');

    })

    it("Cannot borrow a book that doesnt exists", async () => {
      const {library} = await loadFixture(deployLibrary);
      const _qty = 50;
      const txResponse = await library.addBook("testing",_qty);
      const txReceipt = await txResponse.wait();
      const [transferEvent] = txReceipt.events;
      const [ id ] = transferEvent.args;
      const options = {value: ethers.utils.parseEther("0.001")};
      await expect(library.borrow(5,options));
    })

    it("Not Owner borrow a book", async () => {
      const {library,otherAccount1 } = await loadFixture(deployLibrary);
      const _qty = 50;
      const txResponse = await library.addBook("testing",_qty);
      const txReceipt = await txResponse.wait();
      const [transferEvent] = txReceipt.events;
      const [ id ] = transferEvent.args;
      const options = {value: ethers.utils.parseEther("0.001")};
      await expect(library.connect(otherAccount1).borrow(id,options));
    })

    it("Not Owner cannot borrow a book when it has already borrowed one", async () => {
      const {library,otherAccount1 } = await loadFixture(deployLibrary);
      const txResponse = await library.addBook("testing",50);
      const txReceipt = await txResponse.wait();
      const  [transferEvent] = txReceipt.events;
      const [ id1] = transferEvent.args;
      const txResponse2 = await library.addBook("testing 2",10);
      const txReceipt2 = await txResponse2.wait();
      const [transferEvent2] = txReceipt2.events;
      const [ id2] = transferEvent2.args;
      const options = {value: ethers.utils.parseEther("0.001")};
      await library.connect(otherAccount1).borrow(1,options);
      await expect(library.connect(otherAccount1).borrow(2,options)).to.revertedWith('This Address has already rent a book.');
    })
  })

  describe("Return borrowed books", async  ()=>{ 
    it("Return a book", async function() {

      const {library,otherAccount1 } = await loadFixture(deployLibrary);
      const _qty = 50;
      const txResponse = await library.addBook("testing",_qty);
      const txReceipt = await txResponse.wait();
      const [transferEvent] = txReceipt.events;
      const [ id ] = transferEvent.args;
      const options = {value: ethers.utils.parseEther("0.001")};

      await library.connect(otherAccount1).borrow(id,options);
      await library.connect(otherAccount1).returnBook();
      expect(await library.connect(otherAccount1).hasBorrowed()).equal(0);

    })
    it("Cannot return if user didn't rent any", async () => {

      const {library,otherAccount1 } = await loadFixture(deployLibrary);
      const _qty = 50;
      const txResponse = await library.addBook("testing",_qty);
      const txReceipt = await txResponse.wait();
      const [transferEvent] = txReceipt.events;
      const [ id ] = transferEvent.args;
      await expect(library.connect(otherAccount1).returnBook()).to.revertedWith('This address did not rent a book.');
    })
  })
  describe("Check history", async  () => {
    it("Validate if history is accurate", async () => {
      const {library,otherAccount1 ,otherAccount2,otherAccount3} = await loadFixture(deployLibrary);
      const _qty = 50;
      const txResponse = await library.addBook("testing",_qty);
      const txReceipt = await txResponse.wait();
      const [transferEvent] = txReceipt.events;
      const [ id ] = transferEvent.args;
      const options = {value: ethers.utils.parseEther("0.001")};
      await library.connect(otherAccount1).borrow(id,options);
      await library.connect(otherAccount2).borrow(id,options);
      await library.connect(otherAccount3).borrow(id,options);
      const borrowers = [otherAccount1.address,otherAccount2.address,otherAccount3.address]
      const history = await library.getBookHistory(id);
      expect(history).to.eql(borrowers);
  
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
