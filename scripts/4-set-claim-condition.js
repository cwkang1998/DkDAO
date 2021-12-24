import sdk from "./1-initialize-sdk.js";

const bundleDrop = sdk.getBundleDropModule(
  "0x52051d3446Ee5Bbae6F0AE2225Dc0Ef7bF70647D"
);

(async () => {
  try {
    const claimConditionFactory = bundleDrop.getClaimConditionsFactory();
    claimConditionFactory.newClaimPhase({
      startTime: new Date(),
      maxQuantity: 50_000,
      maxQuantityPerTransaction: 1,
    });

    await bundleDrop.setClaimCondition(0, claimConditionFactory);
    console.log(
      "✅ Succesfully set claim condition on bundle drop:",
      bundleDrop.address
    );
  } catch (err) {
    console.error("Failed to set claim condition", err);
  }
})();
