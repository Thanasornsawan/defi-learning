# Compound

## Type of loan
- secured loan = borrow money without providing money as asset as collateral<br/>
However, in general people want to have some proof that you able to repay loan<br/>
For example, you can show how much money you can make.Show history money that you make in the past when you borrow money<br/>
- Non-secured loan = require borrower provide asset in exchange to lend.We call this "collateral".<br/>
At the end of the loan,if the borrower doesn't reimbure the money,collateral will be given to the lender for cover to the loss.<br/>
An example,when you take mortgage loan to buy a house,if you fail to pay back to the bank.Bank will take your house and sell it to reimburse itself.
<br/>
In compound is non-secured loan type, in order to ask for loan, you have to provide token asset as collateral for borrow and pay some interest but in uinswap you deal with liquidity pool.The lender and borrower not have to deal with each other directly.<br/>

## Step by Step
First step, borrower have to provide some collateral to the compound system.For example, if you want to use 'Dai' as collateral,then we will sent some dai to cToken call 'cDai'.Exchange give back cDai token.<br/>
cDai will represent dai that we sent to the compound system and anytime we can redeem cDai token.<br/>
At this step, you are lender when you give token to compond as collateral.The exchange will pay you for all of collateral you give.<br/>

Second step,borrower call 'enterMarket()' in controller, you are willing to use certain set of token as collateral for borrow other token.<br/>

Step three, borrower call 'borrow()' for cBat on the smart contract and it will give back bat token.You can pay back loan to cBat smart contract with bat token but the longer loan has higher fee.The interest rate fixed in compound.<br/>

Step four, redeem your dai token from cDai but if you want to get more interest, you not need to redeem back.<br/>

DAI address = 0x6B175474E89094C44Da98b954EedeAC495271d0F<br/>
compController address = 0x374ABb8cE19A73f2c4EFAd642bda76c797f19233<br/>
cDai address = 0x5d3a536E4D6DbD6114cc1Ead35777bAB948E3643<br/>
BAT address = 0x0D8775F648430679A709E98d2b0Cb6250d2887EF<br/>
cBat address = 0x6C8c6b02E7b2BE14d4fA6022Dfd6d75921D90E4E<br/>
Unlock DAI address = 0x56178a0d5f301baf6cf3e1cd53d9863437345bf9 (creator of DAI token)<br/>
https://etherscan.io/token/0x6b175474e89094c44da98b954eedeac495271d0f?a=0x56178a0d5f301baf6cf3e1cd53d9863437345bf9<br/>
<br/>
dai ABI from https://etherscan.io/address/0x6b175474e89094c44da98b954eedeac495271d0f#code<br/>
compController ABI from https://etherscan.io/address/0x374abb8ce19a73f2c4efad642bda76c797f19233#code<br/>
cDai ABI from https://etherscan.io/address/0x5d3a536e4d6dbd6114cc1ead35777bab948e3643#code<br/>
BAT ABI from https://etherscan.io/address/0x0d8775f648430679a709e98d2b0cb6250d2887ef#code<br/>
cBat ABI from https://etherscan.io/address/0x6c8c6b02e7b2be14d4fa6022dfd6d75921d90e4e#code<br/>

testing script.js with localhost network that fork from mainnet<br/>
terminal 1: run command `npm run fork`

![console1](https://github.com/Thanasornsawan/defi-learning/blob/main/contracts/compound/photo/test2.jpg)

terminal 2: run command `npx hardhat run scripts/script.js --network localhost`

![console2](https://github.com/Thanasornsawan/defi-learning/blob/main/contracts/compound/photo/test.jpg)