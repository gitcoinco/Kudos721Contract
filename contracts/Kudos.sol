pragma solidity ^0.4.24;

import 'openzeppelin-solidity/contracts/token/ERC721/ERC721Token.sol';
import 'openzeppelin-solidity/contracts/ownership/Ownable.sol';
import 'openzeppelin-solidity/contracts/math/SafeMath.sol';

/// @title Kudos
/// @author Jason Haas <jasonrhaas@gmail.com>
/// @notice Kudos ERC721 interface for minting, cloning, and transferring Kudos tokens.
contract Kudos is ERC721Token("KudosToken", "KDO"), Ownable {
    using SafeMath for uint256;

    struct Kudo {
        uint256 priceFinney;
        uint256 numClonesAllowed;
        uint256 numClonesInWild;
        uint256 clonedFromId;
    }

    Kudo[] public kudos;
    uint256 public cloneFeePercentage = 10;

    /// @dev mint(): Mint a new Gen0 Kudos.  These are the tokens that other Kudos will be "cloned from".
    /// @param _to Address to mint to.
    /// @param _priceFinney Price of the Kudos in Finney.
    /// @param _numClonesAllowed Maximum number of times this Kudos is allowed to be cloned.
    /// @param _tokenURI A URL to the JSON file containing the metadata for the Kudos.  See metadata.json for an example.
    /// @return the tokenId of the Kudos that has been minted.  Note that in a transaction only the tx_hash is returned.
    function mint(address _to, uint256 _priceFinney, uint256 _numClonesAllowed, string _tokenURI) public payable onlyOwner returns (uint256 tokenId) {
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

    }

    /// @dev clone(): Clone a new Kudos from a Gen0 Kudos.
    /// @param _to The address to clone to.
    /// @param _tokenId The token id of the Kudos to clone and transfer.
    /// @param _numClonesRequested Number of clones to generate.
    function clone(address _to, uint256 _tokenId, uint256 _numClonesRequested) public payable {
        // Grab existing Kudo blueprint
        Kudo memory _kudo = kudos[_tokenId];
        uint256 cloningCost  = _kudo.priceFinney * 10**15 * _numClonesRequested;
        require(
            _kudo.numClonesInWild + _numClonesRequested <= _kudo.numClonesAllowed,
            "The number of Kudos clones requested exceeds the number of clones allowed.");
        require(
            msg.value >= cloningCost,
            "Not enough Wei to pay for the Kudos clones.");

        // Pay the contract owner the cloneFeePercentage amount
        uint256 contractOwnerFee = (cloningCost.mul(cloneFeePercentage)).div(100);
        owner.transfer(contractOwnerFee);

        // Pay the token owner the cloningCost - contractOwnerFee
        uint256 tokenOwnerFee = cloningCost.sub(contractOwnerFee);
        ownerOf(_tokenId).transfer(tokenOwnerFee);

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

            // Mint the new kudos to the _to account
            _mint(_to, newTokenId);

            // Use the same tokenURI metadata from the Gen0 Kudos
            string memory _tokenURI = tokenURI(_tokenId);
            _setTokenURI(newTokenId, _tokenURI);
        }
    }


    /// @dev burn(): Burn Kudos token.
    /// @param _owner The owner address of the token to burn.
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

    /// @dev setCloneFeePercentage(): Update the Kudos clone fee percentage.  Upon cloning a new kudos,
    ///                               cloneFeePercentage will go to the contract owner, and
    ///                               (100 - cloneFeePercentage) will go to the Gen0 Kudos owner.
    /// @param _cloneFeePercentage The percentage fee between 0 and 100.
    function setCloneFeePercentage(uint256 _cloneFeePercentage) public onlyOwner {
        require(
            _cloneFeePercentage >= 0 && _cloneFeePercentage <= 100,
            "Invalid range for cloneFeePercentage.  Must be between 0 and 100.");
        cloneFeePercentage = _cloneFeePercentage;
    }

    /// @dev setPrice(): Update the Kudos listing price.
    /// @param _tokenId The Kudos Id.
    /// @param _newPriceFinney The new price of the Kudos.
    function setPrice(uint256 _tokenId, uint256 _newPriceFinney) public onlyOwner {
        Kudo memory _kudo = kudos[_tokenId];

        _kudo.priceFinney = _newPriceFinney;
        kudos[_tokenId] = _kudo;
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
}