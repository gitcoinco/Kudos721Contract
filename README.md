## Getting started
First you need to install all of the requirements to run truffle and a local testrpc.

- `npm install -g truffle ganache-cli` to install Truffle and Ganache-cli.
- `npm install` to install npm requirements.

Truffle will use the "development" network by default.  This assumes that you are running a testrpc on localhost at port 8545.

## Running the tests
- `truffle test --network test`

## Developing on Gitcoin Web
The source repository (in development) is here -- https://github.com/mbeacom/kudos.

Kudos relies on the blockchain to mint the tokens.  After each token is minted, the data in sycn'ed to the database.  The Gitcoin docker-compose.yml file runs an instance of the `testrpc`, which is your local blockchain.

Once the docker-compose environment and testrpc is up, you can deploy the contract code.  If you run `docker-compose logs -f testrpc` while you deploy the contract, you can see the Contract address in the debug output.

- `truffle migrate --reset --build-all` to build and deploy the Kudos.sol contract.


## Developing on the Test App (Deprecated)

To run the blockchain and app locally:

- In a separate window, run `ganache-cli`.  It should now be running locally on port 8545.
- `truffle migrate --reset --build-all` to build and deploy the Kudos.sol contract.
- `npm run dev` to start up the web server.  The app should be running locally on port 300.
- Copy the `(0)` private key and import it into Meta Mask in your browser.  This is the default account that Tokens will be minted to.  You should have around ~97 ETH to 
play with.


## Using the Test App (Deprecated)

- Click the **Mint Gen0** button to mint your first Kudos!
- See https://youtu.be/jl4p04t0hFE for more examples.


<!-- Google Analytics -->
<img src='https://ga-beacon.appspot.com/UA-102304388-1/gitcoinco/Kudos721Contract' style='width:1px; height:1px;' >
