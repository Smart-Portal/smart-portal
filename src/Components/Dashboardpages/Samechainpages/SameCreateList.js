import React, { useState } from "react";
import "../../../Styles/dashboard/createlist.css";
import { crossSendInstance } from "../../../Helpers/ContractInstance";
import { getTokenBalance } from "../../../Helpers/TokenBalance";
import { approveToken } from "../../../Helpers/ApproveToken";
import tokensContractAddress from "../../../Helpers/GetTokenContractAddress.json";
import DecimalValue from "../../../Helpers/DecimalValue.json";

import Modal from "react-modal";
import { ethers } from "ethers";
import { useAccount } from "wagmi";

function SameCreateList() {
  const { address } = useAccount();
  const [listData, setListData] = useState([]);
  const [tokenSymbolFinal, setTokenSymbol] = useState("ETH");
  const [errorModalIsOpen, setErrorModalIsOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [alertMessage, setAlertMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    receiverAddress: "",
    tokenAmount: 0,
    chainName: "Scroll",
  });
  const ethereumAddressPattern = /^(0x)?[0-9a-fA-F]{40}$/;

  const tokenBalance = async (totalTokenAmount) => {
    const balance = await getTokenBalance(
      address,
      tokensContractAddress[tokenSymbolFinal]
    );
    const decimal = DecimalValue[tokenSymbolFinal];
    const userTokenBalance = Math.floor(
      (Number(balance._hex) / 10 ** decimal).toFixed(decimal)
    );

    console.log("user balance:", userTokenBalance);
    console.log("token to transfer:", totalTokenAmount);
    console.log(totalTokenAmount);
    if (userTokenBalance < totalTokenAmount) {
      setErrorMessage(
        `Token exceeded.You don't have enough Token, your ${tokenSymbolFinal} balance is ${userTokenBalance} ${tokenSymbolFinal} and your total transfer amount is ${totalTokenAmount} ${tokenSymbolFinal}`
      );
      setErrorModalIsOpen(true);

      return false;
    } else {
      return true;
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleAddClick = () => {
    if (formData.receiverAddress.trim() === "") {
      setErrorMessage(`Please Fill all the fields Properly`);
      setErrorModalIsOpen(true);
      return;
    }
    if (
      formData.tokenAmount <= 0 ||
      formData.tokenAmount === null ||
      formData.tokenAmount == undefined
    ) {
      setErrorMessage(`Invalid token Amount`);
      setErrorModalIsOpen(true);
      return;
    }

    if (!ethereumAddressPattern.test(formData.receiverAddress)) {
      setErrorMessage("Invalid receipient address");
      setErrorModalIsOpen(true);
      return;
    }

    setListData([...listData, formData]);
    setFormData({
      receiverAddress: "",
      tokenAmount: 0,
      chainName: formData.chainName,
    });
  };

  const handleDeleteRow = (index) => {
    const updatedList = [...listData]; // Create a copy of the list
    updatedList.splice(index, 1); // Remove the item at the specified index
    setListData(updatedList); // Update the state with the modified list
  };

  // Main function to do the Contract Call
  const executeTransaction = async () => {
    console.log(tokenSymbolFinal);
    if (tokenSymbolFinal === "ETH") {
      const { ethereum } = window;
      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        provider
          .getBalance(address)
          .then(async (balance) => {
            const formattedBalance = ethers.utils.formatEther(balance);

            if (formattedBalance <= 0) {
              setLoading(false);
              setErrorMessage(`you do not have enough eth in your wallet`);
              setErrorModalIsOpen(true);
              console.log("");
            } else {
              console.log(`Balance of ${address}: ${formattedBalance} ETH`);
              console.log(listData);
              var recipients = [];
              var values = [];
              var totalAmount = 0;
              for (let i = 0; i < listData.length; i++) {
                totalAmount += parseFloat(listData[i]["tokenAmount"]);
                const etherAmount = listData[i]["tokenAmount"];
                const weiAmount = ethers.utils.parseEther(
                  etherAmount.toString()
                );
                recipients.push(listData[i]["receiverAddress"]);
                values.push(weiAmount);
              }
              console.log(recipients, values);
              console.log(typeof totalAmount);
              if (formattedBalance < totalAmount) {
                setLoading(false);
                setErrorMessage(
                  `Eth Limit Exceeded. Your Eth Balance is ${parseFloat(
                    formattedBalance
                  ).toFixed(
                    4
                  )}  ETH and you total sending Eth amount is ${totalAmount} ETH `
                );
                setErrorModalIsOpen(true);
                return;
              }
              const con = await crossSendInstance();
              const txsendPayment = await con.disperseEther(
                recipients,
                values,
                { value: ethers.utils.parseEther(totalAmount.toString()) }
              );

              const receipt = await txsendPayment.wait();
              setLoading(false);
              setErrorMessage(
                `Your Transaction was sucessfull, Visit Transaction History Page to view the details`
              );
              setErrorModalIsOpen(true);
              setListData([]);
              setSuccess(true);
              console.log("Transaction receipt:", receipt);
            }
          })
          .catch((error) => {
            console.error("Error fetching balance:", error);
          });
        return;
      }
    } else {
      var recipients = [];
      var values = [];
      var totalAmount = 0;
      for (let i = 0; i < listData.length; i++) {
        totalAmount += parseFloat(listData[i]["tokenAmount"]);
        const etherAmount = listData[i]["tokenAmount"];
        const weiAmount = ethers.utils.parseEther(etherAmount.toString());
        recipients.push(listData[i]["receiverAddress"]);
        values.push(
          ethers.utils.parseUnits(etherAmount, DecimalValue[tokenSymbolFinal])
        );
      }
      let userTokenBalance;
      console.log("first", totalAmount);
      userTokenBalance = await tokenBalance(totalAmount);
      if (userTokenBalance) {
        const { ethereum } = window;
        const provider = new ethers.providers.Web3Provider(ethereum);
        const isTokenApproved = await approveToken(
          totalAmount.toString(),
          tokensContractAddress[tokenSymbolFinal],
          DecimalValue[tokenSymbolFinal]
        );

        console.log(
          tokensContractAddress[tokenSymbolFinal],
          recipients,
          values
        );
        const con = await crossSendInstance();
        const txsendPayment = await con.disperseToken(
          tokensContractAddress[tokenSymbolFinal],
          recipients,
          values
        );

        const receipt = await txsendPayment.wait();
        setLoading(false);
        setErrorMessage(
          `Your Transaction was sucessfull, Visit Transaction History Page to view the details`
        );
        setErrorModalIsOpen(true);
        setListData([]);
        setSuccess(true);
        console.log("Transaction receipt:", receipt);
      }
    }

    // setLoading(true);
    console.log("list of data received from the form:", listData);
    if (listData.length === 0) {
      setErrorMessage(`Please enter necessary details`);
      setErrorModalIsOpen(true);
      return;
    }
  };

  return (
    <div>
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

      <div
        className={`user-form-for-list ${
          errorModalIsOpen ? "blurred-background" : ""
        }`}
      >
        <input
          className="each-input-of-create-list"
          type="text"
          name="receiverAddress"
          value={formData.receiverAddress}
          placeholder="Enter Receiver Address"
          onChange={handleInputChange}
        />
        <input
          className="each-input-of-create-list"
          type="number"
          name="tokenAmount"
          value={formData.tokenAmount}
          placeholder="Enter Token Amount"
          onChange={handleInputChange}
        />

        <input
          className="each-input-of-create-list"
          type="text"
          name="chainName"
          value="scroll"
          placeholder="Scroll"
          readOnly
        />

        <button className="button-to-add-form-data" onClick={handleAddClick}>
          Add to List
        </button>
      </div>
      <div className="div-to-add-the-tx">
        {listData.length > 0 ? (
          <div>
            <h1>Your Transaction Lineup</h1>
            <div className="scrollable-table-container">
              <table>
                <thead>
                  <tr>
                    <th>Receiver Address</th>
                    <th>Token Amount</th>
                    <th>Token Symbol</th>
                    <th>Chain Name</th>
                    <th>remove</th>
                  </tr>
                </thead>
                <tbody>
                  {listData.map((data, index) => (
                    <tr key={index}>
                      <td>{data.receiverAddress}</td>
                      <td>{data.tokenAmount}</td>
                      <td>{tokenSymbolFinal}</td>
                      <td>{data.chainName}</td>
                      <td>
                        <button
                          className="delete-button"
                          onClick={() => handleDeleteRow(index)}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <button
              className="send-button"
              onClick={() => {
                executeTransaction();
              }}
              disabled={loading}
            >
              {loading ? <div className="loader"></div> : "Begin Payment"}
            </button>
          </div>
        ) : (
          <h3>Your Transactions list will be listed here!!</h3>
        )}
      </div>
      <div>
        <a href="/Getting%20aUSDC.pdf" target="_blank">
          Steps to Get aUSDC
        </a>
      </div>
      <Modal
        className="popup-for-payment"
        isOpen={errorModalIsOpen}
        onRequestClose={() => setErrorModalIsOpen(false)}
        contentLabel="Error Modal"
      >
        {errorMessage ? (
          <>
            <h2>{success ? "Congratulations!!" : "Error"}</h2>
            <p>{errorMessage}</p>
            <div className="div-to-center">
              <button onClick={() => setErrorModalIsOpen(false)}>Close</button>
            </div>
          </>
        ) : (
          <>
            <h2>Notice</h2>
            <p>{alertMessage}</p>
            <div className="div-to-center">
              <button onClick={() => setErrorModalIsOpen(false)}>Close</button>
            </div>
          </>
        )}
      </Modal>
    </div>
  );
}

export default SameCreateList;
