// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract MyNFT is ERC721, ERC721URIStorage, Ownable {
    uint256 public currentTokenId;
    
    // Событие для отслеживания минтинга
    event NFTMinted(address indexed to, uint256 indexed tokenId, string tokenURI);

    constructor() ERC721("MyNFT", "MNFT") Ownable(msg.sender) {
        currentTokenId = 0;
    }

    // Функция для минтинга NFT на указанный адрес (только владелец)
    function mintToAddress(address to, string calldata metadataURI) public onlyOwner {
        require(to != address(0), "Cannot mint to zero address");
        
        _safeMint(to, currentTokenId);
        _setTokenURI(currentTokenId, metadataURI);
        
        emit NFTMinted(to, currentTokenId, metadataURI);
        currentTokenId++;
    }

    // Функция для получения общего количества токенов
    function totalSupply() public view returns (uint256) {
        return currentTokenId;
    }

    // Переопределенные функции для совместимости
    function tokenURI(uint256 tokenId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (string memory)
    {
        return super.tokenURI(tokenId);
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }

    // Функция для получения всех токенов пользователя
    function getTokensOfOwner(address owner) public view returns (uint256[] memory) {
        uint256 ownerTokenCount = balanceOf(owner);
        uint256[] memory tokenIds = new uint256[](ownerTokenCount);
        uint256 currentIndex = 0;
        
        for (uint256 i = 0; i < currentTokenId; i++) {
            if (_ownerOf(i) == owner) {
                tokenIds[currentIndex] = i;
                currentIndex++;
            }
        }
        
        return tokenIds;
    }
} 