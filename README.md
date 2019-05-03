# mongomart
This repo contains my implementation to the exam challenges for M101JS - MongoDB for NodeJS course.

## Requirements
- [Node and npm](https://nodejs.org)
- [Local MongoDB Database](https://www.mongodb.com/download-center#community)

For Windows platforms follow these steps:

1) Set up the MongoDB environment. MongoDB requires a data directory to store all data so you have to create the folder `\data\db` on the drive from which you start MongoDB.

2) Start MongoDB manually. To start the main MongoDB process run `mongod` using a terminal (`mongod` is usually located in the folder "C:\Program Files\MongoDB\Server\3.x\bin")

Note: In this link you can check the instructions to setup and run MongoDB for other OS: `https://docs.mongodb.com/manual/installation/#tutorials)`


## Installation and Running the App
1.  Download or clone the repo.
2.  Install the dependencies with `npm install`.
3.  Make sure you have a mongod running version 3.x.x of MongoDB.
4.	Import the "item" collection with command `mongoimport --drop -d mongomart -c item data/items.json`
5.	Import the "cart" collection with command `mongoimport --drop -d mongomart -c cart data/cart.json`
6.	Run the application by typing `node mongomart.js`.

App will be served at http://localhost:3000.