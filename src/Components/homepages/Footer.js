import React from "react";
import discord from "../../Assets/discord.png";
import telegram from "../../Assets/telegram.png";
import twitter from "../../Assets/twitter.png";
import mirror from "../../Assets/mirror.svg";
import "../../Styles/navbar.css";

function Footer() {
  return (
    <div
      className="footer-outer-div"
      style={{
        display: "flex",
        justifyContent: " space-between",
        margin: " 0px 50px",
        textAlign: "center",
        color: "white",
        padding: "20px 0px",
        fontSize: " 15px",
        marginTop: "auto",
      }}
    >
      <p className="footer-copyright" style={{ margin: "0px" }}>
        Copyright © 2024 Smart-Disperse | All rights reserved
      </p>
      <div
        className="footer-icon-main"
        style={{
          display: "flex",
          width: "10%",
          margin: "0px 30px",
          justifyContent: "space-evenly",
          alignItems: "center",
        }}
      >
        <img src={discord} className="footer-icon"></img>
        <img src={telegram} className="footer-icon"></img>
        <a
          href="https://x.com/Smart_Disperse?t=XYq363vnWF8BHNMme_vPew&s=31"
          target="blank"
        >
          <img src={twitter} className="footer-icon"></img>
        </a>

        <img src={mirror} className="footer-icon"></img>
      </div>
    </div>
  );
}

export default Footer;
