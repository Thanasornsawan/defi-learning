const hre = require("hardhat");
const Web3 = require('web3');
const web3 = new Web3('http://127.0.0.1:8545');
const daiAbi = require('../build/daiAbi.json');
const batAbi = require('../build/batAbi.json');
const cDaiAbi = require('../build/cDaiAbi.json');
const cBatAbi = require('../build/cBatAbi.json');
const compTrollerAbi = require('../build/compTrollerAbi.json');
const { DAI, DAI_WHALE, CDAI, BAT, CBAT, COMP_CONTROLLER } = require("../config");

const dai = new web3.eth.Contract(daiAbi,DAI);
const bat = new web3.eth.Contract(batAbi,BAT);
const cDai = new web3.eth.Contract(cDaiAbi,CDAI);
const cBat = new web3.eth.Contract(cBatAbi,CBAT);
const compTroller = new web3.eth.Contract(compTrollerAbi,COMP_CONTROLLER);

async function main() {

  const myDefiProject = await hre.ethers.getContractFactory("myDefiProject");
  const myDefi = await myDefiProject.deploy(daiAdress,cDaiAddress,batAddress,cBatAddress,compTrollerAddress);

  await myDefi.deployed();
  console.log("myDefi deployed to:", myDefi.address);

  let recipientAddress = await web3.eth.getAccounts().then( function (result) { return result[0] });
  console.log("my Wallet address:", recipientAddress);
  
  //impersonate to be DAI WHALE account and sign
  await hre.network.provider.request({
    method: "hardhat_impersonateAccount",
    params: [DAI_WHALE],
  });
    const admin = hre.ethers.provider.getSigner(DAI_WHALE);
    //////////////////////////////////////////////////////

    console.log("before transfer ETH to recipient");

    let borrower_balance = await web3.eth.getBalance(DAI_WHALE);
    let borrower_ethBalance = web3.utils.fromWei(borrower_balance, 'ether')
    console.log("ETH balance of admin : ", borrower_ethBalance); //9.704160744297630164

    let my_balance = await web3.eth.getBalance(recipientAddress);
    let my_ethBalance = web3.utils.fromWei(my_balance, 'ether')
    console.log("ETH balance of my wallet : ", my_ethBalance);

    //Check amount of DAI in DAI WHALE   
    let unlockedBalance, recipientBalance;
    ([unlockedBalance, recipientBalance] = await Promise.all
      ([
        dai.methods
          .balanceOf(DAI_WHALE)
          .call (),
        dai.methods
          .balanceOf(recipientAddress)
          .call()
      ]));
      console.log(`Admin DAI Balance: ${unlockedBalance}`);
      console.log(`Recipient DAI Balance: ${recipientBalance}`);
    
      //test impersonate account can work fine by use admin to transfer money to our account (admin = DAI_WHALE)
      await admin.sendTransaction({
        to: recipientAddress,
        value: ethers.utils.parseEther('1.0'),
      });
      
      console.log("after transfer ETH to recipient");

    borrower_balance = await web3.eth.getBalance(DAI_WHALE);
    borrower_ethBalance = web3.utils.fromWei(borrower_balance, 'ether')
    console.log("ETH balance of admin : ", borrower_ethBalance);

    my_balance = await web3.eth.getBalance(recipientAddress);
    my_ethBalance = web3.utils.fromWei(my_balance, 'ether')
    console.log("ETH balance of my wallet : ", my_ethBalance); 

      /* test transfer DAI from DAI_WHALE  to our account
      await dai.methods
      .transfer(recipientAddress, 1000)
      .send({from: DAI_WHALE}); 
      */   
    
    //await myDefi.connect(admin).borrow();
   
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
