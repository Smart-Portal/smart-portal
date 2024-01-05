import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAccount, useSigner } from "wagmi";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import SameCreateList from "./SameCreateList";
import SameCsvList from "./SameCsvList";
import SameTextlist from "./SameTextlist";
import "../../../Styles/dashboard/maindashboard.css";
import Footer from "../../homepages/Footer";
import Navbar from "../../Navbar";
import img3 from "../../../Assets/img3-bg.webp";
import img4 from "../../../Assets/img4-bg.webp";
import { useTheme } from "../../../ThemeProvider";

function Samemaindashboard() {
  const { toggleDarkMode, themeClass } = useTheme();
  const [activeTab, setActiveTab] = useState("text");
  const navigate = useNavigate();
  const { openConnectModal } = useConnectModal();
  const { address, isConnected } = useAccount();

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
    <div className={`main-div-of-dashboard ${themeClass}`}>
      <Navbar />
      <div style={{ position: "relative" }}>
        <img className="dash-bgImg1" src={img3} alt="none" />
        <img className="dash-bgImg2" src={img4} alt="none" />
      </div>
      <div className="same-dash-main-m">
        <div className="title-div-dashboard">
          <div className="images-in-this"></div>
          <h1>Effortless Token Distribution</h1>

          <h3>
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
              data-bs-toggle="tooltip"
              data-bs-placement="top"
              data-bs-custom-class="color-tooltip"
              title="Paste or Type recipient addresses and amounts in one line!"
            >
              Textify
            </button>

            <button
              id="create"
              className={activeTab === "create" ? "active" : ""}
              onClick={() => setActiveTab("create")}
              data-bs-toggle="tooltip"
              data-bs-placement="top"
              data-bs-custom-class="color-tooltip"
              title=" Fill recipient addresses and amounts in a simple form."
            >
              Listify
            </button>
            <button
              id="csv"
              className={activeTab === "list" ? "active" : ""}
              onClick={() => setActiveTab("list")}
              data-bs-toggle="tooltip"
              data-bs-placement="top"
              data-bs-custom-class="color-tooltip"
              title=" Upload CSV with recipient info using Uploadify for easy editing."
            >
              Uploadify
            </button>
          </div>
        </div>
        <div className="div-to-center-the-component-render">
          <div className="component-container-dashboard">
            {renderComponent(activeTab)}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}

export default Samemaindashboard;
