import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowRight } from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from "react-router-dom";
import "../../Styles/ihomepage.css";
import { useAccount } from "wagmi";
import { useConnectModal } from "@rainbow-me/rainbowkit";
function Ihomepage() {
  const { openConnectModal } = useConnectModal();
  const navigate = useNavigate();
  const { isConnected } = useAccount();

  const handleGetStartedClick = () => {
    if (isConnected) {
      navigate("/maindashboard");
    } else {
      // alert("connect wallet first");
      openConnectModal();
    }
  };

  return (
    <div className="main-div-ihomepage">
      <div className="ihomepage-title-i">
        <h1 className="ihome-title-ii">All Chains, One Solution</h1>
      </div>
      <div className="ihomepage-title-i">
        <h1>Cross-Disperse Your Crypto Transactions!</h1>
      </div>
      <div>
        <button className="get-started-button" onClick={handleGetStartedClick}>
          Get Started <FontAwesomeIcon icon={faArrowRight} />
        </button>
      </div>
    </div>
  );
}

export default Ihomepage;
