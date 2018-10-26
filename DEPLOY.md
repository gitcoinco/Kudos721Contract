# Kudos Deployment
These instructions assume you are deploying to the **rinkeby network**.  Replace `rinkeby` with `localhost` or `mainnet` if you want to deploy to a different network.


## Deploy Kudos tokens on the blockchain
The latest code is on [Github](https://github.com/mbeacom/gitcoin-erc721/tree/master).

The Kudos tokens need to exist on the blockchain before they can show up on the Gitcoin website.  The architecture design is "blockchain-first", meaning that the contract and Kudos are completely independent from the Gitcoin site.  Anyone can access them using web3 or Open Sea.

After the Kudos are "minted", or "born" on the blockchain, they can be synchronized to the Gitcoin database.  The Django model for this is `kudos.models.Token`.  This table should never be changed directly, only updated using the `kudos.utils.sync_db()` method.

### Deploying the contract
First the contract needs to be deployed to the blockchain.  These steps apply to the *mbeacom/gitcoin-erc721.git* repository.ååå

- `ssh -A root@209.97.155.182` to get into the kudosdemo server.  The contract deployment is done from here since the server contains the private key for the gitcoin account and all the software needed for the deploy.  Only deploy from the server to avoid putting the private key on your local machine.
- `cd gitcoin-erc721`
- Go to the github page, and find the release that you want to use.  I recommend only using tagged releases as this the best way to remember what version of code you have deployed.
- `git pull` to get the latest code.
- `git checkout [tag]` to checkout the version you want.  For example, `git checkout v1.1.1`
- Open the *truffle.js* and make sure the information is correct for your deploy.  Most importantly, check the `from` field to make sure it is the account you want to "own" the contract.  The owner of this account will basically have "admin" access to the contract.
- `npm install -g truffle` if truffle is not already installed.
- `npm install` to make sure you have all the dependencies.
- `truffe migrate --reset --compile-all --network rinkeby` to compile the contract code and deploy it to rinkeby.
- `grep network -A30 build/contracts/Kudos.json` and find the network address for the network you are deploying to.  For rinkeby, the network id is 4.  For mainnet, the network id is 1.
- Go to https://rinkeby.opensea.io, and click Develop --> Submit Dapps.
- Enter the contract address above.  It should find the contract on rinkeby.  Click through until the end and you will probably get a 404 error.  Don't worry about this, it's still working.  **It is important that you do this before minting any tokens**.
- `node utils/contract_info.js abi` to output the abi code for the contract.  If you are on a mac, you can `| pbcopy` to pipe it directly to your clipboard.
- Take note of the abi code and the address, you will need to update the *gitcoinco/web.git* code with these values.

### Updating the Gitcoin/web.git code
There are a couple things that need to be updated in the Gitcoin code to go along with a new contract.  These steps apply to the *gitcoinco/web.git* repository.

- If new Kudos have been added to the *mbeacom/kudos-badges.git* repo:
	- Copy the new images from that repo to *web/app/assets/v2/images/kudos/.*  Be sure to get any images in sub folders as well.
	- Copy the *kudos.yaml* file to *web/app/kudos/kudos.yaml*
	- Optionally, in the *gitcoinco/web* repo, compress **only the new images** using the `svgo --disable=removeViewBox` command.
- Update the `KUDOS_CONTRACT_RINKEBY` value in *settings.py* and the `kudos_address` function in *abi.js* with the contract address.
- Paste the abi code into *Kudos.json* and the `kudos_abi` variables in *abi.js*
- Commit your changes, `git push` to master, and optionally tag a release.

### Minting the tokens
Now that the contract is on the blockchain, we can "mint" new kudos tokens.  Note that this part is done from the kudosdemo server since we are _only_ minting tokens here, and _not_ syncing them to the database.

The command is a Django Management Command so the application needs to be set up before running the `mint_all_kudos` command.

- `ssh -A root@209.97.155.182` to get into the kudosdemo server.
- `cd web` to get into the repository.
- `git checkout kudos-v1 && git pull` to pull down the latest code.
- `vim app/app/.env` and update the environment variables as below.

```
OPENSEA_API=xxxx
KUDOS_NETWORK=rinkeby
KUDOS_OWNER_ACCOUNT=0x8B34b3E624A8dd3Ab4e85b490f6D5e775521d3C8
KUDOS_PRIVATE_KEY=xxxx

IPFS_HOST=ipfs.gitcoin.co
IPFS_API_PORT=443
IPFS_API_SCHEME=https
```

**Note:  Be careful with the private key.  Anyone with the private key has full access to this account!**

- `docker-compose down` to stop any running containers.
- `docker-compose up -d --build` to rebuild the container (if necessary) and run the containers in the background.
- `docker-compose logs -f --tail 100 web` to make sure everything is running as expected. Ctrl+c out of that when it looks good.
- In a tmux session, `dc exec web bash -c 'cd app && python manage.py mint_all_kudos --skip_sync rinkeby /code/app/kudos/kudos.yaml --gitcoin_account'` to mint all the kudos in the *kudos.yaml* file.
- Grab a coffee and come back in 30 minutes or so.  It should be OK if you get disconnected from the server since you are running in a tmux session.  There should be about 144 kudos that have been minted.
- Navigate to http://rinkeby.opensea.io/assets/kudostokenvX to see your Kudos.  **Note:  The image assets depend on the images already being there on `https://ss.gitcoin.co/static/kudos/image.svg.  So until the images are there they won't show up.


## Deploy Gitcoin App
The latest code is on [Github](https://github.com/jasonrhaas/web/tree/kudos-v1).

The Gitcoin App is the main https://gitcoin.co site.  This part should be done after the Kudos contract is deployed.

### Django App Deployment

- `ssh ubuntu@34.219.65.167 -p 30606` to get into the staging server.
- `cd gitcoin/coin` to get into the repository.
- `git pull jasonrhaas kudos-v1` to pull down the latest code.
- `vim app/app/.env` and update the environment variables as below.

```
OPENSEA_API=xxxx
KUDOS_NETWORK=rinkeby
KUDOS_OWNER_ACCOUNT=0x8B34b3E624A8dd3Ab4e85b490f6D5e775521d3C8
KUDOS_PRIVATE_KEY=xxxx

IPFS_HOST=ipfs.gitcoin.co
IPFS_API_PORT=443
IPFS_API_SCHEME=https
```

**Note:  Be careful with the private key.  Anyone with the private key has full access to this account!**

- `bash scripts/deploy.bash jasonrhaas/kudos-v1` to run the deployment.  It should pull down the code, do pip installs, migrations, and install the crontabs.
- `crontab -e` to inspect the crontab to make sure it matches the *scripts/crontab* file.  Comment out the Kudos jobs so we can run them manually.
- `source ../gitcoin-37/bin/activate` to activate the virtual environment.
- `python manage.py sync_kudos rinkeby opensea --start 1` to sync all of the kudos to the database.
- `crontab -e` and uncomment out the kudos cronjobs.
- Go to https://stage.gitcoin.co to see the site.  Might need to do a Hard Refresh and Empty Cache to see the latest updates.
- Check Open Sea to make sure the Kudos token data is correct (image, link, properties)



### Extra Info
Additional information about the Gitcoin App.

#### Environment Variables
There are a few environment variable that need to be added for Kudos in the *.env* file.

- `KUDOS_NETWORK` - The network to use for the Gitcoin App.  This affects what Kudos get displayed in the marketplace and in the profile.  For example, setting this to `rinkeby` will only show the Kudos for the _latest rinkeby contract_ in the marketplace and in user profiles.
- `KUDOS_CONTRACT_RINKEBY` - The contract address on Rinkeby.  Can be normalized or checksummed.
- `KUDOS_CONTRACT_MAINNET` - The contract address on Mainnet.  Can be normalized or checksummed.
- `KUDOS_OWNER_ACCOUNT` - The contract account owner address.
- `KUDOS_PRIVATE_KEY` - Private key for the above account.  Be careful dealing with private keys.
- `OPENSEA_API` - API key to allow for Kudos syncing using Open Sea.  Syncing using the Open Sea API is the preferred way to sync from blockchain to the database.



#### Cron jobs
These are the job that run to handle the kudos syncing.  Syncing the blockchain is a tricky business.  There are many ways to do it, and none of them are that great.  I decided to use the Open Sea API because it seems to be the most reliable of any other method Ive tried.

The cronjobs are:

```
## KUDOS
*/1 * * * * cd gitcoin/coin; bash scripts/run_management_command_if_not_already_running.bash sync_kudos rinkeby opensea --catchup >> /var/log/gitcoin/sync_kudos_catchup.log 2>&1
*/10 * * * * cd gitcoin/coin; bash scripts/run_management_command_if_not_already_running.bash sync_kudos rinkeby opensea --start 1 >> /var/log/gitcoin/sync_kudos_all.log 2>&1
```

They both use the Open Sea API.

The first job uses the `--catchup` to find the latest Kudos Id on the blockchain and the database, and sync the difference.

The second job is a "full sync" of all the kudos.  This is mostly there as redundancy in case the first job fails for whatever reason.