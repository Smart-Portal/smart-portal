import React, { useState } from "react";
import "../../Styles/dashboard/createlist.css";
import { crossSendInstance } from "../../Helpers/ContractInstance";
import { getDestChainAddress } from "../../Helpers/DestChainAddresses";
import { getTokenBalance } from "../../Helpers/TokenBalance";
import { getGasFees } from "../../Helpers/getGasEstimation";
import { approveToken } from "../../Helpers/ApproveToken";
import tokensContractAddress from "../../Helpers/GetTokenContractAddress.json";
import Modal from "react-modal";
import { ethers } from "ethers";
import { useAccount, useSigner } from "wagmi";

function Createlist() {
  const { address } = useAccount();
  const [listData, setListData] = useState([]);
  const [tokenSymbolFinal, setTokenSymbol] = useState("aUSDC");
  const [errorModalIsOpen, setErrorModalIsOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [alertMessage, setAlertMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    receiverAddress: "",
    tokenAmount: "",
    chainName: "Polygon",
  });
  const ethereumAddressPattern = /^(0x)?[0-9a-fA-F]{40}$/;

  const tokenBalance = async (totalTokenAmount) => {
    const balance = await getTokenBalance(
      address,
      tokensContractAddress[tokenSymbolFinal]
    );
    const userTokenBalance = Math.floor(
      (Number(balance._hex) / 1e6).toFixed(6),
      2
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
    if (
      formData.receiverAddress.trim() === "" ||
      formData.tokenAmount.trim() === "" ||
      formData.chainName.trim() === ""
    ) {
      setErrorMessage(`Please Fill all the fields`);
      setErrorModalIsOpen(true);
      return;
    }

    if (!ethereumAddressPattern.test(formData.receiverAddress)) {
      setErrorMessage("Invalid Ethereum address");
      setErrorModalIsOpen(true);
      return;
    }
    setListData([...listData, formData]);
    setFormData({
      receiverAddress: "",
      tokenAmount: "",
      chainName: formData.chainName,
    });
  };

  const handleDeleteRow = (index) => {
    const updatedList = [...listData]; // Create a copy of the list
    updatedList.splice(index, 1); // Remove the item at the specified index
    setListData(updatedList); // Update the state with the modified list
  };

  //standarized the data received from the list for contract call
  async function processListData(listData) {
    if (tokenSymbolFinal === "") {
      setErrorMessage(`Please Select a Token`);
      setErrorModalIsOpen(true);
      setLoading(false);
      return;
    }
    const groupedData = {};

    const promises = listData.map(async (item) => {
      const { chainName, receiverAddress, tokenAmount } = item;

      if (!groupedData[chainName]) {
        groupedData[chainName] = {
          receivers: [],
          amounts: [],
          destChain: "",
          detContractAddress: "",
          tokenSymbol: "",
          gasFees: 0,
        };
      }

      const group = groupedData[chainName];
      group.receivers.push(receiverAddress);
      group.amounts.push(ethers.utils.parseUnits(tokenAmount, 6));
      group.destChain = chainName;

      // Use Promise.all to concurrently fetch data for each item
      const [destChainAddress, gasFees] = await Promise.all([
        getDestChainAddress(chainName),
        getGasFees(chainName, tokenSymbolFinal),
      ]);

      group.detContractAddress = destChainAddress;
      group.tokenSymbol = tokenSymbolFinal;
      group.gasFees = gasFees * 1000000000;
    });

    // Wait for all promises to complete before returning the result
    await Promise.all(promises);

    const groupedDataArray = Object.values(groupedData);
    return groupedDataArray;
  }

  // Main function to do the Contract Call
  const executeTransaction = async () => {
    let userTokenBalance; // Define userTokenBalance here
    setLoading(true);
    console.log("list of data received from the form:", listData);
    if (listData.length === 0) {
      setErrorMessage(`Please enter necessary details`);
      setErrorModalIsOpen(true);
      return;
    }

    processListData(listData)
      .then(async (groupedData) => {
        console.log("Processed data for smart contract:", groupedData);

        // get total gas fees
        const totalGasFees = groupedData.reduce((sum, item) => {
          return sum + (item.gasFees || 0);
        }, 0);
        console.log("Total gas fees required:", totalGasFees);

        // get total token amount
        const totalTokenAmount = groupedData.reduce((sum, group) => {
          const groupTotal = group.amounts.reduce((acc, amount) => {
            // Convert BigNumber to decimal with six decimal places
            const decimalAmount = Number(amount.toString()) / 1e6;
            return acc + decimalAmount;
          }, 0);
          return sum + groupTotal;
        }, 0);

        userTokenBalance = await tokenBalance(totalTokenAmount); // Assign the value here

        if (userTokenBalance) {
          console.log("Proceeding for approval....");
          const isTokenApproved = await approveToken(
            totalTokenAmount.toString(),
            tokensContractAddress[tokenSymbolFinal]
          );
          if (isTokenApproved) {
            const con = await crossSendInstance();
            const txsendPayment = await con.sendPayment(groupedData, {
              value: totalGasFees,
            });

            const receipt = await txsendPayment.wait();
            setLoading(false);
            console.log("Transaction receipt:", receipt);
          }
        }
        setLoading(false);
      })
      .catch((error) => {
        setLoading(false);
        console.error(error);
      });
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
        <option svalue="aUSDC">aUSDC</option>
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

        <select
          className="each-input-of-create-list"
          name="chainName"
          value={formData.chainName}
          onChange={handleInputChange}
        >
          <option value="" disabled selected>
            Select Chain
          </option>
          <option value="Polygon">Polygon</option>
          <option value="ethereum-2">Ethereum</option>
          <option value="Avalanche">Avalanche</option>
          <option value="Moonbeam">Moonbeam</option>
          <option value="arbitrum">Arbitrum</option>
        </select>
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
            <h2>Error</h2>
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

export default Createlist;
