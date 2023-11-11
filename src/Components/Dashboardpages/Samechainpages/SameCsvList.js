import React, { useState } from "react";
import "../../../Styles/dashboard/csvlist.css";
import { crossSendInstance } from "../../../Helpers/ContractInstance";
import { getDestChainAddress } from "../../../Helpers/DestChainAddresses";
import { getTokenBalance } from "../../../Helpers/TokenBalance";
import { getGasFees } from "../../../Helpers/getGasEstimation";
import { approveToken } from "../../../Helpers/ApproveToken";
import DecimalValue from "../../../Helpers/DecimalValue.json";
import tokensContractAddress from "../../../Helpers/GetTokenContractAddress.json";
import { useAccount, useSigner } from "wagmi";
import Modal from "react-modal";
import { ethers } from "ethers";

function SameCsvList() {
  const [csvData, setCsvData] = useState([]);
  const { address, isConnected } = useAccount();
  const [listData, setListData] = useState([]);
  const [isCsvDataEmpty, setIsCsvDataEmpty] = useState(true);
  const [errorModalIsOpen, setErrorModalIsOpen] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");

  const [errorMessage, setErrorMessage] = useState("");
  const [tokenSymbolFinal, setTokenSymbol] = useState("ETH");
  const [loading, setLoading] = useState(false);
  const [isSuccess, setSuccess] = useState(false);

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
  const handleUpdateRow = (index, updatedRecord) => {
    const updatedList = [...listData]; // Create a copy of the CSV data
    updatedList[index] = updatedRecord; // Update the record at the specified index
    setListData(updatedList); // Update the state with the modified CSV data
  };

  const handleInputChange = (e, index) => {
    const { name, value } = e.target;
    const updatedRecord = { ...listData[index] }; // Create a copy of the record at the specified index
    updatedRecord[name] = value; // Update the specific field in the record
    handleUpdateRow(index, updatedRecord); // Update the record in the listData at the specified index
  };

  const ethereumAddressPattern = /^(0x)?[0-9a-fA-F]{40}$/;

  const validateTokenAmount = (tokenAmount) => {
    if (isNaN(tokenAmount) || parseFloat(tokenAmount) <= 0) {
      return "Token amount is invalid.";
    }
    return null;
  };

  const validateAddress = (address) => {
    if (!ethereumAddressPattern.test(address)) {
      return "Invalid receipient address.";
    }
    return null;
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
    console.log(balance);
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
      setLoading(false);
      setErrorModalIsOpen(true);
      return;
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
          calAmount: [],
        };
      }

      const group = groupedData[chainName];
      group.receivers.push(receiverAddress);
      const parsedTokenAmount = ethers.utils.parseUnits(tokenAmount, 6);
      group.amounts.push(parsedTokenAmount);
      group.calAmount.push(parseInt(tokenAmount));
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
    console.log(groupedDataArray);
    const newData = groupedDataArray.map((item) => {
      const totalCalAmount = item.calAmount.reduce((acc, val) => acc + val, 0);
      const { calAmount, ...rest } = item; // Remove the "calAmount" key
      return {
        ...rest, // Spread the rest of the properties
        totalAmount: ethers.utils.parseUnits(totalCalAmount.toString(), 6),
      };
    });
    console.log(newData);
    return newData;
  }

  const executeTransaction = async () => {
    if (tokenSymbolFinal === "") {
      setErrorMessage(`Please Select a Token`);
      setLoading(false);
      setErrorModalIsOpen(true);
      return;
    }
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
                <option value="ETH">ETH</option>
                <option value="USDC">USDC</option>
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
                      <td>
                        <input
                          className={`each-input-of-create-list ${
                            validateAddress(data.receiverAddress)
                              ? "input-error"
                              : ""
                          }`}
                          type="text"
                          name="receiverAddress"
                          value={data.receiverAddress}
                          placeholder="Enter Receiver Address"
                          onChange={(e) => handleInputChange(e, index)}
                        />
                      </td>
                      <td>
                        <input
                          className={`each-input-of-create-list ${
                            validateTokenAmount(data.tokenAmount)
                              ? "input-error"
                              : ""
                          }`}
                          type="number"
                          name="tokenAmount"
                          value={data.tokenAmount}
                          placeholder="Enter Token Amount"
                          onChange={(e) => handleInputChange(e, index)}
                        />
                      </td>
                      <td>{tokenSymbolFinal}</td>
                      <td>
                        <input
                          className="each-input-of-create-list"
                          type="text"
                          name="chainName"
                          value="scroll"
                          placeholder="Scroll"
                          readOnly
                        />
                      </td>
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
        {errorMessage ? (
          <>
            <h2>{isSuccess ? "Congratulations!!" : "Error"}</h2>
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

export default SameCsvList;
