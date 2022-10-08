// SPDX-License-Identifier: UNLICENSED

// The administrator (owner) of the library should be able to add new books and the number of copies in the library.
// Users should be able to see the available books and borrow them by their id.
// Users should be able to return books.
// A user should not borrow more than one copy of a book at a time. The users should not be able to borrow a book more 
//  times than the copies in the libraries unless copy is returned.
// Everyone should be able to see the addresses of all people that have ever borrowed a given book.

pragma solidity ^0.8.9;

import "hardhat/console.sol";

contract Ownable {
    address public owner;
    
    modifier onlyOwner() {
        require(owner == msg.sender, "Not invoked by the owner");
        _;
    }

    constructor() {
        owner = msg.sender;
    }
}


// ok The administrator (owner) of the library should be able to add new books and the number of copies in the library.
// ok Users should be able to see the available books and borrow them by their id.
// ok Users should be able to return books.
// ok A user should not borrow more than one copy of a book at a time. The users should not be able to borrow a book more 
//  times than the copies in the libraries unless copy is returned.
// Everyone should be able to see the addresses of all people that have ever borrowed a given book.

pragma solidity ^0.8.9;

import "hardhat/console.sol";

contract Library is Ownable {
    mapping(string=>uint16) bookIndex;
    mapping(uint16=>uint8) stock;
    mapping(address=>uint16) hasBorrow;
    mapping(uint16=>address[]) bookHistory;

    uint16 nextId = 1;

    event NewBook(uint16 _id, string _book, uint8 _qty);
    event BookBorrowed(uint16 _id, address _address);
    event BookReturned(uint _id, address _address);

    constructor() payable {
   }
    
    modifier noRent {
        require(hasBorrow[msg.sender] == 0,"This Address has already rent a book.");
        _;
    }

    function addBook(string memory _book,uint8 _qty) public onlyOwner returns(uint) {
        require(_qty>0,"Quantity must at least 1 unit.");
        uint16 id = nextId;
        if(bookIndex[_book]==0){
            bookIndex[_book] = id;
            nextId++;
        }
        else {
            id = bookIndex[_book];
        }
        stock[id] = stock[id] + _qty;
        emit NewBook(id,_book,_qty);
        return id;
    }

    function borrow(uint16 _id) public payable noRent {
        require(stock[_id]>0,"Book not available.");
        stock[_id] = stock[_id] - 1;
        hasBorrow[msg.sender] = _id;
        bookHistory[_id].push(msg.sender);
        emit BookBorrowed(_id,msg.sender);
    }

    function returnBook() public payable {
        require(hasBorrow[msg.sender]>0,"This address did not rent a book.");
        uint16 id = hasBorrow[msg.sender];
        stock[id] = stock[id] + 1;
        hasBorrow[msg.sender] = 0;
        emit BookReturned(id,msg.sender);
    }

    function getID(string memory _book) public view returns(uint16){
        return bookIndex[_book];
    }

    function getStock(uint16 _id) public view returns(uint){
          return stock[_id];
    }

    function getBookHistory(uint16 _id) public view returns(address [] memory) {
        
        return bookHistory[_id];
    }
    function hasBorrowed() public view returns (uint) {
        return hasBorrow[msg.sender];
    }

}