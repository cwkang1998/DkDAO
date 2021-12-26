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
    const amount = 420_000;

    await voteModule.propose(
      "Should the DAO mint an addition " +
        amount +
        " tokens into the treasury?",
      [
        {
          nativeTokenValue: 0,
          transactionData: tokenModule.contract.interface.encodeFunctionData(
            "mint",
            [voteModule.address, ethers.utils.parseUnits(amount.toString(), 18)]
          ),
          toAddress: tokenModule.address,
        },
      ]
    );

    console.log("Successfully created proposal to mint tokens");
  } catch (err) {
    console.error("Failed to create first proposal", err);
    process.exit(1);
  }

  try {
    const amount = 6_900;
    await voteModule.propose(
      "Should the DAO transfer " +
        amount +
        " tokens from the treasury to " +
        process.env.WALLET_ADDRESS +
        "?",
      [
        {
          nativeTokenValue: 0,
          transactionData: tokenModule.contract.interface.encodeFunctionData(
            "transfer",
            [
              process.env.WALLET_ADDRESS,
              ethers.utils.parseUnits(amount.toString(), 18),
            ]
          ),
          toAddress: tokenModule.address,
        },
      ]
    );
    console.log(
      "Succesfully created proposal to reward ourselves from the treasury."
    );
  } catch (err) {
    console.error("Failed to create second proposal", err);
  }
})();
