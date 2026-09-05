import { ethers } from "hardhat";

async function main() {
  console.log("Deploying ProofRegistry contract to Polygon...");
  const ProofRegistry = await ethers.getContractFactory("ProofRegistry");
  const registry = await ProofRegistry.deploy();
  await registry.waitForDeployment();

  const address = await registry.getAddress();
  console.log(`ProofRegistry deployed successfully to: ${address}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
