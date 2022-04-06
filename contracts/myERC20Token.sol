// SPDX-License-Identifier: MIT
pragma solidity 0.8.9;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract MyERC20Token is ERC20, Ownable{
address public admin;
    constructor() ERC20("PLOY", "PLY") {
        _mint(msg.sender, 10000 * 10 ** 18);
        admin = msg.sender;
    }

    function mint(address _to, uint _amount) external onlyOwner {
        //require(msg.sender == admin, "Only admin");
        _mint(_to, _amount);
    }

    function burn(uint amount) external onlyOwner {
        //equire(msg.sender == admin, "Only admin");
        _burn(msg.sender,amount);
    }
}