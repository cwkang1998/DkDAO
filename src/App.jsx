import { useWeb3 } from "@3rdweb/hooks";
import { ThirdwebSDK } from "@3rdweb/sdk";
import { useEffect, useState } from "react";

const sdk = new ThirdwebSDK("rinkeby");
const bundleDropModule = sdk.getBundleDropModule(
  "0x52051d3446Ee5Bbae6F0AE2225Dc0Ef7bF70647D"
);

const App = () => {
  const { connectWallet, address, error, provider } = useWeb3();
  console.log("Address:", address);

  // Get signer
  const signer = provider ? provider.getSigner() : undefined;

  const [hasClaimedNFT, setHasClaimedNFT] = useState(false);
  const [isClaiming, setIsClaiming] = useState(false);

  useEffect(() => {
    sdk.setProviderOrSigner(signer);
  }, [signer])

  useEffect(() => {
    if (!address) {
      return;
    }

    return bundleDropModule
      .balanceOf(address, "0")
      .then((balance) => {
        if (balance.gt(0)) {
          setHasClaimedNFT(true);
          console.log("This use has a membership NFT.");
        } else {
          setHasClaimedNFT(false);
          console.log("This user doesn't have a membership NFT.");
        }
      })
      .catch((err) => {
        setHasClaimedNFT(false);
        console.error("Failed to NFT balance", err);
      });
  }, [address]);

  const mintNft = () => {
    setIsClaiming(true);
    bundleDropModule.claim("0", 1).catch(err => {
      console.error("Failed to claim", err);
      setIsClaiming(false)
    }).finally(() => {
      setIsClaiming(false);
      setHasClaimedNFT(true);
      console.log(`Successfully Minted! Check it out on OpenSea: https://testnets.opensea.io/assets/${bundleDropModule.address}/0`)
    })
  }

  if (!address) {
    return (
      <div className="landing">
        <h1>Welcome to DkDAO</h1>
        <button
          onClick={() => {
            connectWallet("injected");
          }}
        >
          Connect your wallet
        </button>
      </div>
    );
  }

  if(hasClaimedNFT){
    return (
      <div className="member-page">
        <h1>DAO Member Page</h1>
        <p>Congratulations on being a member</p>
      </div>
    )
  }

  return (
    <div className="landing">
      <h1>Mint your free DAO Membership NFT</h1>
      <button disabled={isClaiming} onClick={() => mintNft()}>
        {isClaiming ? "Minting..." : "Mint your nft (FREE)"}
      </button>
    </div>
  );
};

export default App;
