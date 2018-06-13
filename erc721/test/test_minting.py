import json
from web3.auto import w3
from web3 import Web3

with open('build/contracts/Kudos.json') as f:
    abi = json.load(f)['abi']

checksummed = Web3.toChecksumAddress('0x2d315733409e06e3988226091cfdd5b28337a313')

kudos = w3.eth.contract(address=checksummed, abi=abi)

kudos.functions.create('pythonista', 'good at the pythons', 1234, 500000).transact({'from': w3.eth.coinbase})
# kudos.functions.create('night_owl', 'works at night', 1234, 500000).transact({'from': w3.eth.coinbase})


print(kudos.functions.totalSupply().call())
print(kudos.functions.getTokenName(1).call())
# print(kudos.functions.getTokenName(2).call())
