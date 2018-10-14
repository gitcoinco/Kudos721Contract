const HDWalletProvider = require('truffle-hdwallet-provider')
const HDWalletProviderPriv = require('truffle-hdwallet-provider-privkey')
const fs = require('fs')

// First read in the secrets.json to get our mnemonic
let secrets
let mnemonic
let privkeys

if (fs.existsSync('secrets.json')) {
  secrets = JSON.parse(fs.readFileSync('secrets.json', 'utf8'))
  mnemonic = secrets.mnemonic
  token = secrets.token
  privkeys = secrets.privkeys
} else {
  console.log('No secrets.json found. If you are trying to publish EPM ' +
              'this will fail. Otherwise, you can ignore this message!')
  mnemonic = ''
  token = ''
  privkeys = []
}

module.exports = {
  networks: {
    live: {
      provider: function() {
        return new HDWalletProviderPriv(privkeys, 'https://mainnet.infura.io/' + token)
      },
      network_id: 1, // Ethereum public network
      from: '0x6239FF1040E412491557a7a02b2CBcC5aE85dc8F',
      // optional config values
      // host - defaults to "localhost"
      // port - defaults to 8545
      // gas
      // gasPrice
      // from - default address to use for any transaction Truffle makes during migrations
    },
    ropsten: {
      provider: function() {
        return new HDWalletProvider(mnemonic, 'https://ropsten.infura.io/' + token)
      },
      network_id: 3,
      from: '0xd386793f1db5f21609571c0164841e5ea2d33ad8',
      // gas: 5612388
      // gas: 4612388
    },
    rinkeby: {
      provider: function() {
        return new HDWalletProvider(mnemonic, 'https://rinkeby.infura.io/' + token)
      },
      network_id: 4,
      from: '0xd386793f1db5f21609571c0164841e5ea2d33ad8',
    },
    development: {
      host: "localhost",
      port: 8545,
      network_id: 'default'
    }
  }
}
