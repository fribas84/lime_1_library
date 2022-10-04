// SPDX-License-Identifier: UNLICENSED

// ok The administrator (owner) of the library should be able to add new books and the number of copies in the library.
// ok Users should be able to see the available books and borrow them by their id.
// ok Users should be able to return books.
// ok A user should not borrow more than one copy of a book at a time. The users should not be able to borrow a book more 
//  times than the copies in the libraries unless copy is returned.
// Everyone should be able to see the addresses of all people that have ever borrowed a given book.

pragma solidity ^0.8.9;

import "hardhat/console.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract Library is Ownable {
    mapping(string=>uint) bookIndex;
    mapping(uint=>uint) stock;
    mapping(address=>uint) hasBorrow;
    mapping(uint=>address[]) bookHistory;

    uint nextId = 1;

    event NewBook(uint _id, string _book, uint _qty);
    event BookBorrowed(uint _id, address _address);
    event BookReturned(uint _id, address _address);

    constructor() payable {
   }
    
    modifier noRent {
        require(hasBorrow[msg.sender] == 0,"This Address has already rent a book.");
        _;
    }

    function addBook(string memory _book,uint _qty) public onlyOwner returns(uint) {
        uint id = nextId;
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

    function borrow(uint _id) public payable noRent {
        require(stock[_id]>0,"Book not available.");
        stock[_id] = stock[_id] - 1;
        hasBorrow[msg.sender] = _id;
        bookHistory[_id].push(msg.sender);
        emit BookBorrowed(_id,msg.sender);
    }

    function returnBook() public payable {
        require(hasBorrow[msg.sender]>0,"This address did not rent a book");
        uint id = hasBorrow[msg.sender];
        stock[id] = stock[id] + 1;
        hasBorrow[msg.sender] = 0;
        emit BookReturned(id,msg.sender);
    }

    function getID(string memory _book) public view returns(uint){
        return bookIndex[_book];
    }

    function getStock(uint _id) public view returns(uint){
          return stock[_id];
    }

    function getBookHistory(uint _id) public view returns(address [] memory) {
        return bookHistory[_id];
    }

}