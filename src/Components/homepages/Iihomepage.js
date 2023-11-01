import React from "react";
import "../../Styles/iihomepage.css";
import gif from "../../Assets/output-onlinegiftools.gif";
import historyview from "../../Assets/view.gif";
import send from "../../Assets/sendgif.gif";
import list from "../../Assets/listgii.gif";

function Iihomepage() {
  return (
    <div>
      <div className="main-div-for-user-guide">
        <div className="rectangle-box-for-4-cards">
          <div id="a" className="card">
            <img className="iconnn" src={gif} alt="non" />
            <h3 className="iconn">Connect Your Wallet</h3>
            <p>Link your Wallet</p>
          </div>
          <div id="b" className="card">
            <img className="iconnn" src={list} alt="non" />
            <h3 className="iconn">List Transactions</h3>
            <p>Enter Recipient Details</p>
          </div>
          <div id="c" className="card">
            <img className="iconnn" src={send} alt="non" />
            <h3 className="iconn">Send Transaction</h3>
            <p>Initiate the transaction</p>
          </div>
          <div id="d" className="card">
            <img className="iconnn" src={historyview} alt="non" />
            <h3 className="iconn">View History</h3>
            <p>Monitor your Transactions</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Iihomepage;
