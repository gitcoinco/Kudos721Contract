pragma solidity ^0.4.24;

import 'zeppelin-solidity/contracts/token/ERC721/ERC721Token.sol';
import 'zeppelin-solidity/contracts/ownership/Ownable.sol';

contract Kudos is ERC721Token("KudosToken", "KDO"), Ownable { 
    struct Kudo {
        string name;
        string description;
        uint256 rareness;
        uint256 price;
        uint256 numClonesAllowed;
        uint256 numClonesInWild;
    }

    Kudo[] public kudos;

    mapping(string => uint256) internal nameToTokenId;

    function create(string name, string description, uint256 rareness, uint256 price, uint256 numClonesAllowed) public payable{
        require(nameToTokenId[name] == 0);
        uint256 _numClonesInWild = 0;

        Kudo memory _kudo = Kudo({name: name, description: description, rareness: rareness, price: price, numClonesAllowed: numClonesAllowed, numClonesInWild: _numClonesInWild});
        uint256 tokenId = kudos.push(_kudo) - 1;

        _mint(msg.sender, tokenId);

        nameToTokenId[name] = tokenId;
    }

    function clone(string name) public {
        // Grab existing Kudo blueprint
        Kudo memory _kudo = kudos[nameToTokenId[name]];
        require(_kudo.numClonesInWild < _kudo.numClonesAllowed);

        // Update original kudo struct in the array
        _kudo.numClonesInWild += 1;
        kudos[nameToTokenId[name]] = _kudo;

        // Create new kudo, don't let it be cloned
        Kudo memory _newKudo = _kudo;
        _newKudo.numClonesAllowed = 0;
        _newKudo.numClonesInWild = _kudo.numClonesInWild;

        // The new kudo is pushed onto the array and minted
        uint256 tokenId = kudos.push(_newKudo) - 1;
        _mint(msg.sender, tokenId);

    function burn(address owner, uint256 tokenId) public payable{
        _burn(owner, tokenId);
    }

    function getKudoById(uint256 tokenId) view public returns (string name, string description, uint256 rareness, uint256 price, uint256 numClonesAllowed, uint256 numClonesInWild) {
        Kudo memory _kudo = kudos[tokenId];

        name = _kudo.name;
        description = _kudo.description;
        rareness = _kudo.rareness;
        price = _kudo.price;
        numClonesAllowed = _kudo.numClonesAllowed;
        numClonesInWild = _kudo.numClonesInWild;
    }


    function getTokenId(string name) view public returns (uint256) {
        return nameToTokenId[name];
    }

}