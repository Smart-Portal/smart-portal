import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAccount, useSigner } from "wagmi";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import SameCreateList from "./SameCreateList";
import SameCsvList from "./SameCsvList";
import SameTextlist from "./SameTextlist";
import "../../../Styles/dashboard/maindashboard.css";
import sameimg from "../../../Assets/crypto11.jpeg";
import Footer from "../../homepages/Footer";
import list from "../../../Assets/task.png";
import text from "../../../Assets/text-editor.png";
import Navbar from "../../Navbar";
import img3 from "../../../Assets/img3-bg.png";
import img4 from "../../../Assets/img4-bg.png";

function Samemaindashboard() {
  const [activeTab, setActiveTab] = useState("text");
  const navigate = useNavigate();
  const { openConnectModal } = useConnectModal();
  const { address, isConnected } = useAccount();
  // if (!isConnected) {
  //   openConnectModal();
  // } else {
  // }

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
        <Navbar/>
        <div style={{position:"relative"}}>  
        
     <img className="dash-bgImg1" src={img3} alt="none" />
      <img className="dash-bgImg2" src={img4} alt="none" /></div>
      <div style={{marginTop:"50px"}}>
      <div className="title-div-dashboard">
          <div className="images-in-this">
            {/* <img src={sameimg} alt="nonnn" /> */}
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
              {/* <img className="image-option" src={text} alt="none" /> */}
              {/* Create Transaction Text */}
              Textify
            </button>
            <button
              id="create"
              className={activeTab === "create" ? "active" : ""}
              onClick={() => setActiveTab("create")}
              data-tip="Create Transaction List"
            >
              Listify
              {/* <img className="image-option" src={list} alt="none" /> */}
              {/* Create Transaction List */}
            </button>
            <button
              id="csv"
              className={activeTab === "list" ? "active" : ""}
              onClick={() => setActiveTab("list")}
              data-tip="Upload Transaction List"
            >
              Uploadify
              {/* Upload Transaction List */}
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
     
      
        <Footer />
      </div>
    </div>
  );
}

export default Samemaindashboard;
