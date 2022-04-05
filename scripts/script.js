const hre = require("hardhat");
const Web3 = require('web3');
const web3 = new Web3('http://127.0.0.1:8545');
const daiAbi = require('../build/daiAbi.json');
const batAbi = require('../build/batAbi.json');
const cDaiAbi = require('../build/cDaiAbi.json');
const cBatAbi = require('../build/cBatAbi.json');
const compTrollerAbi = require('../build/compTrollerAbi.json');
const daiAdress = '0x6B175474E89094C44Da98b954EedeAC495271d0F';
const batAddress = '0x0D8775F648430679A709E98d2b0Cb6250d2887EF';
const cDaiAddress = '0x5d3a536E4D6DbD6114cc1Ead35777bAB948E3643';
const cBatAddress = '0x6C8c6b02E7b2BE14d4fA6022Dfd6d75921D90E4E';
const compTrollerAddress = '0x374ABb8cE19A73f2c4EFAd642bda76c797f19233';

const dai = new web3.eth.Contract(daiAbi,daiAdress);
const bat = new web3.eth.Contract(batAbi,batAddress);
const cDai = new web3.eth.Contract(cDaiAbi,cDaiAddress);
const cBat = new web3.eth.Contract(cBatAbi,cBatAddress);
const compTroller = new web3.eth.Contract(compTrollerAbi,compTrollerAddress);
const unlockedAddress = '0x56178a0d5f301baf6cf3e1cd53d9863437345bf9';

async function main() {

  const myDefiProject = await hre.ethers.getContractFactory("myDefiProject");
  const myDefi = await myDefiProject.deploy(daiAdress,cDaiAddress,batAddress,cBatAddress,compTrollerAddress);

  await myDefi.deployed();
  console.log("myDefi deployed to:", myDefi.address);

  let recipientAddress = await web3.eth.getAccounts().then( function (result) { return result[0] });
  console.log("my Wallet address:", recipientAddress);
  
  await hre.network.provider.request({
    method: "hardhat_impersonateAccount",
    params: [unlockedAddress],
  });
    const admin = hre.ethers.provider.getSigner(unlockedAddress);
    console.log("before transfer ETH to recipient");
    let borrower_balance = await web3.eth.getBalance(unlockedAddress);
    let borrower_ethBalance = web3.utils.fromWei(borrower_balance, 'ether')
    console.log("ETH balance of admin : ", borrower_ethBalance); //9.704160744297630164

    let my_balance = await web3.eth.getBalance(recipientAddress);
    let my_ethBalance = web3.utils.fromWei(my_balance, 'ether')
    console.log("ETH balance of my wallet : ", my_ethBalance);
   
    let unlockedBalance, recipientBalance;
    ([unlockedBalance, recipientBalance] = await Promise.all
      ([
        dai.methods
          .balanceOf(unlockedAddress)
          .call (),
        dai.methods
          .balanceOf(recipientAddress)
          .call()
      ]));
      console.log(`Admin DAI Balance: ${unlockedBalance}`);
      console.log(`Recipient DAI Balance: ${recipientBalance}`);
    
      const resp = await admin.sendTransaction({
        to: recipientAddress,
        value: ethers.utils.parseEther('1.0'),
      });
      console.log("after transfer ETH to recipient");
      await hre.network.provider.request({
        method: "hardhat_impersonateAccount",
        params: [recipientAddress],
      });
      const recipient = hre.ethers.provider.getSigner(recipientAddress);

    borrower_balance = await web3.eth.getBalance(unlockedAddress);
    borrower_ethBalance = web3.utils.fromWei(borrower_balance, 'ether')
    console.log("ETH balance of admin : ", borrower_ethBalance);

    my_balance = await web3.eth.getBalance(recipientAddress);
    my_ethBalance = web3.utils.fromWei(my_balance, 'ether')
    console.log("ETH balance of my wallet : ", my_ethBalance); 

      /*
      await dai.methods
      .transfer(recipientAddress, 1000)
      .send({from: unlockedAddress}); 
      */   
    
    await myDefi.connect(admin).borrow();
   
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
