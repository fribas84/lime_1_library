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

contract LibraryV2 is Ownable {
    struct Book{  
        bytes6 isbn;
        uint8 stock;
        uint index;
        bool added;
    }
    mapping(bytes6=>Book) booksMapping;
    uint[] booksIndex;
    mapping(address=>bytes6) hasBorrow;
    mapping(bytes6=>address[]) bookHistory;
    bytes6[] bookList;
    uint fee = 1000000 gwei; 

    modifier noRent {
        require(hasBorrow[msg.sender] == 0,"This Address has already rent a book.");
        _;
    }

    constructor() payable {
   }
   
    function addBook(bytes6 _isbn,uint8 _qty) external onlyOwner {
        require(_qty>0,"Quantity must at least 1 unit.");
        if(booksMapping[_isbn].added==false){
            bookList.push(_isbn);
            uint listLength = bookList.length - 1;
            booksMapping[_isbn] = Book(_isbn,_qty,listLength,true);
        }
        else{
            booksMapping[_isbn].stock += _qty;
        }
        emit NewBook(_isbn,_qty);  
    }

    function borrow(bytes6 _isbn) external payable noRent {
        require(booksMapping[_isbn].added == true,"Book not available.");
        require(booksMapping[_isbn].stock > 0,"Not stock available.");
        require(msg.value == fee,"Wrong transfer value, it should be 1 Finney.");
        booksMapping[_isbn].stock--;
        hasBorrow[msg.sender] = _isbn;
        bookHistory[_isbn].push(msg.sender);
        emit BookBorrowed(_isbn,msg.sender);
    }

    function returnBook() external payable {
        require(hasBorrow[msg.sender]>0,"This address did not rent a book.");
        bytes6 bookReturn = hasBorrow[msg.sender];
        booksMapping[bookReturn].stock +=1;
        hasBorrow[msg.sender] = 0;
        emit BookReturned(bookReturn,msg.sender);
    }

    function getAvailableBooks() external view returns(bytes6[] memory) {
        return bookList;
    }

    function getStock(bytes6 _isbn) external view returns(uint8){
          return booksMapping[_isbn].stock ;
    }

    function getBookHistory(bytes6 _isbn) external view returns(address[] memory) {
        
        return bookHistory[_isbn];
    }

    function hasBorrowed() public view returns (bytes6) {
        return hasBorrow[msg.sender];
    }

    function getFee() external view returns(uint) {
        return fee;
    }

    fallback() external payable{
        emit NewDepositFallback(msg.sender);
    }

    receive() external payable {
        emit NewDepositReceive(msg.sender);
    }

    event NewBook(bytes6 _isbn, uint8 _qty);
    event BookBorrowed(bytes6 _isbn, address _address);
    event BookReturned(bytes6 _isbn, address _address);
    event NewDepositFallback(address _address);
    event NewDepositReceive(address _address);
}