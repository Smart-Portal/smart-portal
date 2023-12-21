// Ihomepage.js
import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import gif from "../../Assets/output-onlinegiftools.gif";
import historyview from "../../Assets/view.gif";
import send from "../../Assets/sendgif.gif";
import list from "../../Assets/listgii.gif";
import "../../Styles/iihomepage.css";
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
        <div style={{ width: "90%" }}>
          <h6 className="modal-title">
            <FontAwesomeIcon icon={faGlobe} />
            &nbsp; SELECT TRANSACTION PATH
          </h6>
        </div>
        <button
          className="custom-close-button close-btn"
          onClick={closeModal}
          style={{ fontSize: "20px" }}
        >
          <FontAwesomeIcon icon={faTimes} />
        </button>
      </div>
      {/* <h5 className="modal-title">
        SELECT TRANSACTION PATH &nbsp;
        <FontAwesomeIcon icon={faGlobe} />
      </h5> */}
      <div className="popup-button-flex">
        {" "}
        <button
          className="continue-button"
          onClick={handleContinue}
          disabled
          style={{ width: "70%", margin: "10px auto", padding: "10px" }}
        >
          Start Cross-Chain Transaction <br />
          (Coming Soon...)
        </button>
        <button
          className="same-chain-button"
          onClick={handleSameChain}
          style={{ width: "70%", margin: "10px auto" }}
        >
          Continue on the Same Chain
        </button>
      </div>
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

      <div
        className={`main-div-for-user-guide ${
          showModal ? "blur-background" : ""
        }`}
      >
        <div className="rectangle-box-for-4-cards">
          <div id="a" className="card">
            <img className="iconnn" src={gif} alt="non" />
            <h3 className="iconn">Connect Your Wallet</h3>
            <p>Link your Wallet</p>
          </div>
          <div id="b" className="card">
            <img className="iconnn" src={list} alt="non" />
            <h3 className="iconn">List Transactions</h3>
            <p>Enter Recipient Details</p>
          </div>
          <div id="c" className="card">
            <img className="iconnn" src={send} alt="non" />
            <h3 className="iconn">Send Transaction</h3>
            <p>Initiate the transaction</p>
          </div>
          <div id="d" className="card">
            <img className="iconnn" src={historyview} alt="non" />
            <h3 className="iconn">View History</h3>
            <p>Monitor your Transactions</p>
          </div>
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
