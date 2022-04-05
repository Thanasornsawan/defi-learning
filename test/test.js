const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("NFT Airdrop", function () {
  let admin;
  let recipient1;
  let recipient2;
  let recipient3;
  
  before(async function () {
    this.NFT = await hre.ethers.getContractFactory('NFT');
    this.AIRDROP = await hre.ethers.getContractFactory('NFTAirdrop');
  });

  beforeEach(async function () {
    [admin, recipient1, recipient2, recipient3] = await ethers.getSigners();
    this.nft = await this.NFT.deploy();
    await this.nft.deployed();
    this.airdrop = await this.AIRDROP.deploy();
    await this.airdrop.deployed();
    await this.nft.setApprovalForAll(this.airdrop.address, true);
  });

  it("should airdrop", async function () {

    await this.airdrop.addAirdrops([
      {"nft":this.nft.address,"id": 0},
      {"nft":this.nft.address,"id": 1},
      {"nft":this.nft.address,"id": 2},
    ]);
    await this.airdrop.addRecipients([recipient1.address, recipient2.address, recipient3.address]); 
    await this.airdrop.connect(recipient1).claim();
    await this.airdrop.connect(recipient2).claim();
    await this.airdrop.connect(recipient3).claim();
    const owner1 = await this.nft.ownerOf(0);
    const owner2 = await this.nft.ownerOf(1);
    const owner3 = await this.nft.ownerOf(2);
    expect(owner1).to.equal(recipient1.address);
    expect(owner2).to.equal(recipient2.address);
    expect(owner3).to.equal(recipient3.address);
  });

});
