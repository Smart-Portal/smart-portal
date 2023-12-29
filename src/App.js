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
    </div>
  );
}

export default App;
