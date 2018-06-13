pragma solidity ^0.4.24;

import 'zeppelin-solidity/contracts/token/ERC721/ERC721Token.sol';

contract Kudos is ERC721Token("KudosToken", "KDO") {

    mapping(uint256 => string) internal tokenIdToName;
    mapping(string => uint256) internal nameToTokenId;
    mapping(uint256 => string) internal tokenIdToDescription;
    mapping(uint256 => uint256) internal tokenIdToRareness;
    mapping(uint256 => uint256) internal tokenIdToPrice;
    mapping(string => uint256) internal nameToNumClonesAvail;
    mapping(string => uint256) internal nameToNumClonesInWild;

    function create(string name, string description, uint256 rareness, uint256 price, uint256 numClonesAllowed) public {
        require(nameToTokenId[name] == 0);
        uint256 tokenId = allTokens.length + 1;
        _mint(msg.sender, tokenId);

        nameToTokenId[name] = tokenId;
        tokenIdToName[tokenId] = name;
        tokenIdToDescription[tokenId] = description;
        tokenIdToRareness[tokenId] = rareness;
        tokenIdToPrice[tokenId] = price;
        nameToNumClonesAvail[name] = numClonesAllowed;
        nameToNumClonesInWild[name] = 0;
    }

    function clone(string name) public {
        require(nameToNumClonesAvail[name] != 0);
        uint256 tokenId = allTokens.length + 1;
        _mint(msg.sender, tokenId);
        nameToNumClonesInWild[name] += 1;
        nameToNumClonesAvail[name] -= 1;
    }

    function getTokenName(uint256 tokenId) view public returns (string) {
        return tokenIdToName[tokenId];
    }

    function getTokenId(string name) view public returns (uint256) {
        return nameToTokenId[name];
    }

    function getTokenDescription(uint256 tokenId) view public returns (string) {
        return tokenIdToDescription[tokenId];
    }

    function getTokenRareness(uint256 tokenId) view public returns (uint256) {
        return tokenIdToRareness[tokenId];
    }

    function getTokenPrice(uint256 tokenId) view public returns (uint256) {
        return tokenIdToPrice[tokenId];
    }

    function getNumClonesInWild(string name) view public returns (uint256) {
        return nameToNumClonesInWild[name];
    }

    function getNumClonesAvail(string name) view public returns (uint256) {
        return nameToNumClonesAvail[name];
    }

}