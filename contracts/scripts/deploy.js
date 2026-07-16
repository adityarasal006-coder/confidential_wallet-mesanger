import hre from "hardhat";

async function main() {
  console.log("Deploying contracts to Avalanche Fuji...");

  const StealthRelayer = await hre.ethers.getContractFactory("StealthRelayer");
  const stealthRelayer = await StealthRelayer.deploy();
  await stealthRelayer.waitForDeployment();
  const relayerAddress = await stealthRelayer.getAddress();
  console.log(`StealthRelayer deployed to: ${relayerAddress}`);

  const MockERC20 = await hre.ethers.getContractFactory("MockERC20");
  const mockERC20 = await MockERC20.deploy();
  await mockERC20.waitForDeployment();
  const mockAddress = await mockERC20.getAddress();
  console.log(`MockERC20 deployed to: ${mockAddress}`);

  console.log("Deployment complete.");
  console.log("Save these addresses for the frontend/backend `.env` files.");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
