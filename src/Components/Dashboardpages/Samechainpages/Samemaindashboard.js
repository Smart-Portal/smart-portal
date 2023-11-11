import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAccount, useSigner } from "wagmi";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import SameCreateList from "./SameCreateList";
import SameCsvList from "./SameCsvList";

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
      default:
        return <SameCreateList />;
    }
  };
  return (
    <div>
      <div className="main-div-of-dashboard">
        <div className="title-div-dashboard">
          <h1>One Click, Same Chains</h1>
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
              CSV Transaction List
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
