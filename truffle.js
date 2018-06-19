// const HDWalletProvider = require('truffle-hdwallet-provider')
// const fs = require('fs')

// // First read in the secrets.json to get our mnemonic
// let secrets
// let mnemonic

// if (fs.existsSync('secrets.json')) {
//   secrets = JSON.parse(fs.readFileSync('secrets.json', 'utf8'))
//   mnemonic = secrets.mnemonic
//   token = secrets.token
// } else {
//   console.log('No secrets.json found. If you are trying to publish EPM ' +
//               'this will fail. Otherwise, you can ignore this message!')
//   mnemonic = ''
//   token = ''
// }

module.exports = {
  networks: {
    live: {
      network_id: 1 // Ethereum public network
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
      network_id: 3
    },
    development: {
      host: "localhost",
      port: 8545,
      network_id: 'default'
    }
  }
}
