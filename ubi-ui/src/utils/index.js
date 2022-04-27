export const rinkebyChainId = "0x4";
export const mumbaiChainId = "0x13881";
export const bscTestnetChainId = "0x61";

export const getNetworkNameFromChainId = (chainId) => {
  if (chainId === rinkebyChainId) {
    return "Rinkeby";
  } else if (chainId === mumbaiChainId) {
    return "Mumbai";
  } else if (chainId === bscTestnetChainId) {
    return "BSC Testnet";
  } else {
    return "Unknown network for the application";
  }
};
