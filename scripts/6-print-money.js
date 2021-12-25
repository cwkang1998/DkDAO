import { ethers } from "ethers";
import sdk from "./1-initialize-sdk.js";

const tokenModule = sdk.getTokenModule(
  "0x41936aa4d32A7CB18739515BD1018c8C4d46dd11"
);

(async () => {
  try {
    const amount = 1_000_000;
    const amountWith18Decimals = ethers.utils.parseUnits(amount.toString(), 18);

    await tokenModule.mint(amountWith18Decimals);

    const totalSupply = await tokenModule.totalSupply();

    console.log(
      "There now is",
      ethers.utils.formatUnits(totalSupply, 18),
      "$DKT in curculation"
    );
  } catch (err) {
    console.error("Failed to print money", err);
  }
})();
