import React from "react";
import discord from "../../Assets/discord.png";
import telegram from "../../Assets/telegram.png";
import twitter from "../../Assets/twitter.png";
import mirror from "../../Assets/mirror.svg";

function Footer() {
  return (
    <div className="foot-footer">
      <p className="footer-copyright">Copyright Smart-Disperse @2023</p>
      <div className="footer-icon-main">
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
