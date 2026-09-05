import hre from "hardhat";
const { ethers } = hre;

async function main() {
  console.log("Deploying ProofCredentialRegistry to Polygon Amoy...");
  const factory = await ethers.getContractFactory("ProofCredentialRegistry");
  const registry = await factory.deploy();
  await registry.waitForDeployment();

  const address = await registry.getAddress();
  console.log(`ProofCredentialRegistry successfully deployed to: ${address}`);
  console.log("Network: Polygon Amoy (Chain ID: 80002)");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
