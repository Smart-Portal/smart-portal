import React, { useState } from "react";
import "../../../Styles/dashboard/textlist.css";

function SameTextlist() {
  const [inputText, setInputText] = useState("");
  const [walletList, setWalletList] = useState([]);
  const defaultTokenDetails = {
    name: null,
    symbol: null,
    balance: null,
    decimal: null,
  };
  const [tokenDetails, setTokenDetails] = useState(defaultTokenDetails);
  const [isTokenLoaded, setTokenLoaded] = useState(false);
  const [customTokenAddress, setCustomTokenAddress] = useState("");
  const [tokenSymbolFinal, setTokenSymbol] = useState("ETH");

  const handleInputChange = (e) => {
    setInputText(e.target.value);
    processInput(e.target.value);
  };

  const processInput = (text) => {
    const lines = text.split("\n");

    const newWalletList = lines.map((line) => {
      let walletAddress = "";
      let amount = "";

      if (line.includes(" ")) {
        [walletAddress, amount] = line.split(" ");
      } else if (line.includes(",")) {
        [walletAddress, amount] = line.split(",");
      } else if (line.includes("=")) {
        [walletAddress, amount] = line.split("=");
      } else if (line.includes("-")) {
        [walletAddress, amount] = line.split("-");
      }

      return { walletAddress, amount };
    });

    setWalletList(
      newWalletList.filter((entry) => entry.walletAddress && entry.amount)
    );
  };

  return (
    <div>
      <div className="load-tokens">
        {!isTokenLoaded ? (
          <select
            className="custom-select"
            name="tokenSymbol"
            value={tokenSymbolFinal}
            onChange={(e) => {
              setTokenSymbol(e.target.value);
            }}
          >
            <option value="" disabled selected>
              Select Token
            </option>
            <option value="ETH">ETH</option>
            <option value="USDC">USDC</option>
            <option value="aUSDC">aUSDC</option>
            <option value="axlWETH">axlWETH</option>
            <option value="wAXL">wAXL</option>
            <option value="WMATIC">WMATIC</option>
            <option value="WDEV">WDEV</option>
          </select>
        ) : null}
        {isTokenLoaded ? null : " OR "}
        <input
          type="text"
          className="each-input-of-create-list"
          placeholder="Enter token Address"
          value={customTokenAddress}
          onChange={(e) => setCustomTokenAddress(e.target.value)}
        />
        {isTokenLoaded ? (
          <button className="button-to-add-form-data-unload" onClick={() => {}}>
            Unload Token
          </button>
        ) : (
          <button className="button-to-add-form-data" onClick={() => {}}>
            Load Token
          </button>
        )}
        {isTokenLoaded ? (
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "10px",
              border: "1px solid #ddd",
              borderRadius: "5px",
            }}
          >
            <div>
              <strong>Name:</strong> {tokenDetails.name}
            </div>
            <div>
              <strong>Symbol:</strong> {tokenDetails.symbol}
            </div>
            <div>
              <strong>Balance:</strong> {tokenDetails.balance}
            </div>
          </div>
        ) : null}
      </div>

      <div className="text-list-div">
        {/* <h1>Transaction here</h1> */}
        <div>
          <label htmlFor="walletInput">Enter Recepients and Amount:</label>
          <br />
          enter one address and amount in ETH on each line. supports any format.
          <br></br>
          <textarea
            className="textarea-text-list"
            id="walletInput"
            value={inputText}
            rows="4"
            cols="80"
            onChange={handleInputChange}
            placeholder="0xEd154b193FabDb2ef502Edb98284005CcF1485 3 0xEd154b193FabDb2ef502Edb98284005CcF148516,3   0xEd154b193FabDb2ef502Edb98284005CcF148516=3   0xEd154b193FabDb2ef502Edb98284005CcF148516-3"
          />
        </div>
        {/* <h2>Confirm Transaction</h2> */}
        <div className="table-container">
          <table className="table-text-list">
            <thead className="table-header-text-list">
              <tr>
                <th>Wallet Address</th>
                <th>Amount</th>
              </tr>
            </thead>
            <tbody className="scrollable-body">
              {walletList.map((entry, index) => (
                <tr key={index}>
                  <td>{entry.walletAddress}</td>
                  <td>{entry.amount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div>
          <button id="same-text-btn-pay" className="send-button">
            Begin Payment
          </button>
        </div>
      </div>
    </div>
  );
}

export default SameTextlist;
