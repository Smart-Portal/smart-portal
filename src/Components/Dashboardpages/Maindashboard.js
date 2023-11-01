import React, { useState } from "react";
import "../../Styles/dashboard/maindashboard.css";
import Createlist from "./Createlist";
import Csvlist from "./Csvlist";
import Viewlist from "./Viewlist";

function Maindashboard() {
  const [activeTab, setActiveTab] = useState("create");

  const renderComponent = (tab) => {
    switch (tab) {
      case "create":
        return <Createlist />;
      case "list":
        return <Csvlist />;
      case "view":
        return <Viewlist />;
      default:
        return <Createlist />;
    }
  };

  return (
    <div>
      <div className="main-div-of-dashboard">
        <div className="title-div-dashboard">
          <h1>One Click, All Chains</h1>
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
            <button
              id="view"
              className={activeTab === "view" ? "active" : ""}
              onClick={() => setActiveTab("view")}
            >
              View Transaction History
            </button>
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

export default Maindashboard;
