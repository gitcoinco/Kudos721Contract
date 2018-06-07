pragma solidity ^0.4.24;

import 'zeppelin-solidity/contracts/token/ERC721/ERC721Token.sol';

contract Kudos is ERC721Token("KudosToken", "KDO") {

    mapping(uint256 => string) internal tokenIdToName;
    mapping(string => uint256) internal nameToTokenId;

    function create(string name) public {
        require(nameToTokenId[name] == 0);
        uint256 tokenId = allTokens.length + 1;
        _mint(msg.sender, tokenId);
        tokenIdToName[tokenId] = name;
        nameToTokenId[name] = tokenId;
    }

    function getTokenName(uint256 tokenId) view public returns (string) {
        return tokenIdToName[tokenId];
    }

    function getTokenId(string name) view public returns (uint) {
        return nameToTokenId[name];
    }
}