// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title StealthRelayer
 * @dev A relayer contract that allows senders to send AVAX or ERC20 tokens to stealth addresses
 * and emit events with the ephemeral public key to allow recipients to discover their funds.
 */
contract StealthRelayer is ReentrancyGuard {
    using SafeERC20 for IERC20;

    /**
     * @dev Emitted when a stealth payment is made.
     * @param stealthAddress The recipient's stealth address.
     * @param ephemeralPubKey The ephemeral public key (uncompressed, usually 64 bytes without the 0x04 prefix).
     * @param token The address of the ERC20 token, or address(0) for AVAX.
     * @param amount The amount of tokens or AVAX sent.
     */
    event StealthPayment(
        address indexed stealthAddress,
        bytes ephemeralPubKey,
        address indexed token,
        uint256 amount
    );

    /**
     * @notice Send native AVAX to a stealth address.
     * @param stealthAddress The stealth address generated off-chain.
     * @param ephemeralPubKey The ephemeral public key used to generate the stealth address.
     */
    function sendAVAX(address stealthAddress, bytes calldata ephemeralPubKey) external payable nonReentrant {
        require(msg.value > 0, "Amount must be greater than 0");
        require(stealthAddress != address(0), "Invalid stealth address");
        
        (bool success, ) = stealthAddress.call{value: msg.value}("");
        require(success, "AVAX transfer failed");
        
        emit StealthPayment(stealthAddress, ephemeralPubKey, address(0), msg.value);
    }

    /**
     * @notice Send ERC20 tokens to a stealth address.
     * @param token The address of the ERC20 token contract.
     * @param stealthAddress The stealth address generated off-chain.
     * @param amount The amount of tokens to send.
     * @param ephemeralPubKey The ephemeral public key used to generate the stealth address.
     */
    function sendERC20(address token, address stealthAddress, uint256 amount, bytes calldata ephemeralPubKey) external nonReentrant {
        require(amount > 0, "Amount must be greater than 0");
        require(stealthAddress != address(0), "Invalid stealth address");
        require(token != address(0), "Invalid token address");
        
        IERC20(token).safeTransferFrom(msg.sender, stealthAddress, amount);
        
        emit StealthPayment(stealthAddress, ephemeralPubKey, token, amount);
    }
}
