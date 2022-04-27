import React, { useContext, useState } from "react";
import UbiContext from "../contexts/UbiContext";
import UseToastContext from "../hooks/UseToastContext";
import ReacLoading from "react-loading";
import "./UserUbiControls.css";

const UserUbiControls = () => {
  const ubiContext = useContext(UbiContext);
  const [loading, setLoading] = useState(false);
  const addToast = UseToastContext();

  const onBuySubscription = async () => {
    try {
      setLoading(true);
      const amount = ubiContext.getSubscriptionPrice();
      const buySubscriptionResponse = await ubiContext.buySubscription(amount);
      addToast({
        title: "Processing",
        message: "Your request is being processed",
      });

      await buySubscriptionResponse.wait();
      addToast({
        title: "Subscription bought",
        message: "Your subscription has been bought",
      });
      setLoading(false);
    } catch (err) {
      setLoading(false);
      addToast({
        title: "Buy subscription failed",
        message: err.message,
        isError: true,
      });
    }
  };

  const onWithdrawReward = async () => {
    try {
      setLoading(true);
      const withdrawRewardResponse = await ubiContext.withdrawReward();
      addToast({
        title: "Processing",
        message: "Your request is being processed",
      });

      await withdrawRewardResponse.wait();
      addToast({
        title: "Reward withdrawn",
        message: "Your reward has been withdrawn",
      });
      setLoading(false);
    } catch (err) {
      setLoading(false);
      const errorMessage = err.data && err.data.message ? err.message + " " + err.data.message : err.message;
      addToast({
        title: "Withdraw reward failed",
        message: errorMessage,
        isError: true,
      });
    }
  };

  return (
    <div className="user-controls-container">
      {loading ? (
        <ReacLoading type={"spinningBubbles"} color={"#778899"} />
      ) : null}
      <button onClick={onBuySubscription} disabled={loading} className="btn">
        Buy subscription
      </button>
      <button onClick={onWithdrawReward} disabled={loading} className="btn">
        Withdraw reward
      </button>
    </div>
  );
};

export default UserUbiControls;
