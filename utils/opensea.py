import requests
import json


def main():
    # Assets API
    # payload = dict(
    #     asset_contract_address='0x67ba5da1fd437642c99fb2de267b1152f365cea4',
    #     # token_ids=[],
    #     limit='1',
    #     )
    # r = requests.get('https://rinkeby-api.opensea.io/api/v1/assets', params=payload)
    # print(json.dumps(r.json(), indent=2))

    # Single API
    asset_contract_address = '0x67ba5da1fd437642c99fb2de267b1152f365cea4'
    token_id = 60
    r = requests.get(f'https://rinkeby-api.opensea.io/api/v1/asset/{asset_contract_address}/{token_id}')
    print(json.dumps(r.json(), indent=2))

    # Event API
    payload = dict(
        asset_contract_address='0x67ba5da1fd437642c99fb2de267b1152f365cea4',
        token_id=60,
        )
    r = requests.get('https://rinkeby-api.opensea.io/api/v1/events', params=payload)
    print(json.dumps(r.json(), indent=2))


if __name__ == '__main__':
    main()
