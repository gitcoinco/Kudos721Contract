from web3 import HTTPProvider, Web3
import json
from web3.middleware import geth_poa_middleware

network = 'rinkeby'
address = '0x63aa4e5f76e7f5dcc762743880b3048412b37215'

w3 = Web3(HTTPProvider(f'https://{network}.infura.io'))
if network == 'rinkeby':
    w3.middleware_stack.inject(geth_poa_middleware, layer=0)

with open('../build/contracts/Kudos.json') as f:
    abi = json.load(f)['abi']

contract = w3.eth.contract(address=w3.toChecksumAddress(address), abi=abi)


token_id = 1
kudos = contract.functions.getKudosById(token_id).call()
metadata = contract.functions.tokenURI(token_id).call()

print(kudos)
print(metadata)