import React, { useState } from "react";
import "../../Styles/dashboard/csvlist.css";
import { crossSendInstance } from "../../Helpers/ContractInstance";
import { getDestChainAddress } from "../../Helpers/DestChainAddresses";
import { getTokenBalance } from "../../Helpers/TokenBalance";
import { getGasFees } from "../../Helpers/getGasEstimation";
import { approveToken } from "../../Helpers/ApproveToken";
import tokensContractAddress from "../../Helpers/GetTokenContractAddress.json";
import { useAccount, useSigner } from "wagmi";
import Modal from "react-modal";
import { ethers } from "ethers";

function Csvlist() {
  const [csvData, setCsvData] = useState([]);
  const { address, isConnected } = useAccount();
  const [listData, setListData] = useState([]);
  const [isCsvDataEmpty, setIsCsvDataEmpty] = useState(true);
  const [errorModalIsOpen, setErrorModalIsOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [tokenSymbolFinal, setTokenSymbol] = useState("");
  const [loading, setLoading] = useState(false);

  const parseCSV = (content) => {
    const rows = content.split("\n");
    if (rows.length < 2) {
      alert("Invalid CSV format. Please check the CSV file.");
      return [];
    }

    const headers = rows[0].split(",").map((header) => header.trim());

    const data = [];
    for (let i = 1; i < rows.length; i++) {
      const row = rows[i].split(",").map((item) => item.trim());

      if (row.length === headers.length) {
        const rowData = {};
        headers.forEach((header, index) => {
          rowData[header] = row[index];
        });
        data.push(rowData);
      }
    }

    return data;
  };

  const handleDeleteRow = (index) => {
    const updatedList = [...listData]; // Create a copy of the CSV data
    updatedList.splice(index, 1); // Remove the item at the specified index
    setListData(updatedList); // Update the state with the modified CSV data
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];

    if (file) {
      const reader = new FileReader();

      reader.onload = async (e) => {
        const content = e.target.result;
        console.log(content);
        try {
          const parsedData = parseCSV(content);

          if (parsedData) {
            setCsvData(parsedData);
            setIsCsvDataEmpty(parsedData.length === 0);
            console.log(parsedData);
            const listData = [];
            for (let i = 0; i < parsedData.length; i++) {
              listData.push({
                receiverAddress: parsedData[i]["Receiver Address"],
                tokenAmount: parsedData[i]["Token Amount"],
                chainName: parsedData[i]["Chain Name"],
              });
            }
            console.log(listData);
            setListData(listData);
            console.log("list data is set");
          } else {
            console.error("Parsed data is empty.");
          }
        } catch (error) {
          console.error("Error parsing CSV data:", error);
        }
      };

      reader.readAsText(file);
    }
  };

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

  async function processListData(listData) {
    if (tokenSymbolFinal === "") {
      setErrorMessage(`Please Select a Token`);
      setErrorModalIsOpen(true);
    }
    const groupedData = {};
    console.log(listData);
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
        console.error(error);
      });
  };

  return (
    <div>
      <div className="main-div-for-upload-csv-file">
        <div className="input-div-for-csv">
          <label>Upload File</label> &nbsp; &nbsp;
          <input
            className="input-csv-feild"
            type="file"
            accept=".csv"
            onChange={handleFileUpload}
          />
        </div>
      </div>
      <div
        className={`user-form-for-list ${
          errorModalIsOpen ? "blurred-background" : ""
        }`}
      >
        <div className="display-csvfile-here">
          {isCsvDataEmpty ? (
            <p>Upload your CSV File</p>
          ) : (
            <div className="table-wrapper">
              <select
                className="each-input-of-create-list"
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
              <table>
                <thead>
                  <tr>
                    <th>Receiver address</th>
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
          )}
          {isCsvDataEmpty ? null : (
            <button
              className="button-to-submit-csv"
              onClick={() => {
                executeTransaction();
              }}
              disabled={loading}
            >
              {loading ? <div className="loader"></div> : "Begin Payment"}
            </button>
          )}
        </div>
      </div>
      <div>
        <a href="/Book1.csv" download="Book1.csv">
          Download sample CSV file
        </a>
      </div>
      <Modal
        className="popup-for-payment"
        isOpen={errorModalIsOpen}
        onRequestClose={() => setErrorModalIsOpen(false)}
        contentLabel="Error Modal"
      >
        <h2>Error</h2>
        <p>{errorMessage}</p>
        <div className="div-to-center">
          <button onClick={() => setErrorModalIsOpen(false)}>Close</button>
        </div>
      </Modal>
    </div>
  );
}

export default Csvlist;
