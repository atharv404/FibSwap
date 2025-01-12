// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "./FeeManager.sol";
import "./ILayerZeroEndpoint.sol";
import "./ILayerZeroReceiver.sol";

contract TokenPool is ReentrancyGuard, ILayerZeroReceiver {
    using SafeERC20 for IERC20;

    ILayerZeroEndpoint public lzEndpoint;
    FeeManager public feeManager;
    IERC20 public token;

    mapping(uint16 => bytes) public trustedRemoteLookup;

    event Deposited(address indexed user, uint256 amount);
    event SwapInitiated(address indexed user, uint16 dstChainId, address recipient, uint256 amount, uint256 fee);
    event SwapCompleted(uint16 srcChainId, address indexed recipient, uint256 amount);

    constructor(address _token, address _lzEndpoint, address _feeManager) {
        token = IERC20(_token);
        lzEndpoint = ILayerZeroEndpoint(_lzEndpoint);
        feeManager = FeeManager(_feeManager);
    }

    function deposit(uint256 amount) external nonReentrant {
        require(amount > 0, "Amount must be greater than 0");
        token.safeTransferFrom(msg.sender, address(this), amount);
        emit Deposited(msg.sender, amount);
    }

    function initiateSwap(uint16 dstChainId, address recipient, uint256 amount) external nonReentrant {
        require(amount > 0, "Amount must be greater than 0");
        require(trustedRemoteLookup[dstChainId].length > 0, "Destination chain not supported");

        uint256 fee = feeManager.calculateFee(amount);
        uint256 amountAfterFee = amount - fee;

        token.safeTransfer(address(feeManager), fee);
        
        bytes memory payload = abi.encode(recipient, amountAfterFee);

        // Get the fees for sending the message
        (uint256 nativeFee,) = lzEndpoint.estimateFees(dstChainId, address(this), payload, false, bytes(""));
        
        // Send the message to the destination chain
        lzEndpoint.send{value: nativeFee}(
            dstChainId,
            trustedRemoteLookup[dstChainId],
            payload,
            payable(msg.sender),
            address(0x0),
            bytes("")
        );

        emit SwapInitiated(msg.sender, dstChainId, recipient, amount, fee);
    }

    function lzReceive(uint16 _srcChainId, bytes calldata _srcAddress, uint64 _nonce, bytes calldata _payload) external override {
        require(msg.sender == address(lzEndpoint), "Invalid endpoint caller");
        require(_srcAddress.length == trustedRemoteLookup[_srcChainId].length && keccak256(_srcAddress) == keccak256(trustedRemoteLookup[_srcChainId]), "Invalid source sending contract");

        (address recipient, uint256 amount) = abi.decode(_payload, (address, uint256));

        token.safeTransfer(recipient, amount);

        emit SwapCompleted(_srcChainId, recipient, amount);
    }

    function setTrustedRemote(uint16 _remoteChainId, bytes calldata _remoteAddress) external onlyOwner {
        trustedRemoteLookup[_remoteChainId] = _remoteAddress;
    }

    receive() external payable {}
}

