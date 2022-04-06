const { assert } = require('chai');
const { ethers } = require("hardhat");
const { time } = require("@openzeppelin/test-helpers");
const { sendEther, pow } = require("../utils.js");
const { DAI, DAI_WHALE, CDAI, WBTC, WBTC_WHALE, CWBTC } = require("../config.js");
const { web3 } = require("@openzeppelin/test-helpers/src/setup");

let DEPOSIT_AMOUNT = pow(10, 8) //100000000
DEPOSIT_AMOUNT = (DEPOSIT_AMOUNT).toNumber();

describe("test compound", function () {
  const WHALE = WBTC_WHALE
  const TOKEN = WBTC
  const C_TOKEN = CWBTC
  let testCompound
  let token
  let cToken

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
      const bal = await token.balanceOf(WHALE)
      console.log(`whale balance: ${bal}`)
      assert(bal.gte(DEPOSIT_AMOUNT), "bal < deposit")
    });
  
    const snapshot = async (testCompound, token, cToken) => {
      const { exchangeRate, supplyRate } = await testCompound.callStatic.getInfo();
  
      return {
        exchangeRate,
        supplyRate,
        estimateBalance: await testCompound.callStatic.estimateBalanceOfUnderlying(),
        balanceOfUnderlying: await testCompound.callStatic.balanceOfUnderlying(),
        token: await token.balanceOf(testCompound.address),
        cToken: await cToken.balanceOf(testCompound.address),
      }
    }

    it("should supply and redeem", async function () {
      //impersonate to be DAI WHALE account and sign
      await hre.network.provider.request({
        method: "hardhat_impersonateAccount",
        params: [WHALE],
      });
      const whale = hre.ethers.provider.getSigner(WHALE);
      await token.connect(whale).approve(testCompound.address, DEPOSIT_AMOUNT)

      let tx = await testCompound.connect(whale).supply(DEPOSIT_AMOUNT)

      let after = await snapshot(testCompound, token, cToken)

      console.log("--- supply ---")
      console.log(`exchange rate ${after.exchangeRate}`)
      console.log(`supply rate ${after.supplyRate}`)
      console.log(`estimate balance ${after.estimateBalance}`)
      console.log(`balance of underlying ${after.balanceOfUnderlying}`)
      console.log(`token balance ${after.token}`)
      console.log(`c token balance ${after.cToken}`)

      // accrue interest on supply
      const block = await web3.eth.getBlockNumber()
      await time.advanceBlockTo(block + 100)

      after = await snapshot(testCompound, token, cToken)

      console.log(`--- after some blocks... ---`)
      console.log(`balance of underlying ${after.balanceOfUnderlying}`)

      // test redeem
      const cTokenAmount = await cToken.balanceOf(testCompound.address)
      tx = await testCompound.connect(whale).redeem(cTokenAmount)

      after = await snapshot(testCompound, token, cToken)

      console.log(`--- redeem ---`)
      console.log(`balance of underlying ${after.balanceOfUnderlying}`)
      console.log(`token balance ${after.token}`)
      console.log(`c token balance ${after.cToken}`)
      });
  
  });