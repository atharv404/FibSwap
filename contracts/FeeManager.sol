// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";

contract FeeManager is Ownable {
    uint256 public feePercentage = 50; // 0.5% fee
    uint256 public constant FEE_DENOMINATOR = 10000;

    event FeeUpdated(uint256 newFeePercentage);

    function setFeePercentage(uint256 _feePercentage) external onlyOwner {
        require(_feePercentage <= 1000, "Fee percentage too high"); // Max 10%
        feePercentage = _feePercentage;
        emit FeeUpdated(_feePercentage);
    }

    function calculateFee(uint256 amount) public view returns (uint256) {
        return (amount * feePercentage) / FEE_DENOMINATOR;
    }
}

