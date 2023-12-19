require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config({ path: __dirname + "/.env" });

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.20",
  paths: {
    artifacts: "./src/artifacts",
  },
  networks: {
    goerli: {
      url: "https://goerli.infura.io/v3/c8a5701fa71a44598cb6fd3a622489b1",
      accounts: [process.env.PRIVATE_KEY],
    },
    scroll: {
      url: "https://scroll-sepolia.public.blastapi.io",
      accounts: [process.env.PRIVATE_KEY],
    },
    mode_sepolia: {
      url: "https://sepolia.mode.network",
      accounts: [process.env.PRIVATE_KEY],
    },
  },
};
