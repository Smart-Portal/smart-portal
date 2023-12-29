import React from "react";
import { Link } from "react-router-dom";
import "../Styles/navbar.css";
import smartlogo from "../../src/Assets/smart disperse (1).webp";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import ConnectButtonCustom from "./ConnectButton/ConnectButtonCustom";

function Navbar() {
  return (
    <div>
      <div className="div-to-flex-logo-connect-wallet">
        <div>
          <Link to="/">
            <img
              className="smart-logo-portal"
              src={smartlogo}
              alt="not foundd"
            />
          </Link>
        </div>
        <div className="connect-wallet-button-div">
          <ConnectButtonCustom />
        </div>
      </div>
    </div>
  );
}

export default Navbar;
