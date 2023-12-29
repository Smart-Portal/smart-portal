import React, { useState, useEffect, lazy, Suspense } from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import "./App.css";
const Landingpage = lazy(() => import("./Components/pages/Landingpage"));
const Maindashboard = lazy(() =>
  import("./Components/Dashboardpages/Maindashboard")
);
const Samemaindashboard = lazy(() =>
  import("./Components/Dashboardpages/Samechainpages/Samemaindashboard")
);

function App() {
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    setTimeout(() => {
      setLoading(false);
    }, 3000);
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
            <Suspense fallback={<div>Loading...</div>}>
              <Routes>
                {/* -------------------Cross chain Pages------------------ */}
                <Route path="/" element={<Landingpage />} />
                <Route path="/cross-transfers" element={<Maindashboard />} />
                {/* -------------------------Same chain pages---------------------------- */}
                <Route path="/same-transfers" element={<Samemaindashboard />} />
              </Routes>
            </Suspense>
          </Router>
        </div>
      )}
    </div>
  );
}

export default App;
