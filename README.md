## Developing with the Gitcoin App

Kudos relies on the blockchain to mint the tokens.  After each token is minted, the data in sycn'ed to the database.  The Gitcoin docker-compose.yml file runs an instance of the `testrpc`, which is your local blockchain.

Once the docker-compose environment and testrpc is up, you can deploy the contract code.  If you run `docker-compose logs -f testrpc` while you deploy the contract, you can see the Contract address in the debug output.

- `npm install -g truffle ganache-cli` to install Truffle and Ganache-cli.
- `truffle migrate --reset --build-all` to build and deploy the Kudos.sol contract.


## Local development

To run the blockchain and app locally:

- `cd erc721`.
- `npm install` to install npm requirements.
- `npm install -g truffle ganache-cli` to install Truffle and Ganache-cli.
- In a separate window, run `ganache-cli`.  It should now be running locally on port 8545.
- `truffle migrate --reset --build-all` to build and deploy the Kudos.sol contract.
- `npm run dev` to start up the web server.  The app should be running locally on port 300.
- Copy the `(0)` private key and import it into Meta Mask in your browser.  This is the default account that Tokens will be minted to.  You should have around ~97 ETH to play with.


## Using the Kudos app

- Click the **Mint Gen0** button to mint your first Kudos!
- See https://youtu.be/jl4p04t0hFE for more examples.
