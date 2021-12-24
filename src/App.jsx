import { useWeb3 } from "@3rdweb/hooks";

const App = () => {
  const {connectWallet, address, error, provider} = useWeb3();
  console.log("Address:", address);

  if(!address){
    return (
      <div className="landing">
        <h1>Welcome to DkDAO</h1>
        <button onClick={() => {connectWallet("injected")}}>Connect your wallet</button>
      </div>
    );
  }
  return (
    <div className="landing">
      <h1>Wallet connected!</h1>
    </div>
  )
};

export default App;
