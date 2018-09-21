pragma solidity ^0.4.24;

import 'zeppelin-solidity/contracts/token/ERC721/ERC721Token.sol';
import 'zeppelin-solidity/contracts/ownership/Ownable.sol';

/// @title Kudos
/// @author Jason Haas <jasonrhaas@gmail.com>
/// @notice Kudos ERC721 interface for minting, cloning, and transferring Kudos tokens.
contract Kudos is ERC721Token("KudosToken", "KDO"), Ownable { 
    struct Kudo {
        string name;
        string description;
        uint256 rarity;
        uint256 priceFinney;
        uint256 numClonesAllowed;
        uint256 numClonesInWild;
        string tags;
        string image;
        uint256 clonedFromId;
    }

    Kudo[] public kudos;

    mapping(string => uint256) internal nameToTokenId;

    /// @dev mint(): Mint a new Gen0 Kudos.  These are the tokens that other Kudos will be "cloned from".
    /// @param name The name of the new Kudos to mint.  Should be lowercase_with_underscores.
    /// @param description Description of the Kudos.
    /// @param rarity Rarity score of the Kudos, from 0 to 100.  May be deprecated in the future.
    /// @param priceFinney Price of the Kudos in Finney.
    /// @param numClonesAllowed Maximum number of times this Kudos is allowed to be cloned.
    /// @param tags Comma delimited tags for the Kudos.
    /// @param image Image file name.  Such as pythonista.svg.
    /// @return the tokenId of the Kudos that has been minted.  Note that in a transaction only the tx_hash is returned.
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
    }

    /// @dev clone(): Clone a new Kudos from a Gen0 Kudos.
    /// @param name The name of the new Kudos to mint.  Should be lowercase_with_underscores.
    /// @param numClonesRequested Number of clones to generate.
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

    /// @dev cloneAndTransfer(): Clone a new Kudos and then transfer it to a different address.
    /// @param name The name of the new Kudos to mint.  Should be lowercase_with_underscores.
    /// @param numClonesRequested Number of clones to generate.
    /// @param receiver The address to transfer the Kudos to after it's cloned.
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
        }
    }

    /// @dev burnGen0(): Burn a Gen0 Kudos token.  Can only be performed by the owner of the token.
    /// @param owner The owner address of the token to burn.
    /// TODO:  Do we need to pay the owner or can we use the ``ownerOf()` function?
    /// @param tokenId The Kudos ID to be burned.
    function burnGen0(address owner, uint256 tokenId) public payable onlyOwner {
        Kudo memory _kudo = kudos[tokenId];
        delete nameToTokenId[_kudo.name];
        _burn(owner, tokenId);
    }

    /// @dev burn(): Burn Kudos token.
    /// @param owner The owner address of the token to burn.
    /// TODO:  Do we need to pay the owner or can we use the ``ownerOf()` function?
    /// @param tokenId The Kudos ID to be burned.
    function burn(address owner, uint256 tokenId) public payable {
        Kudo memory _kudo = kudos[tokenId];
        uint256 gen0Id = nameToTokenId[_kudo.name];
        Kudo memory _gen0Kudo = kudos[gen0Id];
        _gen0Kudo.numClonesInWild -= 1;
        kudos[gen0Id] = _gen0Kudo;
        _burn(owner, tokenId);
    }

    /// @dev getKudosById(): Return a Kudos struct/array given a Kudos Id. 
    /// @param tokenId The Kudos Id.
    /// @return the Kudos struct, in array form.
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

    /// @dev getGen0TokenId(): Get the Gen0 Kudos Id.
    /// @param name The name Gen0 Kudos.
    /// @return Kudos Id.
    function getGen0TokenId(string name) view public returns (uint256) {
        // If the result is 0 it means the key was not found in the mapping.
        return nameToTokenId[name];
    }
}