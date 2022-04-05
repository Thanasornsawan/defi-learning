require("@nomiclabs/hardhat-waffle");
require("dotenv").config();
// You need to export an object to set up your config
// Go to https://hardhat.org/config/ to learn more
const MNEMONIC = process.env.MNEMONIC
/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
  solidity: {
    compilers: [
      {
        version: "0.5.17",
      },
      {
        version: "0.8.9",
      },
    ],
  },
  networks: {
    rinkeby: {
      url: process.env.DEVELOP_ALCHEMY_RINKEBY,
      accounts: [process.env.PRIVATE_KEY]
    },
    ganache: {
      url: "http://127.0.0.1:8545",
      accounts: {
        mnemonic: MNEMONIC,
      },
    },
      forking: {
        url: process.env.ALCHEMY_MAINNET,
        accounts: [process.env.PRIVATE_KEY],
      }
  },
};

