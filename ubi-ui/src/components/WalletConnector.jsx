import React, { useContext, useEffect, useState } from "react";
import UbiContext from "../contexts/UbiContext";
import WalletContext from "../contexts/WalletContext";
import UseToastContext from "../hooks/UseToastContext";
import { SET_WALLET_ADDRESS } from "../reducers";
import "./WalletConnector.css";
import * as utils from "../utils";

const WalletConnector = () => {
  const ubiContext = useContext(UbiContext);
  const [walletContext, dispatch] = useContext(WalletContext);
  const addToast = UseToastContext();

  useEffect(() => {
    if (window.ethereum) {
      window.ethereum.on("accountsChanged", accountsChangedFunction);
      window.ethereum.on("chainChanged", chainIdChangedFunction);
    } else {
      updateWalletContext("", "");
      addToast({
        title: "Wallet disconnected",
        message:
          "You must install MetaMask, a crypto wallet, in your browser to connect to the web3. Visit https://metamask.io/download/",
        link: "https://metamask.io/download/",
        isError: true,
      });
    }
    return () => {
      window.ethereum.removeListener("chainChanged", chainIdChangedFunction);
      window.ethereum.removeListener(
        "accountsChanged",
        accountsChangedFunction
      );
    };
  }, []);

  const updateWalletContext = (address, chainId) => {
    dispatch({
      type: SET_WALLET_ADDRESS,
      payload: {
        address: address,
        chainId: chainId,
      },
    });
  };

  const chainIdChangedFunction = async (_chainId) => {
    ubiContext.onChangeNetwork(_chainId);
    if (
      _chainId !== utils.rinkebyChainId &&
      _chainId !== utils.mumbaiChainId &&
      _chainId !== utils.bscTestnetChainId
    ) {
      updateWalletContext("", "");
      addToast({
        title: "Wallet disconnected",
        message:
          "Please connect to the Rinkeby test network, Mumbai test network or BSC test network",
        isError: true,
      });
    } else {
      updateWalletContext(ubiContext.wallet, _chainId);
      addToast({
        title: "Network changed",
        message: `You have switched to the network: ${utils.getNetworkNameFromChainId(
          _chainId
        )}`,
      });
    }
  };

  const accountsChangedFunction = async (accounts) => {
    const chainId = await window.ethereum.request({
      method: "eth_chainId",
    });
    if (
      chainId !== utils.rinkebyChainId &&
      chainId !== utils.mumbaiChainId &&
      chainId !== utils.bscTestnetChainId
    ) {
      updateWalletContext("", "");
      addToast({
        title: "Wallet disconnected",
        message:
          "Please connect to the Rinkeby test network, Mumbai test network or BSC test network",
        isError: true,
      });
    }

    if (accounts.length > 0) {
      updateWalletContext(accounts[0], chainId);
    } else {
      updateWalletContext("", "");
      addToast({
        title: "Wallet disconnected",
        message: "Accounts not found",
        isError: true,
      });
    }
  };

  const connectWallet = async () => {
    const { address, chainId, err, link } = await ubiContext.connectWallet();
    updateWalletContext(address, chainId);
    if (err) {
      addToast({
        title: "Wallet not connected",
        message: err,
        link: link,
        isError: true,
      });
    } else {
      addToast({
        title: "Wallet connected",
        message:
          "You've successfully connected your account with the application",
      });
    }
  };

  const disconnectWallet = async () => {
    await ubiContext.disconnectWallet();
    updateWalletContext("", "");
    addToast({
      title: "Wallet disconnected",
      message: "Wallet was successfully disconeccted",
    });
  };

  return (
    <div className="wallet-connector-container">
      {walletContext.wallet.address === "" ? (
        <button className="btn" onClick={connectWallet}>
          Connect wallet
        </button>
      ) : (
        <div className="wallet-connector-connected-container">
          <div className="wallet-connector-text">
            You are connected with the wallet: {walletContext.wallet.address}
          </div>
          <div className="wallet-connector-text">
            You are connected on the network:{" "}
            {utils.getNetworkNameFromChainId(walletContext.wallet.chainId)}
          </div>
          <button className="btn" onClick={disconnectWallet}>
            Disconnect wallet
          </button>
        </div>
      )}
    </div>
  );
};

export default WalletConnector;
