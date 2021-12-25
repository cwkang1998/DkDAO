import { ethers } from "ethers";
import sdk from "./1-initialize-sdk.js";

const bundleDropModule = sdk.getBundleDropModule(
  "0x52051d3446Ee5Bbae6F0AE2225Dc0Ef7bF70647D"
);

const tokenModule = sdk.getTokenModule(
  "0x41936aa4d32A7CB18739515BD1018c8C4d46dd11"
);

(async () => {
  try {
    const walletAddresses = await bundleDropModule.getAllClaimerAddresses("0");

    if (walletAddresses.length === 0) {
      console.log(
        "No NFTs have been claimed yet, maybe get some frieds to claim your NFT!"
      );
      process.exit(0);
    }
    const airdropTargets = walletAddresses.map((address) => {
      const randomAmount = Math.floor(
        Math.random() * (10000 - 1000 + 1) + 1000
      );
      console.log("Airdroppping", randomAmount, "tokens to", address);

      const airdropTarget = {
        address,
        amount: ethers.utils.parseUnits(randomAmount.toString(), 18),
      };

      return airdropTarget;
    });
    console.log("Starting airdrop...");
    await tokenModule.transferBatch(airdropTargets);
    console.log("Successfully airdropped tokens to all the holders of the NFT");
  } catch (err) {
    console.error("Faild to airdrop nft", err);
  }
})();
