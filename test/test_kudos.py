import json
from web3.auto import w3
from web3 import Web3

with open('build/contracts/Kudos.json') as f:
    abi = json.load(f)['abi']

checksummed = Web3.toChecksumAddress('0xe7bed272ee374e8116049d0a49737bdda86325b6')

kudos = w3.eth.contract(address=checksummed, abi=abi)

bugsquasher = dict(name='bugsquasher',
                   description='exterminator',
                   rareness=1234,
                   price=50000,
                   numClonesAllowed=3
                   )

collabmachine = dict(name='collaborationmachine',
                     description='plays nice with others',
                     rareness=1234,
                     price=50000,
                     numClonesAllowed=3
                     )

designstar = dict(name='designstar',
                  description='makes nice things',
                  rareness=1234,
                  price=50000,
                  numClonesAllowed=3
                  )

fastturn = dict(name='fastturnaround',
                description='speedy gonzalez',
                rareness=1234,
                price=50000,
                numClonesAllowed=3
                )

helpinghand = dict(name='helpinghand',
                   description='like a good neighbor',
                   rareness=1234,
                   price=50000,
                   numClonesAllowed=3
                   )

problemsolver = dict(name='problemsolver',
                     description='exterminator',
                     rareness=1234,
                     price=50000,
                     numClonesAllowed=3
                     )

pythonista = dict(name='pythonista',
                  description='follows the zen of python',
                  rareness=1234,
                  price=50000,
                  numClonesAllowed=3
                  )

artifacts = (bugsquasher, collabmachine, designstar, fastturn, helpinghand, problemsolver, pythonista)

# for artifact in artifacts:
#     try:
#         kudos.functions.create(**artifact).transact({'from': w3.eth.coinbase})
#     except ValueError as e:
#         print(f'{artifact["name"]} artifact already exists.  Skipping creation.')


print(kudos.functions.totalSupply().call())
