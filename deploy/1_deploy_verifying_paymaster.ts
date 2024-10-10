import { ethers } from "hardhat";
import { DeployFunction } from "hardhat-deploy/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const provider = ethers.provider;
  const from = await provider.getSigner().getAddress();

  const result = await hre.deployments.deploy("VerifyingPaymaster", {
    from,
    args: [process.env.ENTRY_POINT_ADDRESS, from],
    log: true,
    deterministicDeployment: true,
  });

  if (result) {
    if (hre.network.name !== "hardhat" && hre.network.name !== "localhost") {
      try {
        await hre.run("verify:verify", {
          address: result.address,
          constructorArguments: [process.env.ENTRY_POINT_ADDRESS, from],
        });
      } catch (error) {
        console.error("Error verifying contract:", error);
      }
    } else {
      console.log("Skipping verification on local network");
    }
  }
};

func.skip = async (_: HardhatRuntimeEnvironment): Promise<boolean> => {
  const runOnly = process.env.RUN_ONLY?.split(",");
  if (!runOnly || runOnly.length === 0) return false;

  return !runOnly.includes("1");
};

export default func;
