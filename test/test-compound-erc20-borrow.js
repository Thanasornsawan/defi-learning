const chai = require('chai');
const { ethers } = require("hardhat");
const { time } = require("@openzeppelin/test-helpers");
const { sendEther, pow } = require("../utils.js");
const { DAI, DAI_WHALE, CDAI, WBTC, WBTC_WHALE, CWBTC } = require("../config.js");
const { web3 } = require("@openzeppelin/test-helpers/src/setup");
const BN = web3.utils.BN;
const { parseUnits } = require('ethers/lib/utils');
const { default: BigNumber } = require('bignumber.js');
const { parseFixed } = require('@ethersproject/bignumber');
const expect = chai.expect;
chai.use(require('chai-bn')(BN));

describe("test compound", function () {
  const WHALE = WBTC_WHALE
  const TOKEN = WBTC
  const C_TOKEN = CWBTC
  const TOKEN_TO_BORROW = DAI
  const C_TOKEN_TO_BORROW = CDAI
  const REPAY_WHALE = DAI_WHALE // used to repay interest on borrow

  const SUPPLY_DECIMALS = 8 // WBTC = 8 decimals
  let SUPPLY_AMOUNT = pow(10, SUPPLY_DECIMALS).mul(new BN(1))
  const BORROW_DECIMALS = 18 //One ether = 1,000,000,000,000,000,000 wei (10**18)
  let BORROW_INTEREST = pow(10, BORROW_DECIMALS).mul(new BN(1000)) 
  
  let testCompound
  let token
  let cToken
  let tokenToBorrow
  let cTokenToBorrow

      before(async function () {
        this.COMPOUND = await hre.ethers.getContractFactory('TestCompoundErc20');
      });
    
      beforeEach(async function () {
        let recipient = await web3.eth.getAccounts().then( function (result) { return result[0] });
        await sendEther(web3, recipient, WHALE, 1)
        testCompound = await this.COMPOUND.deploy(TOKEN, C_TOKEN);
        await testCompound.deployed();
        token = await hre.ethers.getContractAt("IERC20", TOKEN);
        cToken = await hre.ethers.getContractAt("CErc20", C_TOKEN);
        tokenToBorrow = await hre.ethers.getContractAt("IERC20", TOKEN_TO_BORROW);
        cTokenToBorrow = await hre.ethers.getContractAt("CErc20", C_TOKEN_TO_BORROW);
        const supplyBal = await token.balanceOf(WHALE)
        console.log(`supply WBTC whale balance: ${supplyBal.div(BigInt(pow(10, SUPPLY_DECIMALS)))}`);
        expect(parseFixed(supplyBal.toString())).gte(parseFixed(SUPPLY_AMOUNT.toString()));

        const borrowBal = await tokenToBorrow.balanceOf(REPAY_WHALE)
        console.log(`repay whale balance: ${borrowBal.div(BigInt(pow(10, BORROW_DECIMALS)))}`);
        expect(parseFixed(borrowBal.toString())).gte(parseFixed(BORROW_INTEREST.toString()));
      });
    
      
      const snapshot = async (testCompound, tokenToBorrow) => {
        const { liquidity } = await testCompound.getAccountLiquidity()
        const colFactor = await testCompound.getCollateralFactor()
        const supplied = await testCompound.callStatic.balanceOfUnderlying()
        const price = await testCompound.getPriceFeed(C_TOKEN_TO_BORROW)
        
        const maxBorrow = parseFixed(liquidity.toString()).div(parseFixed(price.toString()))
        const borrowedBalance = await testCompound.callStatic.getBorrowedBalance(C_TOKEN_TO_BORROW)
        const tokenToBorrowBal = await tokenToBorrow.balanceOf(testCompound.address)
        const borrowRate = await testCompound.callStatic.getBorrowRatePerBlock(C_TOKEN_TO_BORROW)

        return {
          
            colFactor: parseFixed(colFactor.toString()).div(BigInt(pow(10, 18 - 2)))/ 100,
            supplied: parseFixed(supplied.toString()).div(BigInt(pow(10, SUPPLY_DECIMALS - 2))) / 100,
            price: parseFixed(price.toString()).div(BigInt(pow(10, 18 - 2))) / 100,
            liquidity: parseFixed(liquidity.toString()).div(BigInt(pow(10, 18))),
            maxBorrow,
            borrowedBalance: parseFixed(borrowedBalance.toString()).div(BigInt(pow(10, BORROW_DECIMALS - 2))) / 100,
            tokenToBorrowBal: parseFixed(tokenToBorrowBal.toString()).div(BigInt(pow(10, BORROW_DECIMALS - 2))) / 100,
            borrowRate,
            
        }
      }
      
  
      it("should supply, borrow and repay", async function () {
       
        // used for debugging
        let tx
        let snap
        //impersonate to be WBTC WHALE account and sign
        await hre.network.provider.request({
          method: "hardhat_impersonateAccount",
          params: [WHALE],
        });
        const whale = hre.ethers.provider.getSigner(WHALE);
        
        // supply
        SUPPLY_AMOUNT = parseFixed(SUPPLY_AMOUNT.toString());
        await token.connect(whale).approve(testCompound.address, SUPPLY_AMOUNT)
        tx = await testCompound.connect(whale).supply(SUPPLY_AMOUNT)
        
        // borrow
        snap = await snapshot(testCompound, tokenToBorrow)
        console.log(`--- borrow (before) ---`)
        console.log(`col factor: ${snap.colFactor} %`)
        
        console.log(`supplied: ${snap.supplied}`)
        console.log(`liquidity: $ ${snap.liquidity}`)
        console.log(`price: $ ${snap.price}`)
        console.log(`max borrow: ${snap.maxBorrow}`)
        console.log(`borrowed balance (compound): ${snap.borrowedBalance}`)
        console.log(`borrowed balance (erc20): ${snap.tokenToBorrowBal}`)
        console.log(`borrow rate: ${snap.borrowRate}`)

        tx = await testCompound.connect(whale).borrow(C_TOKEN_TO_BORROW, BORROW_DECIMALS)

        snap = await snapshot(testCompound, tokenToBorrow)
        console.log(`--- borrow (after) ---`)
        console.log(`liquidity: $ ${snap.liquidity}`)
        console.log(`max borrow: ${snap.maxBorrow}`)
        console.log(`borrowed balance (compound): ${snap.borrowedBalance}`)
        console.log(`borrowed balance (erc20): ${snap.tokenToBorrowBal}`)

        // accrue interest on borrow
        const block = await web3.eth.getBlockNumber()
        await time.advanceBlockTo(block + 100)

        snap = await snapshot(testCompound, tokenToBorrow)
        console.log(`--- after some blocks... ---`)
        console.log(`liquidity: $ ${snap.liquidity}`)
        console.log(`max borrow: ${snap.maxBorrow}`)
        console.log(`borrowed balance (compound): ${snap.borrowedBalance}`)
        console.log(`borrowed balance (erc20): ${snap.tokenToBorrowBal}`)

        // repay
        //impersonate to be DAI WHALE account and sign
        await hre.network.provider.request({
            method: "hardhat_impersonateAccount",
            params: [REPAY_WHALE],
          });
        const repay_whale = hre.ethers.provider.getSigner(REPAY_WHALE);
        BORROW_INTEREST = parseFixed(BORROW_INTEREST.toString());
        await tokenToBorrow.connect(repay_whale).transfer(testCompound.address, BORROW_INTEREST)
        const MAX_UINT = BigInt(pow(2, 256).sub(new BN(1)))
        tx = await testCompound.connect(repay_whale).repay(TOKEN_TO_BORROW, C_TOKEN_TO_BORROW, MAX_UINT)

        snap = await snapshot(testCompound, tokenToBorrow)
        console.log(`--- repay ---`)
        console.log(`liquidity: $ ${snap.liquidity}`)
        console.log(`max borrow: ${snap.maxBorrow}`)
        console.log(`borrowed balance (compound): ${snap.borrowedBalance}`)
        console.log(`borrowed balance (erc20): ${snap.tokenToBorrowBal}`)
        
        });
    
    });