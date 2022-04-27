import React, { useContext, useEffect, useState } from "react";
import UbiContext from "../contexts/UbiContext";
import WalletContext from "../contexts/WalletContext";
import ReactLoading from "react-loading";
import "./UserUbiInfo.css";

const UserUbiInfo = () => {
  const ubiContext = useContext(UbiContext);
  const [walletContext, dispatch] = useContext(WalletContext);
  const [userSubscriptionInfo, setUserSubscriptionInfo] = useState({
    daysLeftOfSubscription: 0,
    lastClaimedDate: 0,
  });
  const [firstFetch, setFirstFetch] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const userSubscriptionResponse = await ubiContext.getUserSubscription(
        walletContext.wallet.address
      );
      setUserSubscriptionInfo(userSubscriptionResponse);
      setFirstFetch(true);
      setLoading(false);
    })();
  }, []);

  useEffect(() => {
    if (firstFetch) {
      ubiContext.contract.on(
        "UserBoughtSubscription",
        (_userAddress, _chainId) => {
          if (_userAddress === walletContext.wallet.address) {
            const newUserSubscriptionInfo = { ...userSubscriptionInfo };
            newUserSubscriptionInfo.daysLeftOfSubscription += 28;
            setUserSubscriptionInfo(newUserSubscriptionInfo);
          }
        }
      );
    }
  }, [firstFetch]);

  if (loading) {
    return <ReactLoading type={"spinningBubbles"} color={"#778899"} />;
  }

  return (
    <div className="user-info-container">
      {userSubscriptionInfo.lastClaimedDate !== 0 ? (
        <div>
          <div>
            Days left of subscription:{" "}
            {userSubscriptionInfo.daysLeftOfSubscription}
          </div>
          <div>
            Last claimed date of reward:{" "}
            {new Date(userSubscriptionInfo.lastClaimedDate).toLocaleString()}
          </div>
        </div>
      ) : (
        <div className="user-info-subcontainer-subtitle">
          You don't have a subscription yet. Buy one.
        </div>
      )}
    </div>
  );
};

export default UserUbiInfo;
