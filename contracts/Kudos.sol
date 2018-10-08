pragma solidity ^0.4.24;

import 'zeppelin-solidity/contracts/token/ERC721/ERC721Token.sol';
import 'zeppelin-solidity/contracts/ownership/Ownable.sol';

/// @title Kudos
/// @author Jason Haas <jasonrhaas@gmail.com>
/// @notice Kudos ERC721 interface for minting, cloning, and transferring Kudos tokens.
contract Kudos is ERC721Token("KudosToken", "KDO"), Ownable {
    struct Kudo {
        // string name;
        // string description;
        // uint256 rarity;
        uint256 priceFinney;
        uint256 numClonesAllowed;
        uint256 numClonesInWild;
        // string tags;
        // string image;
        uint256 clonedFromId;
    }

    Kudo[] public kudos;

    // mapping(string => uint256) internal nameToTokenId;

    /// @dev mint(): Mint a new Gen0 Kudos.  These are the tokens that other Kudos will be "cloned from".
    /// @param _to Address to mint to.
    /// @param _priceFinney Price of the Kudos in Finney.
    /// @param _numClonesAllowed Maximum number of times this Kudos is allowed to be cloned.
    /// @param _tokenURI A URL to the JSON file containing the metadata for the Kudos.  See metadata.json for an example.
    /// @return the tokenId of the Kudos that has been minted.  Note that in a transaction only the tx_hash is returned.
    function mint(address _to, uint256 _priceFinney, uint256 _numClonesAllowed, string _tokenURI) public payable onlyOwner returns (uint256 tokenId) {
        // Ensure that each Gen0 Kudos is unique
        // require(nameToTokenId[name] == 0);
        uint256 _numClonesInWild = 0;
        uint256 _clonedFromId = 0;

        Kudo memory _kudo = Kudo({priceFinney: _priceFinney, numClonesAllowed: _numClonesAllowed,
                                  numClonesInWild: _numClonesInWild, clonedFromId: _clonedFromId
                                  });
        // The new kudo is pushed onto the array and minted
        // Note that Solidity uses 0 as a default value when an item is not found in a mapping.

        // If the array is new, skip over the first index.
        if(kudos.length == 0) {
            Kudo memory _dummyKudo = Kudo({priceFinney: 0,numClonesAllowed: 0, numClonesInWild: 0,
                                           clonedFromId: 0
                                           });
            kudos.push(_dummyKudo);
        }
        tokenId = kudos.push(_kudo) - 1;
        kudos[tokenId].clonedFromId = tokenId;

        _mint(_to, tokenId);
        _setTokenURI(tokenId, _tokenURI);

        // nameToTokenId[name] = tokenId;
    }

    /// @dev clone(): Clone a new Kudos from a Gen0 Kudos.
    /// @param _tokenId The token id of the Kudos to clone and transfer.
    /// @param _numClonesRequested Number of clones to generate.
    function clone(uint256 _tokenId, uint256 _numClonesRequested) public payable {
        // Grab existing Kudo blueprint
        // uint256 gen0KudosId = nameToTokenId[name];
        Kudo memory _kudo = kudos[_tokenId];
        uint256 cloningCost  = _kudo.priceFinney * 10**15 * _numClonesRequested;
        require(
            _kudo.numClonesInWild + _numClonesRequested <= _kudo.numClonesAllowed,
            "The number of Kudos clones requested exceeds the number of clones allowed.");
        require(
            msg.value >= cloningCost,
            "Not enough Wei to pay for the Kudos clones.");

        // Transfer the minting price to the Gen0 Kudos owner to pay for the Kudos clone(s).
        ownerOf(_tokenId).transfer(cloningCost);

        // Update original kudo struct in the array
        _kudo.numClonesInWild += _numClonesRequested;
        kudos[_tokenId] = _kudo;

        // Create new kudo, don't let it be cloned
        for (uint i = 0; i < _numClonesRequested; i++) {
            Kudo memory _newKudo;
            _newKudo.priceFinney = _kudo.priceFinney;
            _newKudo.numClonesAllowed = 0;
            _newKudo.numClonesInWild = 0;
            _newKudo.clonedFromId = _tokenId;

            // Note that Solidity uses 0 as a default value when an item is not found in a mapping.
            uint256 newTokenId = kudos.push(_newKudo) - 1;

            // Mint the new kudos to the msg.sender's account
            _mint(msg.sender, newTokenId);

            // Use the same tokenURI metadata from the Gen0 Kudos
            string memory _tokenURI = tokenURI(_tokenId);
            _setTokenURI(newTokenId, _tokenURI);
        }
    }

    /// @dev cloneAndTransfer(): Clone a new Kudos and then transfer it to a different address.
    /// @param _tokenId The token id of the Kudos to clone and transfer.
    /// @param _numClonesRequested Number of clones to generate.
    /// @param _receiver The address to transfer the Kudos to after it's cloned.
    function cloneAndTransfer(uint256 _tokenId, uint256 _numClonesRequested, address _receiver) public payable {
        // Grab existing Kudo blueprint
        // uint256 gen0KudosId = nameToTokenId[name];
        Kudo memory _kudo = kudos[_tokenId];
        uint256 cloningCost  = _kudo.priceFinney * 10**15 * _numClonesRequested;
        require(
            _kudo.numClonesInWild + _numClonesRequested <= _kudo.numClonesAllowed,
            "The number of Kudos clones requested exceeds the number of clones allowed.");
        require(
            msg.value >= cloningCost,
            "Not enough Wei to pay for the Kudos clones.");

        // Transfer the minting price to the Gen0 Kudos owner to pay for the Kudos clone(s).
        ownerOf(_tokenId).transfer(cloningCost);

        // Update original kudo struct in the array
        _kudo.numClonesInWild += _numClonesRequested;
        kudos[_tokenId] = _kudo;

        // Create new kudo, don't let it be cloned
        for (uint i = 0; i < _numClonesRequested; i++) {
            Kudo memory _newKudo;
            _newKudo.priceFinney = _kudo.priceFinney;
            _newKudo.numClonesAllowed = 0;
            _newKudo.numClonesInWild = 0;
            _newKudo.clonedFromId = _tokenId;

            // Note that Solidity uses 0 as a default value when an item is not found in a mapping.
            uint256 newTokenId = kudos.push(_newKudo) - 1;

            _mint(_receiver, newTokenId);

            // Use the same tokenURI metadata from the Gen0 Kudos
            string memory _tokenURI = tokenURI(_tokenId);
            _setTokenURI(newTokenId, _tokenURI);
        }
    }

    /// @dev burn(): Burn Kudos token.
    /// @param _owner The owner address of the token to burn.
    /// TODO:  Do we need to pay the owner or can we use the ``ownerOf()` function?
    /// @param _tokenId The Kudos ID to be burned.
    function burn(address _owner, uint256 _tokenId) public payable onlyOwner {
        Kudo memory _kudo = kudos[_tokenId];
        uint256 gen0Id = _kudo.clonedFromId;
        if (_tokenId != gen0Id) {
            Kudo memory _gen0Kudo = kudos[gen0Id];
            _gen0Kudo.numClonesInWild -= 1;
            kudos[gen0Id] = _gen0Kudo;
        }
        _burn(_owner, _tokenId);
    }

    /// @dev getKudosById(): Return a Kudos struct/array given a Kudos Id. 
    /// @param _tokenId The Kudos Id.
    /// @return the Kudos struct, in array form.
    function getKudosById(uint256 _tokenId) view public returns (uint256 priceFinney,
                                                                uint256 numClonesAllowed,
                                                                uint256 numClonesInWild,
                                                                uint256 clonedFromId
                                                                )
    {
        Kudo memory _kudo = kudos[_tokenId];

        priceFinney = _kudo.priceFinney;
        numClonesAllowed = _kudo.numClonesAllowed;
        numClonesInWild = _kudo.numClonesInWild;
        clonedFromId = _kudo.clonedFromId;
    }

    /// @dev getNumClonesInWild(): Return a Kudos struct/array given a Kudos Id. 
    /// @param _tokenId The Kudos Id.
    /// @return the number of cloes in the wild
    function getNumClonesInWild(uint256 _tokenId) view public returns (uint256 numClonesInWild)
    {
        Kudo memory _kudo = kudos[_tokenId];

        numClonesInWild = _kudo.numClonesInWild;
    }

    /// @dev updatePrice(): Update the Kudos listing price.
    /// @param _tokenId The Kudos Id.
    /// @param _newPriceFinney The new price of the Kudos.
    /// @return the Kudos struct, in array form.
    function updatePrice(uint256 _tokenId, uint256 _newPriceFinney) public onlyOwner {
        Kudo memory _kudo = kudos[_tokenId];

        _kudo.priceFinney = _newPriceFinney;
        kudos[_tokenId] = _kudo;
    }
}