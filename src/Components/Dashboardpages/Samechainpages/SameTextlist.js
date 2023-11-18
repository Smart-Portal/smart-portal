import React, { useState } from "react";

function SameTextlist() {
  const [inputText, setInputText] = useState("");
  const [walletList, setWalletList] = useState([]);

  const handleInputChange = (e) => {
    setInputText(e.target.value);
    processInput(e.target.value); // Call processInput to update the list as the user types
  };

  const processInput = (text) => {
    const lines = text.split("\n");

    const newWalletList = lines.map((line) => {
      const [walletAddress, amount] = line.split(" ");
      return { walletAddress, amount };
    });

    setWalletList(
      newWalletList.filter((entry) => entry.walletAddress && entry.amount)
    );
  };

  return (
    <div>
      <h1>Wallet Information</h1>
      <div>
        <label htmlFor="walletInput">Enter Address and Amount:</label>
        <textarea
          id="walletInput"
          value={inputText}
          onChange={handleInputChange}
          placeholder="Enter Address Amount (one per line)"
        />
      </div>

      <h2>Confirm Transaction</h2>
      <table>
        <thead>
          <tr>
            <th>Ethereum Address</th>
            <th> Token Amount</th>
          </tr>
        </thead>
        <tbody>
          {walletList.map((entry, index) => (
            <tr key={index}>
              <td>{entry.walletAddress}</td>
              <td>{entry.amount}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <button className="button-to-add-form-data">Pay Tokens</button>
    </div>
  );
}

export default SameTextlist;
