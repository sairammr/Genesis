require("@nomicfoundation/hardhat-toolbox");

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.28",
  networks: {
    sepolia: {
      url: process.env.SEPOLIA_RPC_URL, // Replace with your Sepolia RPC URL
      accounts: [process.env.DEPLOYER_PRIVATE_KEY], // Replace with your deployer account's private key
    },
  },
};
