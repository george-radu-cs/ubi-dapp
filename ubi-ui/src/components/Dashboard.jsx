import React, {useContext} from "react";
import WalletContext from "../contexts/WalletContext";
import UbiContext from "../contexts/UbiContext";
import WalletConnector from "./WalletConnector";
import UserUbiInfo from "./UserUbiInfo";
import UserUbiControls from "./UserUbiControls";
import "./Dashboard.css"

const Dashboard = () => {
    const [walletContext, dispatch] = useContext(WalletContext);
    const ubiContext = useContext(UbiContext);
   
    return (
        <main className="App">
        <header>
          <h1>Ubi App</h1>
          <WalletConnector />
        </header>
  
        {walletContext.wallet.address && !!ubiContext.contract ? (
          <div className="dashboard-container">
            <div className="dashboard-subcontainer">
              <UserUbiInfo />
            </div>
  
            <div className="dashboard-subcontainer">
              <UserUbiControls />
            </div>
          </div>
        ) : (
          <div className="dashboard-container">
            Please connect your wallet to use the app.
          </div>
        )}
      </main>
    );
};

export default Dashboard;