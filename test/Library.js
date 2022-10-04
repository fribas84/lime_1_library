const {
  time,
  loadFixture,
} = require("@nomicfoundation/hardhat-network-helpers");
const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");
const { expect } = require("chai");

describe("Library", function () {
  // We define a fixture to reuse the same setup in every test.
  // We use loadFixture to run this setup once, snapshot that state,
  // and reset Hardhat Network to that snapshot in every test.
  async function deployLibrary() {
    
    // Contracts are deployed using the first signer/account by default
    const [owner, otherAccount1, otherAccount2 ] = await ethers.getSigners();
    const Library = await hre.ethers.getContractFactory("Library");
    const library = await Library.deploy();
    return { library, owner, otherAccount1, otherAccount2 };
  }

  describe("Deployment", function () {
    it("Owner should be first account", async function () {
      const { library, owner } = await loadFixture(deployLibrary);

      expect(await library.owner()).to.equal(owner.address);
    });
  });

  describe("Add books to stock", function () {
    it("Owner should be able to add one book with stock, and the returned ID should be 1", async function () {
      const {library} = await loadFixture(deployLibrary);
      const _qty = 50;
      const txResponse = await library.addBook("testing",_qty);
      const txReceipt = await txResponse.wait();
      const [transferEvent] = txReceipt.events;
      const [ id ] = transferEvent.args;

      expect(id).to.equal(1);
    });

    it("Not-owner cannot add books to stock", async function () {
      const { library,otherAccount1 } = await loadFixture(deployLibrary);
      await expect(
        library.connect(otherAccount1).addBook("testing",50))
        .to.revertedWith("Ownable: caller is not the owner");
    });
    
    it("Book 1 stock should be 50 units", async function() {
      const {library} = await loadFixture(deployLibrary);
      const _qty = 50;
      const txResponse = await library.addBook("testing",_qty);
      const txReceipt = await txResponse.wait();
      const [transferEvent] = txReceipt.events;
      const [ id ] = transferEvent.args;
      const result = await library.getStock(id);
      expect(result).equal(50);
    })

  });

});
