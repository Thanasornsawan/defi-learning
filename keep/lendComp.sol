// SPDX-License-Identifier: MIT
pragma solidity ^0.5.16;

import "../interfaces/IERC20.sol";
import "../interfaces/ComptrollerInterface.sol";
import "../interfaces/CTokenInterface.sol";

contract myDefiProject {
    IERC20 dai;
    CTokenInterface cDai;
    IERC20 bat;
    CTokenInterface cBat;
    ComptrollerInterface comptroller;

    constructor (
        address _dai,
        address _cDai,
        address _bat,
        address _cBat,
        address _comptroller) public {
            dai = IERC20(_dai);
            cDai = CTokenInterface(_cDai);
            bat = IERC20(_bat);
            cBat = CTokenInterface(_cBat);
            comptroller = ComptrollerInterface(_comptroller);
    }

    function invest() external {
        uint amount = 500;
        dai.approve(address(cDai), amount);
        cDai.mint(amount);
    }

    function cashOut() external {
        uint balance = cDai.balanceOf(address(this)); //because it has interest rate + amount we put
        cDai.redeem(balance);
    }

    function borrow() external {
        uint amount = 500;
        dai.approve(address(cDai), amount);
        cDai.mint(amount);

        address[] memory markets = new address[](1);
        markets[0] = address(cDai);
        comptroller.enterMarkets(markets);
        
        cBat.borrow(100); //borrow 100 bat
    }

    function payback() external {
        bat.approve(address(cBat), 200); //spare some about for the interest of loan
        cBat.repayBorrow(100); //pay 100 cBat back
    }

}

