import React from "react";
import "../../Styles/landingpage.css";
import Ihomepage from "../homepages/Ihomepage";
import Iihomepage from "../homepages/Iihomepage";
import Footer from "../homepages/Footer";

function Landingpage() {
  return (
    <div>
      <Ihomepage />
      <Iihomepage />
      {/* <Footer /> */}
    </div>
  );
}

export default Landingpage;
