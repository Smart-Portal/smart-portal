import React from "react";
import "../../Styles/dashboard.css";
import Maindashboard from "../Dashboardpages/Maindashboard";
import Navbar from "../Navbar";
import Footer from "../homepages/Footer";

function Dashboard() {
  return (
    <div className="dividiv">
      <Maindashboard />
      {/* <Footer /> */}
    </div>
  );
}

export default Dashboard;
