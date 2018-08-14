pragma solidity ^0.4.24;

import 'zeppelin-solidity/contracts/token/ERC721/ERC721Token.sol';
import 'zeppelin-solidity/contracts/ownership/Ownable.sol';

contract Kudos is ERC721Token("KudosToken", "KDO"), Ownable { 
    struct Kudo {
        string name;
        string description;         // move to metadata in IPFS?
        uint256 rarity;
        uint256 price;              // price in finney
        uint256 numClonesAllowed;
        uint256 numClonesInWild;
        address ownerAddress;
        string tags;                // move to metadata in IPFS?
        string image;               // IPFS Hash
        uint256 clonedFromId;       // id of gen0 kudos
    }

    Kudo[] public kudos;

    mapping(string => uint256) internal nameToTokenId;

    function mint(string name, string description, uint256 rarity, uint256 price, uint256 numClonesAllowed, string tags, string image) public payable onlyOwner {
        // Ensure that each Gen0 Kudos is unique
        require(nameToTokenId[name] == 0);
        uint256 _numClonesInWild = 0;
        address _ownerAddress = msg.sender;
        uint256 _clonedFromId = 0;

        Kudo memory _kudo = Kudo({name: name, description: description, rarity: rarity, price: price, numClonesAllowed: numClonesAllowed, numClonesInWild: _numClonesInWild, ownerAddress: _ownerAddress, tags: tags, image: image, clonedFromId: _clonedFromId});
        uint256 tokenId = kudos.push(_kudo) - 1;
        kudos[tokenId].clonedFromId = tokenId;

        _mint(msg.sender, tokenId);

        nameToTokenId[name] = tokenId;
    }

    function clone(string name, uint256 numClonesRequested) public payable {
        // Grab existing Kudo blueprint
        uint256 gen0KudosId = nameToTokenId[name];
        Kudo memory _kudo = kudos[gen0KudosId];
        require(_kudo.numClonesInWild + numClonesRequested <= _kudo.numClonesAllowed);

        // Update original kudo struct in the array
        _kudo.numClonesInWild += numClonesRequested;
        kudos[gen0KudosId] = _kudo;

        // Create new kudo, don't let it be cloned
        for (uint i = 0; i < numClonesRequested; i++) {
            Kudo memory _newKudo;
            _newKudo.name = _kudo.name;
            _newKudo.description = _kudo.description;
            _newKudo.rarity = _kudo.rarity;
            _newKudo.price = _kudo.price;
            _newKudo.numClonesAllowed = 0;
            _newKudo.numClonesInWild = _kudo.numClonesInWild;
            _newKudo.ownerAddress = msg.sender;
            _newKudo.tags = _kudo.tags;
            _newKudo.image = _kudo.image;
            _newKudo.clonedFromId = gen0KudosId;


            // The new kudo is pushed onto the array and minted
            // Start the kudos ID at 1 instead of 0.  Solidity uses 0 as a default value when an
            // item is not found in a mapping.  Also 0 is used to denote "not used".
            uint256 tokenId = kudos.push(_newKudo);

            _mint(msg.sender, tokenId);
        }

    }

    function burnGen0(address owner, uint256 tokenId) public payable onlyOwner {
        Kudo memory _kudo = kudos[tokenId];
        delete nameToTokenId[_kudo.name];
        _burn(owner, tokenId);
    }

    function burn(address owner, uint256 tokenId) public payable {
        Kudo memory _kudo = kudos[tokenId];
        uint256 gen0Id = nameToTokenId[_kudo.name];
        Kudo memory _gen0Kudo = kudos[gen0Id];
        _gen0Kudo.numClonesInWild -= 1;
        kudos[gen0Id] = _gen0Kudo;
        _burn(owner, tokenId);
    }


    function getKudosById(uint256 tokenId) view public returns (string name, string description, uint256 rarity, uint256 price, uint256 numClonesAllowed, uint256 numClonesInWild, address ownerAddress, string tags, string image, uint256 clonedFromId) {
        Kudo memory _kudo = kudos[tokenId];

        name = _kudo.name;
        description = _kudo.description;
        rarity = _kudo.rarity;
        price = _kudo.price;
        numClonesAllowed = _kudo.numClonesAllowed;
        numClonesInWild = _kudo.numClonesInWild;
        ownerAddress = _kudo.ownerAddress;
        tags = _kudo.tags;
        image = _kudo.image;
        clonedFromId = _kudo.clonedFromId;
    }


    function getGen0TokenId(string name) view public returns (uint256) {
        // Will return a default value of 0 if the name is not found in the mapping.
        // Will also return 0 for the name that maps to an id of 0.
        // TODO:  Make this better by using a struct type.
        return nameToTokenId[name];
    }

}