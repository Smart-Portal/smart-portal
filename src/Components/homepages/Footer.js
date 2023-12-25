import React from "react";
import discord from "../../Assets/discord.png";
import telegram from "../../Assets/telegram.png";
import twitter from "../../Assets/twitter.png";
import linkln from "../../Assets/linkedin.png";

function Footer() {
  return (
    <div className="foot-footer">
      <p className="footer-copyright">Copyright Smart-Disperse @2023</p>
      <div className="footer-icon-main">
        <img src={discord} className="footer-icon"></img>
        <img src={telegram} className="footer-icon"></img>
        <img src={twitter} className="footer-icon"></img>
        <img src={linkln} className="footer-icon"></img>
      </div>
      
    </div>
  );
}

export default Footer;
