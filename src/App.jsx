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

const voteModule = sdk.getVoteModule(
  "0xbA92910162443fA684E0AF6017b54981f687d1c6"
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

  // Voting
  const [proposals, setProposals] = useState([]);
  const [isVoting, setIsVoting] = useState(false);
  const [hasVoted, setHasVoted] = useState(false);

  const shortenAddress = (str) => {
    return `${str.substring(0, 6)}...${str.substring(str.length - 4)}`;
  };

  // Setup SDK
  useEffect(() => {
    sdk.setProviderOrSigner(signer);
  }, [signer]);

  // Get NFT
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

  // Get Tokens
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

  // Get proposals
  useEffect(() => {
    if (!hasClaimedNFT) {
      return;
    }

    voteModule
      .getAll()
      .then((proposals) => {
        setProposals(proposals);
        console.log("Proposals:", proposals);
      })
      .catch((err) => {
        console.error("Failed to get proposals", err);
      });
  }, [hasClaimedNFT]);

  useEffect(() => {
    if (!hasClaimedNFT) {
      return;
    }

    if (!proposals.length) {
      return;
    }

    voteModule
      .hasVoted(proposals[0].proposalId, address)
      .then((hasVoted) => {
        setHasVoted(hasVoted);
        console.log("User has already voted.");
      })
      .catch(
        (err) => {
          console.error("Failed to check if wallet has voted", err);
        },
        [hasClaimedNFT, proposals, address]
      );
  });

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

  const onProposalSubmit = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    setIsVoting(true);

    const votes = proposals.map((proposal) => {
      let voteResult = {
        proposalId: proposal.proposalId,
        vote: 2, //abstain by default
      };
      proposal.votes.forEach((vote) => {
        const elem = document.getElementById(
          proposal.proposalId + "-" + vote.type
        );
        if (elem.checked) {
          voteResult.vote = vote.type;
          return;
        }
      });
      return voteResult;
    });

    try {
      const delegation = await tokenModule.getDelegationOf(address);
      if (delegation === ethers.constants.AddressZero) {
        await tokenModule.delegateTo(address);
      }

      try {
        await Promise.all(
          votes.map(async (vote) => {
            const proposal = await voteModule.get(vote.proposalId);
            // If open for voting, vote.
            if (proposal.state === 1) {
              return voteModule.vote(vote.proposalId, vote.vote);
            }
            // else return nothing
            return;
          })
        );
        try {
          // If proposal is ready to be executed
          await Promise.all(
            votes.map(async (vote) => {
              const proposal = await voteModule.get(vote.proposalId);

              if (proposal.state === 4) {
                return voteModule.execute(vote.proposalId);
              }
            })
          );
          setHasVoted(true);
          console.log("Successfully voted");
        } catch (err) {
          console.error("Failed to execute vote", err);
        }
      } catch (err) {
        console.error("Failed to vote", err);
      }
    } catch (err) {
      console.error("Failed to delegate tokens", err);
    } finally {
      setIsVoting(false);
    }
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
          <div>
            <h2>Active Proposals</h2>
            <form onSubmit={onProposalSubmit}>
              {proposals.map((proposal, index) => (
                <div key={proposal.proposalId} className="card">
                  <h5>{proposal.description}</h5>
                  <div>
                    {proposal.votes.map((vote) => (
                      <div key={vote.type}>
                        <input
                          type="radio"
                          id={proposal.proposalId + "-" + vote.type}
                          name={proposal.proposalId}
                          value={vote.type}
                          defaultChecked={vote.type === 2}
                        />
                        <label htmlFor={proposal.proposalId + "-" + vote.type}>
                          {vote.label}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
              <button disabled={isVoting || hasVoted} type="submit">
                {isVoting
                  ? "Voting..."
                  : hasVoted
                  ? "You Already Voted"
                  : "Submit Votes"}
              </button>
              <small>
                This will trigger multiple transactions that you will need to
                sign.
              </small>
            </form>
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
