import json
from web3.auto import w3
from web3 import Web3

with open('build/contracts/Kudos.json') as f:
    abi = json.load(f)['abi']

checksummed = Web3.toChecksumAddress('0xf41d6039b2af11c40cd02d835bf9e464e148007b')

kudos = w3.eth.contract(address=checksummed, abi=abi)

kudos.functions.create('pythonista', 'good at the pythons', 1234, 500000, 3).transact({'from': w3.eth.coinbase})


print(kudos.functions.totalSupply().call())
print(kudos.functions.getTokenName(1).call())
