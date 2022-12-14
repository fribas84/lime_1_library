# Lime Academy Task 1 - Library 

## Description
This project is the delivery for Task 1 for Lime Academy Web 3 development course.

### Requierements

- The administrator (owner) of the library should be able to add new books and the number of copies in the library.
- Users should be able to see the available books and borrow them by their id.
- Users should be able to return books.
- A user should not borrow more than one copy of a book at a time. The users should not be able to borrow a book more times than the copies in the libraries unless copy is returned.
- Everyone should be able to see the addresses of all people that have ever borrowed a given book.

## To do list
### V1 
- [X] Basic smart contract that fullfills requirements.
- [X] Deployment unit tests
- [X] Borrow unit tests
- [X] Return unit tests
- [X] History tests
- [X] 100% test coverage
- [X] Contract Verification

Contract is deployed in Goerli at [0x666379BfF98DA138Dd8E6677215074FDd0d0B084](https://goerli.etherscan.io/address/0x666379BfF98DA138Dd8E6677215074FDd0d0B084)

### V2
- Improved Data Structure
- Now instead of storing a String for the book, uses a bytes6, so is needed to add a hex represantion of an ISBN.

- [X] Basic smart contract that fullfills requirements.
- [X] Deployment unit tests
- [X] Borrow unit tests
- [X] Return unit tests
- [X] History tests
- [X] 100% test coverage
- [X] Contract Verification

Contract is deployed in Goerli at [0x6a7667E68A8A02Af2aCD543F384F4a99F36D8018](https://goerli.etherscan.io/address/0x6a7667E68A8A02Af2aCD543F384F4a99F36D8018)

## Week 2 tasks:
- [X] Create HardHat Project.
- [X] Use OpenZeppelin Ownable.
- [X] Local Node deployable scripts.
- [X] Deployment in Goerli.
- [X] Testing scenarios.
- [X] Added use cases.
- [X] Tests Coverage report at 100%.
- [X] HH deployement task.
- [X] Reading sensitive data from .env.
- [X] Etherscan verification.

## Week 3 tasks:

### Task 1: Interact with the Book Library contract running on the local node
Create a script interacting with your library on your local node that:

- [X] Creates a book
- [X] Checks all available books
- [X] Rents a book
- [X] Checks that it is rented
- [X] Returns the book
- [X] Checks the availability of the book

### Task 2: Interact with the Library contract on Goerli

- [X] Create a copy of your script and perform the same interactions but on Goerli testnet.