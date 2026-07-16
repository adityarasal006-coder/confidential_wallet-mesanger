// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract MockERC20 is ERC20, Ownable {
    constructor() ERC20("Confidential Token", "CTK") Ownable(msg.sender) {
        _mint(msg.sender, 1000000 * 10 ** decimals());
    }

    function mint(address to, uint256 amount) public onlyOwner {
        _mint(to, amount);
    }
    
    // Allow anyone to mint for testing on testnet
    function faucet(address to, uint256 amount) public {
        require(amount <= 1000 * 10 ** decimals(), "Max 1000 tokens per faucet request");
        _mint(to, amount);
    }
}
