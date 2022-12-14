require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config({ path: ".env" });
require("@nomiclabs/hardhat-etherscan");

module.exports = {
  solidity: {
    version : "0.8.9",
    settings: {
      optimizer: {
        enabled: true,
        runs: 3333,
      },
    },
  },
  networks:{
    mainnet: {
      url: process.env.ALCHEMY_API_KEY_URL,
      accounts: [process.env.PRIVATE_KEY],
    },
    goerli:{
      url: process.env.ALCHEMY_API_KEY_URL,
      accounts: [process.env.PRIVATE_KEY],
    },
    rinkeby:{
      url: process.env.ALCHEMY_API_KEY_URL,
      accounts: [process.env.PRIVATE_KEY],
    },
  },
    etherscan: {
      apiKey:{
        mainnet: process.env.ETHERSCAN_API_KEY,
      } 
    },
};
