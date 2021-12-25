import sdk from "./1-initialize-sdk.js";

const app = sdk.getAppModule("0x11F3279EeDc5796747B17eA74F02c708cCA24e1C");

(async () => {
  try {
    const tokenModule = await app.deployTokenModule({
      name: "DkDAO Governance Token",
      symbol: "DKT",
    });
    console.log(
      "Succesfully deployed token module, address:",
      tokenModule.address
    );
  } catch (err) {
    console.error("Failed to deploy token module", err);
  }
})();
