import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Navbar from "./Components/Navbar";
import Landingpage from "./Components/pages/Landingpage";
import Maindashboard from "./Components/Dashboardpages/Maindashboard";
import Footer from "./Components/homepages/Footer";

import "./App.css";
import Samemaindashboard from "./Components/Dashboardpages/Samechainpages/Samemaindashboard";

function App() {
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    setTimeout(() => {
      setLoading(false);
    }, 3000);
  }, []);
  return (
    <div>
      {loading ? (
        <div class="center">
          <div class="wave"></div>
          <div class="wave"></div>
          <div class="wave"></div>
          <div class="wave"></div>
          <div class="wave"></div>
          <div class="wave"></div>
          <div class="wave"></div>
          <div class="wave"></div>
          <div class="wave"></div>
          <div class="wave"></div>
        </div>
      ) : (
        <div className="App">
          <Router>
            <Routes>
              {/* -------------------Cross chain Pages------------------ */}
              <Route path="/" element={<Landingpage />} />
              <Route path="/cross-transfers" element={<Maindashboard />} />
              {/* -------------------------Same chain pages---------------------------- */}
              <Route path="/same-transfers" element={<Samemaindashboard />} />
            </Routes>
          </Router>
        </div>
      )}
    </div>
  );
}

export default App;
