// SPDX-License-Identifier: MIT
pragma solidity 0.8.9;

import '@openzeppelin/contracts/token/ERC721/IERC721.sol';

contract NFTAirdrop {
  struct Airdrop {
    address nft;
    uint id;
  }
  uint public nextAirdropId;
  address public admin;
  mapping(uint => Airdrop) public airdrops;
  mapping(address => bool) public recipients;

  constructor() {
    admin = msg.sender;
  }

  //sent our NFT to our smart contract for available to claim for recipient
  function addAirdrops(Airdrop[] memory _airdrops) external {
    require(msg.sender == admin, 'only admin');
    uint _nextAirdropId = nextAirdropId;
    for(uint i = 0; i < _airdrops.length; i++) {
      airdrops[_nextAirdropId] = _airdrops[i];
      IERC721(_airdrops[i].nft).transferFrom(
        msg.sender, 
        address(this), 
        _airdrops[i].id
      );
      _nextAirdropId++;
    }
  }

  function addRecipients(address[] memory _recipients) external {
    require(msg.sender == admin, 'only admin');
    for(uint i = 0; i < _recipients.length; i++) {
      recipients[_recipients[i]] = true;
    }
  }

  function removeRecipients(address[] memory _recipients) external {
    require(msg.sender == admin, 'only admin');
    for(uint i = 0; i < _recipients.length; i++) {
      recipients[_recipients[i]] = false; //disable recipient address in case overtime 1 week to get airdrop
    }
  }

  function claim() external {
    require(recipients[msg.sender] == true, 'recipient not registered');
    recipients[msg.sender] = false; //recipient cannot cliam airdrop twice
    Airdrop storage airdrop = airdrops[nextAirdropId];
    IERC721(airdrop.nft).transferFrom(address(this), msg.sender, airdrop.id);
    nextAirdropId++;
  }
}