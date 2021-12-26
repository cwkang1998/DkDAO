import { useEffect, useState, useMemo } from "react";
import { useWeb3 } from "@3rdweb/hooks";
import { ThirdwebSDK } from "@3rdweb/sdk";
import { ethers } from "ethers";

const sdk = new ThirdwebSDK("rinkeby");
const bundleDropModule = sdk.getBundleDropModule(
  "0x52051d3446Ee5Bbae6F0AE2225Dc0Ef7bF70647D"
);

const tokenModule = sdk.getTokenModule(
  "0x41936aa4d32A7CB18739515BD1018c8C4d46dd11"
);

const App = () => {
  const { connectWallet, address, error, provider } = useWeb3();
  console.log("Address:", address);

  // Get signer
  const signer = provider ? provider.getSigner() : undefined;

  // NFT keycard
  const [hasClaimedNFT, setHasClaimedNFT] = useState(false);
  const [isClaiming, setIsClaiming] = useState(false);

  // Governance token
  const [memberTokenAmounts, setMemberTokenAmounts] = useState({});
  const [memberAddresses, setMemberAddresses] = useState([]);

  const shortenAddress = (str) => {
    return `${str.substring(0, 6)}...${str.substring(str.length - 4)}`;
  };

  useEffect(() => {
    sdk.setProviderOrSigner(signer);
  }, [signer]);

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

  useEffect(() => {
    if (!hasClaimedNFT) {
      return;
    }

    bundleDropModule
      .getAllClaimerAddresses("0")
      .then((addresses) => {
        console.log("Members addresses", addresses);
        setMemberAddresses(addresses);
      })
      .catch((err) => {
        console.error("Failed to get member list", err);
      });
  }, [hasClaimedNFT]);

  useEffect(() => {
    if (!hasClaimedNFT) {
      return;
    }

    tokenModule
      .getAllHolderBalances()
      .then((amounts) => {
        console.log("Amounts", amounts);
        setMemberTokenAmounts(amounts);
      })
      .catch((err) => {
        console.error("Failed to get token amounts", err);
      });
  }, [hasClaimedNFT]);

  const mintNft = () => {
    setIsClaiming(true);
    bundleDropModule
      .claim("0", 1)
      .catch((err) => {
        console.error("Failed to claim", err);
        setIsClaiming(false);
      })
      .finally(() => {
        setIsClaiming(false);
        setHasClaimedNFT(true);
        console.log(
          `Successfully Minted! Check it out on OpenSea: https://testnets.opensea.io/assets/${bundleDropModule.address}/0`
        );
      });
  };

  const memberList = useMemo(() => {
    return memberAddresses.map((address) => {
      return {
        address,
        tokenAmount: ethers.utils.formatUnits(
          memberTokenAmounts[address] || 0,
          18
        ),
      };
    });
  }, [memberAddresses, memberTokenAmounts]);

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

  if (hasClaimedNFT) {
    return (
      <div className="member-page">
        <h1>DAO Member Page</h1>
        <p>Congratulations on being a member</p>
        <div>
          <div>
            <h2>Member List</h2>
            <table className="card">
              <thead>
                <tr>
                  <th>Address</th>
                  <th>Token Amount</th>
                </tr>
              </thead>
              <tbody>
                {memberList.map((member) => {
                  return (
                    <tr key={member.address}>
                      <td>{shortenAddress(member.address)}</td>
                      <td>{member.tokenAmount}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
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
