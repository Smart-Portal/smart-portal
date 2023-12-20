import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Navbar from "./Components/Navbar";
import Landingpage from "./Components/pages/Landingpage";
import Maindashboard from "./Components/Dashboardpages/Maindashboard";
import Footer from "./Components/homepages/Footer";

import "./App.css";
import Samemaindashboard from "./Components/Dashboardpages/Samechainpages/Samemaindashboard";

function App() {
  return (
    <div className="App">
      <div className="landingpff">
        <Router>
          <Navbar />
          <Routes>
            {/* -------------------Cross chain Pages------------------ */}
            <Route path="/" element={<Landingpage />} />
            <Route path="/cross-transfers" element={<Maindashboard />} />
            {/* -------------------------Same chain pages---------------------------- */}
            <Route path="/same-transfers" element={<Samemaindashboard />} />
          </Routes>
          <Footer />
        </Router>
      </div>
    </div>
  );
}

export default App;
