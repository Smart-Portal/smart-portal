import React, { useState } from "react";
import "../../Styles/dashboard/maindashboard.css";
import Createlist from "./Createlist";
import Csvlist from "./Csvlist";
import Navbar from "../Navbar";
import Viewlist from "./Viewlist";
import { useNavigate } from "react-router-dom";
import { useAccount, useSigner } from "wagmi";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import sameimg from "../../Assets/crypto11.jpeg";
import Text from "../Dashboardpages/Text";
import img3 from "../../Assets/img3-bg.png";
import img4 from "../../Assets/img4-bg.png";

function Maindashboard() {
  const [activeTab, setActiveTab] = useState("view");
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
        return <Createlist />;
      case "list":
        return <Csvlist />;
      case "view":
        return <Text />;
      default:
        return <Text />;
    }
  };

  return (
    <div className="main-div-of-dashboard">
      <img className="bg-img" src={img3} alt="none" />
      <img className="bg-img" src={img4} alt="none" />
      <Navbar />
      <div className="title-div-dashboard">
        <div className="images-in-this">
          {/* <img src={sameimg} alt="nonnn" /> */}
        </div>
        <h1>Effortless Cross Chain Token Distribution</h1>
        <h3>
          Instant Multi-Account Dispersement – Seamlessly Send Tokens to
          Multiple Accounts Across Multiple Chains in One Click
        </h3>
      </div>
      <div className="main-div-for-all-option-dashboard">
        <div className="menu-bar-dashboard">
          <button
            id="view"
            className={activeTab === "view" ? "active" : ""}
            onClick={() => setActiveTab("view")}
          >
            Create Transactiom Text
          </button>
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
        </div>
      </div>
      <div className="div-to-center-the-component-render">
        <div className="component-container-dashboard">
          {renderComponent(activeTab)}
        </div>
      </div>
    </div>
  );
}

export default Maindashboard;
