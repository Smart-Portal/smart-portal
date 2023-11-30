import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAccount, useSigner } from "wagmi";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import SameCreateList from "./SameCreateList";
import SameCsvList from "./SameCsvList";
import SameTextlist from "./SameTextlist";
import sameimg from "../../../Assets/crypto11.jpeg";

function Samemaindashboard() {
  const [activeTab, setActiveTab] = useState("text");
  const navigate = useNavigate();
  const { openConnectModal } = useConnectModal();
  const { address, isConnected } = useAccount();
  if (!isConnected) {
    openConnectModal();
  } else {
  }

  const renderComponent = (tab) => {
    switch (tab) {
      case "text":
        return <SameTextlist />;
      case "create":
        return <SameCreateList />;
      case "list":
        return <SameCsvList />;
      default:
        return <SameTextlist />;
    }
  };

  return (
    <div>
      <div className="main-div-of-dashboard">
        <div className="title-div-dashboard">
          <div className="images-in-this">
            <img src={sameimg} alt="nonnn" />
          </div>
          <h1>Effortless Token Distribution</h1>
          <h3>
            {" "}
            Instant Multi-Account Dispersement – Seamlessly Send Tokens to
            Multiple Accounts in One Click
          </h3>
        </div>
        <div className="main-div-for-all-option-dashboard">
          <div className="menu-bar-dashboard">
            <button
              id="view"
              className={activeTab === "text" ? "active" : ""}
              onClick={() => setActiveTab("text")}
              data-tip="Create Transaction Text"
            >
              Create Transaction Text
            </button>
            <button
              id="create"
              className={activeTab === "create" ? "active" : ""}
              onClick={() => setActiveTab("create")}
              data-tip="Create Transaction List"
            >
              Create Transaction List
            </button>
            <button
              id="csv"
              className={activeTab === "list" ? "active" : ""}
              onClick={() => setActiveTab("list")}
              data-tip="Upload Transaction List"
            >
              Upload Transaction List
            </button>
            {/* <button
              id="view"
              className={activeTab === "view" ? "active" : ""}
              onClick={() => setActiveTab("view")}
              data-tip="View Transaction History"
            >
              View Transaction History
            </button>
            <ReactTooltip place="bottom" type="dark" effect="solid" /> */}
          </div>
        </div>
        <div className="div-to-center-the-component-render">
          <div className="component-container-dashboard">
            {renderComponent(activeTab)}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Samemaindashboard;
