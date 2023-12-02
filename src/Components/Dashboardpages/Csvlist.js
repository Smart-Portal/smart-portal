import React, { useState } from "react";
import "../../Styles/dashboard/csvlist.css";
import { crossSendInstance } from "../../Helpers/ContractInstance";
import { getDestChainAddress } from "../../Helpers/DestChainAddresses";
import { getTokenBalance } from "../../Helpers/TokenBalance";
import { getGasFees } from "../../Helpers/getGasEstimation";
import { approveToken } from "../../Helpers/ApproveToken";
import DecimalValue from "../../Helpers/DecimalValue.json";
import tokensContractAddress from "../../Helpers/GetTokenContractAddress.json";
import { useAccount, useSigner } from "wagmi";
import Modal from "react-modal";
import { ethers } from "ethers";

function Csvlist() {
  const [csvData, setCsvData] = useState([]);
  const { address, isConnected } = useAccount();
  const [total, setTotal] = useState(null);
  const [remaining, setRemaining] = useState(null);
  const [listData, setListData] = useState([]);
  const [isCsvDataEmpty, setIsCsvDataEmpty] = useState(true);
  const [errorModalIsOpen, setErrorModalIsOpen] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [isTokenLoaded, setTokenLoaded] = useState(false);
  const [isSuccess, setSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [tokenSymbolFinal, setTokenSymbol] = useState("");
  const [loading, setLoading] = useState(false);
  const [tokenDetails, setTokenDetails] = useState();
  const [ethBalance, setEthBalance] = useState(null);
  const [isSendingEth, setIsSendingEth] = useState(false);

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
    // updatedRecord[name] = value; // Update the specific field in the record
    if (name === "tokenAmount" && !value.includes(".")) {
      updatedRecord[name] = String(Number(value));
    } else {
      updatedRecord[name] = value; // Update the specific field in the record
    }
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

  const isChainNameValid = (chainName) => {
    const validOptions = [
      "Polygon",
      "ethereum-2",
      "Avalanche",
      "Moonbeam",
      "arbitrum",
    ];
    return validOptions.includes(chainName);
  };

  const optionValueToDisplayName = {
    Polygon: "Polygon",
    "ethereum-2": "Ethereum",
    Avalanche: "Avalanche",
    Moonbeam: "Moonbeam",
    arbitrum: "Arbitrum",
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

  const validateData = () => {
    for (let i = 0; i < listData.length; i++) {
      const tokenAmountError = validateTokenAmount(listData[i].tokenAmount);
      const addressError = validateAddress(listData[i].receiverAddress);
      const chainName = listData[i].chainName;

      if (tokenAmountError || addressError || !isChainNameValid(chainName)) {
        setErrorMessage(
          `Invalid data at Line ${i + 1}: ${tokenAmountError || ""} ${
            addressError || ""
          } ${isChainNameValid(chainName) ? "" : "Invalid chain "}`
        );
        setErrorModalIsOpen(true);
        return false; // Validation failed
      }
    }

    return true; // All validations passed
  };

  const executeTransaction = async () => {
    debugger;
    let userTokenBalance; // Define userTokenBalance here
    setLoading(true);

    if (!validateData()) {
      setLoading(false);
      return; // If validation failed, don't execute the transaction
    }

    console.log("list of data received from the form:", listData);
    if (listData.length === 0) {
      setErrorMessage(`Please enter necessary details`);
      setErrorModalIsOpen(true);
      setLoading(false);
      return;
    }

    processListData(listData)
      .then(async (groupedData) => {
        console.log("Processed data for smart contract:", groupedData);

        // get total gas fees
        const totalGasFees = groupedData.reduce((sum, item) => {
          return sum + (item.gasFees || 0);
        }, 0);
        console.log("Total gas fees required for Relayer: ", totalGasFees);
        setTimeout(() => {
          setAlertMessage(
            `Total gas fees required to pay the Relayer: ${ethers.utils.formatEther(
              totalGasFees
            )} Scroll ETH`
          );
          setErrorModalIsOpen(true);
        }, 3000);

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
            tokensContractAddress[tokenSymbolFinal],
            DecimalValue[tokenSymbolFinal]
          );
          if (isTokenApproved) {
            try {
              const con = await crossSendInstance();
              const txsendPayment = await con.sendPayment(groupedData, {
                value: totalGasFees,
              });

              const receipt = await txsendPayment.wait();
              setLoading(false);
              setErrorMessage(
                `Your Transaction was sucessfull, Visit Transaction History Page to view the details`
              );
              setErrorModalIsOpen(true);
              setListData([]);
              setSuccess(true);
              console.log("Transaction receipt:", receipt);
            } catch (e) {
              console.log("Transaction cancelled");
            }
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
        <div className="title-load-token-same-csv">
          <h2>Select or Load Token you want to Disperse</h2>
        </div>
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
        <div className="input-div-for-csv">
          <div className="title-for-upload-file-csv-same">
            <h2>
              Upload your Csv file which contains receipientAddress and Token
              Amount
            </h2>
          </div>
          <label>Upload File</label> &nbsp; &nbsp;
          <input
            className="input-csv-feild"
            type="file"
            accept=".csv"
            onChange={handleFileUpload}
          />
        </div>
        <div
          className={`user-form-for-list ${
            errorModalIsOpen ? "blurred-background" : ""
          }`}
        >
          <div className="display-csvfile-here">
            <div className="title-tnx-line-same-csv">
              <h2>Transaction Lineup</h2>
            </div>
            {/* {isCsvDataEmpty ? (
              <p>Upload your CSV File</p>
            ) : ( */}
            <div className="table-wrapper">
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
                        <select
                          className={`each-input-of-create-list ${
                            isChainNameValid(data.chainName)
                              ? ""
                              : "input-error"
                          }`}
                          name="chainName"
                          value={data.chainName}
                          onChange={(e) => handleInputChange(e, index)}
                        >
                          {isChainNameValid(data.chainName) ? null : (
                            <option value={data.chainName}>
                              {data.chainName}
                            </option>
                          )}

                          {Object.keys(optionValueToDisplayName).map(
                            (optionValue) => (
                              <option key={optionValue} value={optionValue}>
                                {optionValueToDisplayName[optionValue]}
                              </option>
                            )
                          )}
                        </select>
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
            <div>
              <div
                id="background-purple"
                className="title-for-account-summary-cs-svame"
              >
                <h2>Account Summary</h2>
              </div>
              <table className="showtoken-table-csv-same">
                <thead>
                  <tr>
                    <th>Total Amount</th>
                    <th>Your Balance</th>
                    <th>Remaining Balance</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>
                      {total ? `${ethers.utils.formatEther(total)}  ETH` : null}
                    </td>
                    <td>{`${ethBalance} ETH`}</td>
                    <td
                      className={`showtoken-remaining-balance ${
                        remaining < 0 ? "showtoken-remaining-negative" : ""
                      }`}
                    >
                      {remaining === null ? null : `${remaining} ETH`}
                    </td>
                  </tr>
                </tbody>
              </table>
              {listData.length > 0 && isTokenLoaded ? (
                <table className="showtoken-table">
                  <thead>
                    <tr>
                      <th>Total Amount</th>
                      <th>Remaining Balance</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>
                        {total
                          ? `${ethers.utils.formatUnits(
                              total,
                              tokenDetails.decimal
                            )}  ${tokenDetails.symbol}`
                          : null}
                      </td>
                      <td
                        className={`showtoken-remaining-balance ${
                          remaining < 0 ? "showtoken-remaining-negative" : ""
                        }`}
                      >
                        {remaining === null
                          ? null
                          : `${remaining} ${tokenDetails.symbol}`}
                      </td>
                    </tr>
                  </tbody>
                </table>
              ) : null}
            </div>
            {/* )} */}
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
      </div>
      <div className="steps-to-get-ausdc">
        <button id="background-csv">
          <a href="/Book1.csv" download="Book1.csv">
            Download sample CSV file
          </a>
        </button>
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

export default Csvlist;
