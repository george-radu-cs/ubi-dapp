//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "hardhat/console.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract UBI is Ownable {
    struct UserSubscription {
        uint256 daysLeftOfSubscription;
        uint256 lastClaimedDate;
    }

    event UserBoughtSubscription(address _userAdress, uint256 _chainId);

    mapping(address => UserSubscription) public subscriptions;

    function buySubscription() public payable {
        uint256 chainId = block.chainid;
        if (chainId == 4) {
            // rinkeby network
            require(msg.value == 0.0021 ether, "Incorrect amount sent");
        } else if (chainId == 80001) {
            // mumbai network
            require(msg.value == 0.1 ether, "Incorrect amount sent");
        } else if (chainId == 97) {
            // BSC network
            require(msg.value == 0.0003 ether, "Incorrect amount sent");
        } else {
            require(true == false, "Unknown network!");
        }

        if (subscriptions[msg.sender].daysLeftOfSubscription == 0) {
            subscriptions[msg.sender].lastClaimedDate = block.timestamp;
        }
        subscriptions[msg.sender].daysLeftOfSubscription += 28;
        emit UserBoughtSubscription(msg.sender, chainId);
    }

    function withdrawReward() public {
        require(
            subscriptions[msg.sender].daysLeftOfSubscription > 0,
            "You don't have a subscription"
        );

        require(
            subscriptions[msg.sender].lastClaimedDate + 1 days <=
                block.timestamp,
            "You need to wait at least 1 day to withdraw again!"
        );

        uint256 chainId = block.chainid;
        uint256 rewardDays = (block.timestamp -
            subscriptions[msg.sender].lastClaimedDate) /
            3600 /
            24;
        subscriptions[msg.sender].daysLeftOfSubscription -= rewardDays;
        subscriptions[msg.sender].lastClaimedDate = block.timestamp;
        address payable receiver = payable(msg.sender);
        if (chainId == 4) {
            // rinkeby network
            receiver.transfer(0.000025 ether * rewardDays);
        } else if (chainId == 80001) {
            // mumbai network
            receiver.transfer(0.00119 ether * rewardDays);
        } else if (chainId == 97) {
            // BSC network
            receiver.transfer(0.0000035 ether * rewardDays);
        } else {
            require(true == false, "Unknown network!");
        }
    }

    function synchronizeSubscriptions(address[] memory users) public onlyOwner {
        for (uint256 i = 0; i < users.length; i++) {
            if (subscriptions[users[i]].daysLeftOfSubscription == 0) {
                subscriptions[users[i]].lastClaimedDate = block.timestamp;
            }
            subscriptions[users[i]].daysLeftOfSubscription += 28;
        }
    }
}
