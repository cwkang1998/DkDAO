import sdk from "./1-initialize-sdk.js";

const tokenModule = sdk.getTokenModule(
  "0x41936aa4d32A7CB18739515BD1018c8C4d46dd11"
);

(async () => {
  try {
    console.log(
      "Roles that exist right now:",
      await tokenModule.getAllRoleMembers()
    );

    await tokenModule.revokeAllRolesFromAddress(process.env.WALLET_ADDRESS);
    console.log(
      "Roles after revoking ourselves",
      await tokenModule.getAllRoleMembers()
    );
    console.log(
      "Successfully revoked our superpowers from the ERC-20 contract"
    );
  } catch (err) {
    console.error("Failed to revoke ourselves from the DAO treasury", err);
  }
})();
