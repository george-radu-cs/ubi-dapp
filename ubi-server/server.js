import Web3 from "web3";
import { createRequire } from "module";
const require = createRequire(import.meta.url);
const UbiContract = require("./contracts/UBI.json");
import { CronJob } from "cron";
import dotenv from "dotenv";

dotenv.config();

class ContractConnection {
  constructor(networkName) {
    this.networkName = networkName;
    this.newSubscriptions = [];
  }

  async init(method = "HTTP") {
    this.web3 = new Web3(process.env[`MORALIS_${this.networkName}_${method}`]);
    this.networkId = await this.web3.eth.net.getId();
    this.ubiContract = new this.web3.eth.Contract(
      UbiContract.abi,
      process.env[`${this.networkName}_CONTRACT_ADDRESS`]
    );
  }

  addSubscription(address) {
    this.newSubscriptions.push(address);
  }

  clearSubscription() {
    this.newSubscriptions = [];
  }

  async synchronizeSubscription() {
    const subscriptionsToBeAdded = this.newSubscriptions.slice();
    this.newSubscriptions = [];
    for (let i = 0; i < subscriptionsToBeAdded.length; i += 100) {
      const tx = this.ubiContract.methods.synchronizeSubscriptions(
        subscriptionsToBeAdded.slice(i, i + 100)
      );
      const gas = await tx.estimateGas({ from: process.env.AGENT_ADDRESS });
      const gasPrice = await this.web3.eth.getGasPrice();
      const data = tx.encodeABI();
      const nonce = await this.web3.eth.getTransactionCount(
        process.env.AGENT_ADDRESS
      );

      const signedTx = await this.web3.eth.accounts.signTransaction(
        {
          to: this.ubiContract.options.address,
          data,
          gas,
          gasPrice,
          nonce,
          chainId: this.networkId,
        },
        process.env.AGENT_PRIVATE_KEY
      );
      const receipt = await this.web3.eth.sendSignedTransaction(
        signedTx.rawTransaction
      );
      console.log(
        `Synchronized subscriptions on network ${this.networkName}. See receipt with hash ${receipt.transactionHash}`
      );
    }
  }

  // test transaction
  async test() {
    const tx = this.ubiContract.methods.synchronizeSubscriptions([
      "0x541519cf0943b2efba75841e73aacd3a4a1752ff",
    ]);
    const gas = await tx.estimateGas({ from: process.env.AGENT_ADDRESS });
    const gasPrice = await this.web3.eth.getGasPrice();
    const data = tx.encodeABI();
    const nonce = await this.web3.eth.getTransactionCount(
      process.env.AGENT_ADDRESS
    );

    const signedTx = await this.web3.eth.accounts.signTransaction(
      {
        to: this.ubiContract.options.address,
        data,
        gas,
        gasPrice,
        nonce,
        chainId: this.networkId,
      },
      process.env.AGENT_PRIVATE_KEY
    );
    const receipt = await this.web3.eth.sendSignedTransaction(
      signedTx.rawTransaction
    );
    console.log(receipt.transactionHash);
  }
}

const networkList = ["RINKEBY", "BSC", "MUMBAI"];
const contractsConnectionsWS = [];
const contractsConnectionsHTTP = [];

for (const network of networkList) {
  const contractsConnectionWS = new ContractConnection(network);
  await contractsConnectionWS.init("WS");
  contractsConnectionsWS.push(contractsConnectionWS);

  const contractsConnectionHTTP = new ContractConnection(network);
  await contractsConnectionHTTP.init("HTTP");
  contractsConnectionsHTTP.push(contractsConnectionHTTP);
}

for (const contractConnectionWS of contractsConnectionsWS) {
  const lastBlockMined = await contractConnectionWS.web3.eth.getBlockNumber();
  contractConnectionWS.ubiContract.events.UserBoughtSubscription(
    {
      filter: {},
      fromBlock: lastBlockMined,
    },
    (error, event) => {
      if (error) {
        console.error(error);
      } else {
        const { _userAdress, _chainId } = event.returnValues;
        contractsConnectionsHTTP.forEach((cc) => {
          if (cc.networkId !== Number(_chainId)) {
            cc.addSubscription(_userAdress);
          }
        });
      }
    }
  );
  console.log(
    `Added event listener for network ${contractConnectionWS.networkName}`
  );
}

const job = new CronJob("0 0 0 * * *", async () => {
  console.log("Synchronize Subscriptions");
  let calls = contractsConnectionsHTTP.map((contractConnectionHTTP) => {
    console.log(contractConnectionHTTP.newSubscriptions);
    contractConnectionHTTP.synchronizeSubscription();
  });
  await Promise.all(calls);
});

console.log("Starting job for network synchronisation");
job.start();

// test
// const x = contractsConnectionsHTTP.find((c) => c.networkId === 4);
// await x.test();
