import json
from web3.auto import w3
from web3 import Web3

with open('build/contracts/Kudos.json') as f:
    abi = json.load(f)['abi']

checksummed = Web3.toChecksumAddress('0x3bbf682ed74ae8d35c3cc071c54f5e8b533b85ce')

kudos = w3.eth.contract(address=checksummed, abi=abi)

bugsquasher = dict(name='Bugsquasher',
                   description='exterminator',
                   rareness=1234,
                   price=50000,
                   numClonesAllowed=3
                   )

collabmachine = dict(name='Collaborationmachine',
                     description='plays nice with others',
                     rareness=1234,
                     price=50000,
                     numClonesAllowed=3
                     )

designstar = dict(name='Designstar',
                  description='makes nice things',
                  rareness=1234,
                  price=50000,
                  numClonesAllowed=3
                  )

fastturn = dict(name='Fastturnaround',
                description='speedy gonzalez',
                rareness=1234,
                price=50000,
                numClonesAllowed=3
                )

helpinghand = dict(name='Helpinghand',
                   description='like a good neighbor',
                   rareness=1234,
                   price=50000,
                   numClonesAllowed=3
                   )

problemsolver = dict(name='Problemsolver',
                     description='exterminator',
                     rareness=1234,
                     price=50000,
                     numClonesAllowed=3
                     )

pythonista = dict(name='Pythonista',
                  description='follows the zen of python',
                  rareness=1234,
                  price=50000,
                  numClonesAllowed=3
                  )

artifacts = (bugsquasher, collabmachine, designstar, fastturn, helpinghand, problemsolver, pythonista)

for artifact in artifacts:
    try:
        kudos.functions.create(**artifact).transact({'from': w3.eth.coinbase})
    except ValueError as e:
        print(f'{artifact["name"]} artifact already exists.  Skipping creation.')


print(kudos.functions.totalSupply().call())
