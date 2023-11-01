// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat
// will compile your contracts, add the Hardhat Runtime Environment's members to the
// global scope, and execute the script.
const hre = require("hardhat");

async function main() {
  const crossSend = await hre.ethers.deployContract("CrossSender", [
    "0xe432150cce91c13a887f7D836923d5597adD8E31",
    "0xbE406F0189A0B4cf3A05C286473D23791Dd44Cc6",
  ]);

  await crossSend.waitForDeployment();

  console.log(`deployed to ${crossSend.target}`);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
