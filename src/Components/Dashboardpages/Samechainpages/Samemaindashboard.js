import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAccount, useSigner } from "wagmi";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import SameCreateList from "./SameCreateList";
import SameCsvList from "./SameCsvList";
import SameTextlist from "./SameTextlist";

function Samemaindashboard() {
  const [activeTab, setActiveTab] = useState("create");
  const navigate = useNavigate();
  const { openConnectModal } = useConnectModal();
  const { address, isConnected } = useAccount();
  if (!isConnected) {
    openConnectModal();
  } else {
  }

  const renderComponent = (tab) => {
    switch (tab) {
      case "create":
        return <SameCreateList />;
      case "list":
        return <SameCsvList />;
      case "text":
        return <SameTextlist />;
      default:
        return <SameCreateList />;
    }
  };
  return (
    <div>
      <div className="main-div-of-dashboard">
        <div className="title-div-dashboard">
          <h1>Instant Multi-Account Disperse</h1>
        </div>
        <div className="main-div-for-all-option-dashboard">
          <div className="menu-bar-dashboard">
            <button
              id="create"
              className={activeTab === "create" ? "active" : ""}
              onClick={() => setActiveTab("create")}
            >
              Create Transaction List
            </button>
            <button
              id="csv"
              className={activeTab === "list" ? "active" : ""}
              onClick={() => setActiveTab("list")}
            >
              Upload Transaction List
            </button>
            <button
              id="view"
              className={activeTab === "text" ? "active" : ""}
              onClick={() => setActiveTab("text")}
            >
              Upload Transaction Text
            </button>
            {/* <button
              id="view"
              className={activeTab === "view" ? "active" : ""}
              onClick={() => setActiveTab("view")}
            >
              View Transaction History
            </button> */}
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
