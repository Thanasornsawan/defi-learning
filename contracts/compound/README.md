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

testing script.js with localhost network that fork from mainnet<br/>
terminal 1: run command `npm run fork`

![console1](https://github.com/Thanasornsawan/defi-learning/blob/main/contracts/compound/photo/test2.jpg)

terminal 2: run command `npx hardhat test ./test/test-compound-erc20.js --network localhost` for test supply and redeem.

![console2](https://github.com/Thanasornsawan/defi-learning/blob/main/contracts/compound/photo/test.jpg)

terminal 2: run command `npx hardhat test test/test-compound-erc20-borrow.js --network localhost`

![console3](https://github.com/Thanasornsawan/defi-learning/blob/main/contracts/compound/photo/test3.JPG)