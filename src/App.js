import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Navbar from "./Components/Navbar";
import Landingpage from "./Components/pages/Landingpage";
import Maindashboard from "./Components/Dashboardpages/Maindashboard";
import Footer from "./Components/homepages/Footer";

import "./App.css";
import Samemaindashboard from "./Components/Dashboardpages/Samechainpages/Samemaindashboard";

function App() {
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    setTimeout(() => {
      setLoading(false);
    }, 2000);
  }, []);
  return (
    <div>
      {loading ? (
        <div>
          <div class="container">
            <div class="loading">
              <div class="loading__letter">L</div>
              <div class="loading__letter">o</div>
              <div class="loading__letter">a</div>
              <div class="loading__letter">d</div>
              <div class="loading__letter">i</div>
              <div class="loading__letter">n</div>
              <div class="loading__letter">g</div>
              <div class="loading__letter">.</div>
              <div class="loading__letter">.</div>
              <div class="loading__letter">.</div>
            </div>
          </div>
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
