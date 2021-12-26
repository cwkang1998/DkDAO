import sdk from "./1-initialize-sdk.js";

const appModule = sdk.getAppModule(
  "0x11F3279EeDc5796747B17eA74F02c708cCA24e1C"
);

(async () => {
  try {
    const voteModule = await appModule.deployVoteModule({
      name: "DkDAO Proposals",
      votingTokenAddress: "0x41936aa4d32A7CB18739515BD1018c8C4d46dd11",
      proposalStartWaitTimeInSeconds: 0,
      proposalVotingTimeInSeconds: 24 * 60 * 60,
      votingQuorumFraction: 0,
      minimumNumberOfTokensNeededToPropose: "0",
    });
    console.log(
      "Successfully deployed vote module, address:",
      voteModule.address
    );
  } catch (err) {
    console.log("Failed to deploy vote module", err);
  }
})();
