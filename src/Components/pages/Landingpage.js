import React from "react";
import "../../Styles/landingpage.css";
import Ihomepage from "../homepages/Ihomepage";
// import Iihomepage from "../homepages/Iihomepage";
import Footer from "../homepages/Footer";
import img1 from "../../Assets/homeImg1.webp";
import img2 from "../../Assets/homeImg2.webp";
import Navbar from "../Navbar";

function Landingpage() {
  return (
    <div className="whole-landing-page">
      <Navbar />
      <img className="image-left" src={img2} alt="none" />
      <img className="image-right" src={img1} alt="none" />
      <Ihomepage />
      <Footer />
    </div>
  );
}

export default Landingpage;
