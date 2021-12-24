import { readFileSync } from "fs";
import { ethers } from "ethers";
import sdk from "./1-initialize-sdk.js";

const app = sdk.getAppModule("0x11F3279EeDc5796747B17eA74F02c708cCA24e1C");

(async () => {
  try {
    const bundleDropModule = await app.deployBundleDropModule({
      name: "DkDAO Membership",
      description: "A DAO for Dk membership",
      image: readFileSync("scripts/assets/dk.svg"),
      primarySaleRecipientAddress: ethers.constants.AddressZero,
    });
    console.log(
      "Succesfully deployed bundleDrop module, address:",
      bundleDropModule.address
    );
    console.log("bundleDrop metadata:", await bundleDropModule.getMetadata());
  } catch (err) {
    console.log("Failed to deploy bundleDrop module", err);
  }
})();
