import { readFileSync } from "fs";
import sdk from "./1-initialize-sdk.js";

const bundleDrop = sdk.getBundleDropModule(
  "0x52051d3446Ee5Bbae6F0AE2225Dc0Ef7bF70647D"
);

(async () => {
  try {
    await bundleDrop.createBatch([
      {
        name: "Access Card",
        description: "This NFT will give you access to DkDAO!",
        image: readFileSync("scripts/assets/card.png"),
      },
    ]);
    console.log("Succesfully created a new NFT in the drop!");
  } catch (err) {
    console.error(err);
  }
})();
