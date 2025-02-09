const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();

  console.log("Deploying contracts with the account:", deployer.address);

  const GameArtifacts = await hre.ethers.getContractFactory("GameArtifacts");
  const gameArtifacts = await GameArtifacts.deploy(
    "GameArtifacts", // Name of the NFT
    "GART",          // Symbol of the NFT
    "ipfs://bafybei/" // Base URI for metadata
  );

  await gameArtifacts.waitForDeployment();

  console.log("GameArtifacts deployed to:", await gameArtifacts.getAddress());
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });