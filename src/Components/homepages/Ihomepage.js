// Ihomepage.js

import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowRight,
  faGlobe,
  faTimes,
  faExchangeAlt,
  faLink,
  faMapMarked,
} from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from "react-router-dom";
import "../../Styles/ihomepage.css";
import { useAccount } from "wagmi";
import { useConnectModal } from "@rainbow-me/rainbowkit";

// Separate Modal component
function Modal({ closeModal, handleContinue, handleSameChain }) {
  return (
    <div className="custom-modal">
      <div className="custom-modal-header">
        <button className="custom-close-button" onClick={closeModal}>
          <FontAwesomeIcon icon={faTimes} />
        </button>
      </div>
      <h5 className="modal-title">
        SELECT TRANSACTION PATH &nbsp;
        <FontAwesomeIcon icon={faGlobe} />
      </h5>

      <button className="continue-button" onClick={handleContinue} disabled>
        Start Cross-Chain Transaction (Coming Soon...)
      </button>
      <button className="same-chain-button" onClick={handleSameChain}>
        Continue on the Same Chain
      </button>
    </div>
  );
}

function Ihomepage() {
  const { openConnectModal } = useConnectModal();
  const navigate = useNavigate();
  const { isConnected } = useAccount();
  const [showModal, setShowModal] = useState(false);

  const handleGetStartedClick = () => {
    if (isConnected) {
      setShowModal(true);
    } else {
      openConnectModal();
    }
  };

  const closeModal = () => {
    setShowModal(false);
  };

  const handleContinue = () => {
    navigate("/cross-transfers");
    closeModal();
  };

  const handleSameChain = () => {
    navigate("/same-transfers");
    closeModal();
  };

  return (
    <div className="main-container">
      <div
        className={`main-div-ihomepage ${showModal ? "blur-background" : ""}`}
      >
        <div className="ihomepage-title-i">
          <h1 className="ihome-title-ii">All Chains, One Solution</h1>
        </div>
        <div className="ihomepage-title-i">
          <h1>Cross-Disperse Your Crypto Transactions!</h1>
        </div>
        <div>
          <button
            className="get-started-button"
            onClick={handleGetStartedClick}
          >
            Get Started <FontAwesomeIcon icon={faArrowRight} />
          </button>
        </div>
      </div>
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-container">
            <Modal
              closeModal={closeModal}
              handleContinue={handleContinue}
              handleSameChain={handleSameChain}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default Ihomepage;
