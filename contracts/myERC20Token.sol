// SPDX-License-Identifier: MIT
pragma solidity 0.8.9;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract MyERC20Token is ERC20{
address public admin;
    constructor() ERC20("PLOY", "PLY") {
        _mint(msg.sender, 10000 * 10 ** 18);
        admin = msg.sender;
    }

    function mint(address _to, uint _amount) external {
        require(msg.sender == admin, "Only admin");
        _mint(_to, _amount);
    }

    function burn(uint amount) external {
        require(msg.sender == admin, "Only admin");
        _burn(msg.sender,amount);
    }
}