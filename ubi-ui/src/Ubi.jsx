import { ethers } from "ethers";
import { formatEther, parseEther } from "ethers/lib/utils";
import ubiContract from "./contracts/Ubi.json";

const rinkebyChainId = "0x4";
const mumbaiChainId = "0x13881";
const bscTestnetChainId = "0x61";

class Ubi {
  subscriptionValue = {
    rinkeby: "0.0021",
    mumbai: "0.1",
    bscTestnet: "0.0003",
  };

  constructor() {
    if (window.ethereum) {
      this.contract = null;
      this.wallet = "";
      this.chainId = "";
    }
  }

  onChangeNetwork(chainId) {
    this.chainId = chainId;
    if (window.ethereum) {
      let contractAddress;
      if (chainId === rinkebyChainId) {
        contractAddress = process.env.REACT_APP_CONTRACT_ADDRESS_RINKEBY;
      } else if (chainId === mumbaiChainId) {
        contractAddress = process.env.REACT_APP_CONTRACT_ADDRESS_MUMBAI;
      } else if (chainId === bscTestnetChainId) {
        contractAddress = process.env.REACT_APP_CONTRACT_ADDRESS_BSC_TESTNET;
      } else {
        this.contract = null;
        return;
      }
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      this.contract = new ethers.Contract(
        contractAddress,
        ubiContract.abi,
        signer
      );
    }
  }

  async connectWallet() {
    if (window.ethereum) {
      const chainId = await window.ethereum.request({ method: "eth_chainId" });
      this.chainId = chainId;

      if (
        chainId !== rinkebyChainId &&
        chainId !== mumbaiChainId &&
        chainId !== bscTestnetChainId
      ) {
        this.wallet = "";
        return {
          address: "",
          chainId: chainId,
          err: "Please connect to the Rinkeby test network, Mumbai test network or BSC test network",
        };
      }

      try {
        const accounts = await window.ethereum.request({
          method: "eth_requestAccounts",
        });

        this.wallet = accounts[0];
        this.onChangeNetwork(chainId);

        return {
          address: accounts[0],
          chainId: chainId,
          err: "",
        };
      } catch (err) {
        this.wallet = "";
        return {
          address: "",
          chainId: chainId,
          err: err.message,
        };
      }
    } else {
      this.wallet = "";
      return {
        address: "",
        chainId: "",
        err: "You must install MetaMask, a crypto wallet, in your browser to connect to the web3. Visit https://metamask.io/download/",
        link: "https://metamask.io/download/",
      };
    }
  }

  getSubscriptionPrice() {
    if (this.chainId === rinkebyChainId) {
      return this.subscriptionValue.rinkeby;
    } else if (this.chainId === mumbaiChainId) {
      return this.subscriptionValue.mumbai;
    } else if (this.chainId === bscTestnetChainId) {
      return this.subscriptionValue.bscTestnet;
    }
    return "0";
  }

  async disconnectWallet() {
    this.wallet = "";
    this.chainId = "";
  }

  async isWalletConnected() {
    return !!this.wallet;
  }

  async getUserSubscription(address) {
    const userSubscription = await this.contract.subscriptions(address);
    return {
      daysLeftOfSubscription: userSubscription.daysLeftOfSubscription * 1,
      lastClaimedDate: userSubscription.lastClaimedDate * 1000,
    };
  }

  async buySubscription(amount) {
    return await this.contract.buySubscription({ value: parseEther(amount) });
  }

  async withdrawReward() {
    return await this.contract.withdrawReward();
  }
}

export default Ubi;
