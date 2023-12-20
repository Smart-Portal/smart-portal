import React from "react";
import "../../Styles/landingpage.css";
import Ihomepage from "../homepages/Ihomepage";
import Iihomepage from "../homepages/Iihomepage";
import Footer from "../homepages/Footer";
import img1 from "../../Assets/Illustration (30) 1.png";
import img2 from "../../Assets/Illustration (30) 2.png";

function Landingpage() {
  return (
    <div>
      {/* <div className="spaning">
        <span></span>
      </div> */}
      <img className="image-left" src={img2} alt="none" />
      <img className="image-right" src={img1} alt="none" />
      <Ihomepage />
      <Iihomepage />
      {/* <Footer /> */}
    </div>
  );
}

export default Landingpage;
