pragma solidity ^0.4.24;

import 'zeppelin-solidity/contracts/token/ERC721/ERC721Token.sol';
import 'zeppelin-solidity/contracts/ownership/Ownable.sol';

contract Kudos is ERC721Token("KudosToken", "KDO"), Ownable { 
    struct Kudo {
        string name;
        string description;         // move to metadata in IPFS?
        uint256 rarity;
        uint256 priceFinney;              // price in finney
        uint256 numClonesAllowed;
        uint256 numClonesInWild;
        string tags;                // move to metadata in IPFS?
        string image;               // IPFS Hash
        uint256 clonedFromId;       // id of gen0 kudos
    }

    Kudo[] public kudos;

    // constructor (Kudo[] kudos) public {
    //     // Throw away the first index, and use 0 to check if the data exists
    //     kudos.push(0);
    // }

    mapping(string => uint256) internal nameToTokenId;

    function mint(string name, string description, uint256 rarity, uint256 priceFinney, uint256 numClonesAllowed, string tags, string image) public payable onlyOwner returns (uint256 tokenId) {
        // Ensure that each Gen0 Kudos is unique
        require(nameToTokenId[name] == 0);
        uint256 _numClonesInWild = 0;
        uint256 _clonedFromId = 0;

        Kudo memory _kudo = Kudo({name: name, description: description, rarity: rarity,
                                  priceFinney: priceFinney, numClonesAllowed: numClonesAllowed,
                                  numClonesInWild: _numClonesInWild,
                                  tags: tags, image: image, clonedFromId: _clonedFromId
                                  });
        // The new kudo is pushed onto the array and minted
        // Note that Solidity uses 0 as a default value when an item is not found in a mapping.

        // If the array is new, skip over the first index.
        if(kudos.length == 0) {
            Kudo memory _dummyKudo = Kudo({name: 'dummy', description: 'dummy', rarity: 0, priceFinney: 0,
                                           numClonesAllowed: 0, numClonesInWild: 0,
                                           tags: 'dummy', image: 'dummy', clonedFromId: 0
                                           });
            kudos.push(_dummyKudo);
        }
        tokenId = kudos.push(_kudo) - 1;
        kudos[tokenId].clonedFromId = tokenId;

        _mint(msg.sender, tokenId);

        nameToTokenId[name] = tokenId;
        // return tokenId;
    }

    function clone(string name, uint256 numClonesRequested) public payable {
        // Grab existing Kudo blueprint
        uint256 gen0KudosId = nameToTokenId[name];
        Kudo memory _kudo = kudos[gen0KudosId];
        require(
            _kudo.numClonesInWild + numClonesRequested <= _kudo.numClonesAllowed,
            "The number of Kudos clones requested exceeds the number of clones allowed.");
        require(
            msg.value >= _kudo.priceFinney * 10**15 * numClonesRequested,
            "Not enough Wei to pay for the Kudos clones.");

        // Transfer the msg.value to the Gen0 Kudos owner to pay for the Kudos clone(s).
        ownerOf(gen0KudosId).transfer(msg.value);

        // Update original kudo struct in the array
        _kudo.numClonesInWild += numClonesRequested;
        kudos[gen0KudosId] = _kudo;

        // Create new kudo, don't let it be cloned
        for (uint i = 0; i < numClonesRequested; i++) {
            Kudo memory _newKudo;
            _newKudo.name = _kudo.name;
            _newKudo.description = _kudo.description;
            _newKudo.rarity = _kudo.rarity;
            _newKudo.priceFinney = _kudo.priceFinney;
            _newKudo.numClonesAllowed = 0;
            _newKudo.numClonesInWild = 0;
            _newKudo.tags = _kudo.tags;
            _newKudo.image = _kudo.image;
            _newKudo.clonedFromId = gen0KudosId;

            // Note that Solidity uses 0 as a default value when an item is not found in a mapping.
            uint256 tokenId = kudos.push(_newKudo) - 1;
            // Mint the new kudos to the msg.sender's account
            _mint(msg.sender, tokenId);
        }

    }

    function cloneAndTransfer(string name, uint256 numClonesRequested, address receiver) public payable {
        // Grab existing Kudo blueprint
        uint256 gen0KudosId = nameToTokenId[name];
        Kudo memory _kudo = kudos[gen0KudosId];
        require(
            _kudo.numClonesInWild + numClonesRequested <= _kudo.numClonesAllowed,
            "The number of Kudos clones requested exceeds the number of clones allowed.");
        require(
            msg.value >= _kudo.priceFinney * 10**15 * numClonesRequested,
            "Not enough Wei to pay for the Kudos clones.");

        // Transfer the msg.value to the Gen0 Kudos owner to pay for the Kudos clone(s).
        ownerOf(gen0KudosId).transfer(msg.value);

        // Update original kudo struct in the array
        _kudo.numClonesInWild += numClonesRequested;
        kudos[gen0KudosId] = _kudo;

        // Create new kudo, don't let it be cloned
        for (uint i = 0; i < numClonesRequested; i++) {
            Kudo memory _newKudo;
            _newKudo.name = _kudo.name;
            _newKudo.description = _kudo.description;
            _newKudo.rarity = _kudo.rarity;
            _newKudo.priceFinney = _kudo.priceFinney;
            _newKudo.numClonesAllowed = 0;
            _newKudo.numClonesInWild = 0;
            _newKudo.tags = _kudo.tags;
            _newKudo.image = _kudo.image;
            _newKudo.clonedFromId = gen0KudosId;

            // Note that Solidity uses 0 as a default value when an item is not found in a mapping.
            uint256 tokenId = kudos.push(_newKudo) - 1;

            _mint(receiver, tokenId);
            // transferFrom(msg.sender, receiver, tokenId);
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


    function getKudosById(uint256 tokenId) view public returns (string name, string description, uint256 rarity,
                                                                uint256 priceFinney, uint256 numClonesAllowed, uint256 numClonesInWild,
                                                                string tags, string image, uint256 clonedFromId)
    {
        Kudo memory _kudo = kudos[tokenId];

        name = _kudo.name;
        description = _kudo.description;
        rarity = _kudo.rarity;
        priceFinney = _kudo.priceFinney;
        numClonesAllowed = _kudo.numClonesAllowed;
        numClonesInWild = _kudo.numClonesInWild;
        tags = _kudo.tags;
        image = _kudo.image;
        clonedFromId = _kudo.clonedFromId;
    }


    function getGen0TokenId(string name) view public returns (uint256) {
        // If the result is 0 it means the key was not found in the mapping.
        // string memory name = nameToTokenId[name];
        // if(name == 0) throw;
        return nameToTokenId[name];
    }

}