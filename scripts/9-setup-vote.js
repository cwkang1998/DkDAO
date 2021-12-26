import { ethers } from "ethers";
import sdk from "./1-initialize-sdk.js";

const voteModule = sdk.getVoteModule(
  "0xbA92910162443fA684E0AF6017b54981f687d1c6"
);
const tokenModule = sdk.getTokenModule(
  "0x41936aa4d32A7CB18739515BD1018c8C4d46dd11"
);

(async () => {
  try {
    await tokenModule.grantRole("minter", voteModule.address);
    console.log(
      "successfully gave vote module permissions to act on token module"
    );
  } catch (err) {
    console.error(
      "Failed to grant vote module permissions on token module",
      err
    );
    process.exit(1);
  }

  try {
    const ownedTokenBalance = await tokenModule.balanceOf(
      process.env.WALLET_ADDRESS
    );
    const ownedAmount = ethers.BigNumber.from(ownedTokenBalance.value);
    const percent90 = ownedAmount.div(100).mul(90);

    await tokenModule.transfer(voteModule.address, percent90);
    console.log("Successfully transferred tokens to vote module.");
  } catch (err) {
    console.error("Failed to transfer tokens to vote module", err);
  }
})();
