import React, { useState, useEffect } from "react";
import "../../../Styles/dashboard/csvlist.css";
import { crossSendInstance } from "../../../Helpers/ContractInstance";
import { getDestChainAddress } from "../../../Helpers/DestChainAddresses";
import { getTokenBalance } from "../../../Helpers/TokenBalance";
import { getGasFees } from "../../../Helpers/getGasEstimation";
import { approveToken } from "../../../Helpers/ApproveToken";
import DecimalValue from "../../../Helpers/DecimalValue.json";
import tokensContractAddress from "../../../Helpers/GetTokenContractAddress.json";
import ERC20 from "../../../../src/artifacts/contracts/ERC20.sol/ERC20.json";

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
  const [customTokenAddress, setCustomTokenAddress] = useState("");
  const [total, setTotal] = useState(null);
  const [remaining, setRemaining] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [tokenSymbolFinal, setTokenSymbol] = useState("ETH");
  const [loading, setLoading] = useState(false);
  const [isSuccess, setSuccess] = useState(false);
  const [isTokenLoaded, setTokenLoaded] = useState(false);
  const [blockExplorerURL, setBlockExplorerURL] = useState("");

  const defaultTokenDetails = {
    name: null,
    symbol: null,
    balance: null,
    decimal: null,
  };
  const [tokenDetails, setTokenDetails] = useState(defaultTokenDetails);
  const getExplorer = async () => {
    const chainId = Number(
      await window.ethereum.request({ method: "eth_chainId" })
    );
    const network = ethers.providers.getNetwork(chainId);

    if (network.chainId == 534351) {
      setBlockExplorerURL("sepolia.scrollscan.dev");
    }
    if (network.chainId == 534352) {
      setBlockExplorerURL("scrollscan.com");
    }
    if (network.chainId == 919) {
      setBlockExplorerURL("sepolia.explorer.mode.network");
    }
    if (network.chainId == 34443) {
      setBlockExplorerURL("explorer.mode.network");
    }
  };
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
    console.log("hey");
    setListData(updatedList); // Update the state with the modified CSV data
  };

  const handleInputChange = (e, index) => {
    const { name, value } = e.target;
    console.log(name, value);
    const updatedRecord = { ...listData[index] };
    updatedRecord[name] = value; // Update the specific field in the record
    handleUpdateRow(index, updatedRecord); // Update the record in the listData at the specified index
  };

  const validateData = () => {
    for (let i = 0; i < listData.length; i++) {
      const tokenAmountError = isValidValue(listData[i].tokenAmount);
      const addressError = isValidAddress(listData[i].receiverAddress);
      const chainName = listData[i].chainName;

      if (!tokenAmountError || !addressError) {
        setErrorMessage(`Invalid data at Line ${i + 1}`);
        setErrorModalIsOpen(true);
        return false; // Validation failed
      }
    }

    return true; // All validations passed
  };

  const isValidAddress = (address) => ethers.utils.isAddress(address);

  const isValidValue = (value) => {
    // console.log(value);
    if (isTokenLoaded) {
      try {
        // console.log(ethers.utils.parseUnits(value, tokenDetails.decimal));
        return ethers.utils.parseUnits(value, tokenDetails.decimal);
      } catch (err) {
        return false;
      }
    } else {
      try {
        if (ethers.utils.parseUnits(value, "ether") <= 0) {
          return false;
        }
        // console.log(ethers.utils.parseUnits(value, "ether"));
        return ethers.utils.parseUnits(value, "ether");
      } catch (err) {
        return false;
      }
    }
  };

  const [ethBalance, setEthBalance] = useState(null);
  const [isSendingEth, setIsSendingEth] = useState(false);

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

  const tokenBalance = async () => {
    if (
      !ethers.utils
        .parseUnits(tokenDetails.balance, tokenDetails.decimal)
        .gt(total)
    ) {
      setErrorMessage(
        `Token exceeded.You don't have enough Token, your ${
          tokenDetails.symbol
        } balance is ${tokenDetails.balance} ${
          tokenDetails.symbol
        } and your total transfer amount is ${ethers.utils.formatEther(
          total
        )} ${tokenDetails.symbol}`
      );
      setErrorModalIsOpen(true);

      return false;
    } else {
      return true;
    }
  };
  const loadToken = async () => {
    setRemaining(null);
    setTotal(null);
    setListData([]);
    setIsSendingEth(false);
    if (customTokenAddress === "") {
      setErrorMessage(`Please Add token Address`);
      setErrorModalIsOpen(true);
      return;
    }
    setTokenDetails(defaultTokenDetails);
    try {
      const { ethereum } = window;
      if (ethereum && customTokenAddress !== "") {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        try {
          const erc20 = new ethers.Contract(
            customTokenAddress,
            ERC20.abi,
            signer
          );
          const name = await erc20.name();
          const symbol = await erc20.symbol();
          const balance = await erc20.balanceOf(address);
          const decimals = await erc20.decimals();
          console.log(symbol, balance);
          setTokenDetails({
            name,
            symbol,
            balance: ethers.utils.formatUnits(balance, decimals),
            decimal: decimals,
          });
          setTokenLoaded(true);
          console.log(tokenDetails);
        } catch (error) {
          console.log("loading token error", error);
          setErrorMessage(`Token not Found`);
          setErrorModalIsOpen(true);
          return;
        }
      }
    } catch (error) {
      console.log(error);
    }
  };
  const unloadToken = async () => {
    setTokenDetails(defaultTokenDetails);
    setRemaining(null);
    setTotal(null);
    setTokenLoaded(false);
    setListData([]);
  };
  const getEthBalance = async () => {
    const { ethereum } = window;
    if (!ethBalance) {
      const provider = new ethers.providers.Web3Provider(ethereum);
      let ethBalance = await provider.getBalance(address);
      ethBalance = ethers.utils.formatEther(ethBalance);
      setEthBalance(ethBalance);
    }
    setIsSendingEth(true);
  };

  // Main function to do the Contract Call
  const executeTransaction = async () => {
    console.log(listData);
    setLoading(true);
    if (!validateData()) {
      setLoading(false);
      return; // If validation failed, don't execute the transaction
    }
    if (isSendingEth) {
      const { ethereum } = window;
      console.log(ethBalance, total);
      if (!ethers.utils.parseUnits(ethBalance).gt(total)) {
        setLoading(false);
        setErrorMessage(
          `Eth Limit Exceeded. Your Eth Balance is ${ethBalance}  ETH and you total sending Eth amount is ${ethers.utils.formatEther(
            total
          )} ETH `
        );
        setErrorModalIsOpen(true);
        return;
      } else {
        var recipients = [];
        var values = [];
        for (let i = 0; i < listData.length; i++) {
          recipients.push(listData[i]["receiverAddress"]);
          console.log(listData[i]["tokenAmount"]);
          values.push(isValidValue(listData[i]["tokenAmount"]));
        }
        console.log(recipients, values, total);
        try {
          console.log(recipients);
          const con = await crossSendInstance();
          const txsendPayment = await con.disperseEther(recipients, values, {
            value: total,
          });

          const receipt = await txsendPayment.wait();
          setLoading(false);
          setErrorMessage(
            <div
              dangerouslySetInnerHTML={{
                __html: `Your Transaction was successful. Visit <a href="https://${blockExplorerURL}/tx/${receipt.transactionHash}" target="_blank">here</a> for details.`,
              }}
            />
          );
          setErrorModalIsOpen(true);
          setListData([]);
          setSuccess(true);
          console.log("Transaction receipt:", receipt);
        } catch (error) {
          setLoading(false);
          setErrorMessage(`Transaction cancelled.`);
          setErrorModalIsOpen(true);
          setSuccess(false);
          console.error("Transaction failed:", error);
        }
      }
    } else {
      console.log("first");
      var recipients = [];
      var values = [];
      console.log(listData);
      for (let i = 0; i < listData.length; i++) {
        recipients.push(listData[i]["receiverAddress"]);
        values.push(isValidValue(listData[i]["tokenAmount"]));
      }

      let userTokenBalance;

      userTokenBalance = await tokenBalance(total);
      if (userTokenBalance) {
        const isTokenApproved = await approveToken(total, customTokenAddress);

        if (isTokenApproved) {
          try {
            const con = await crossSendInstance();
            const txsendPayment = await con.disperseToken(
              customTokenAddress,
              recipients,
              values
            );

            const receipt = await txsendPayment.wait();
            setLoading(false);
            setErrorMessage(
              <div
                dangerouslySetInnerHTML={{
                  __html: `Your Transaction was successful. Visit <a href="https://${blockExplorerURL}/tx/${receipt.transactionHash}" target="_blank">here</a> for details.`,
                }}
              />
            );
            setErrorModalIsOpen(true);
            setListData([]);
            setSuccess(true);
          } catch (e) {
            setLoading(false);
            console.log("error", e);
            setErrorMessage("Transaction Rejected");
            setErrorModalIsOpen(true);
            return;
          }
        } else {
          setLoading(false);
          setErrorMessage("Approval Rejected");
          setErrorModalIsOpen(true);
          return;
        }
      }
    }

    console.log("list of data received from the form:", listData);
    if (listData.length === 0) {
      setErrorMessage(`Please enter necessary details`);
      setErrorModalIsOpen(true);
      return;
    }
  };

  useEffect(() => {
    if (listData.length > 0) {
      let newTotal = ethers.BigNumber.from(0);

      // console.log(newTotal);
      for (let i = 0; i < listData.length; i++) {
        if (isValidValue(listData[i].tokenAmount)) {
          newTotal = newTotal.add(isValidValue(listData[i].tokenAmount));
          // console.log(listData[i].tokenAmount);
        }
      }
      setTotal(newTotal);
    } else {
      setTotal(null);
    }
    getExplorer();
  }, [listData]);

  useEffect(() => {
    if (isSendingEth) {
      if (ethBalance && total) {
        const tokenBalance = ethers.utils.parseEther(ethBalance);
        const remaining = tokenBalance.sub(total);
        // console.log(remaining);
        setRemaining(ethers.utils.formatEther(remaining));
      } else {
        setRemaining(null);
      }
    }
  }, [total]);
  useEffect(() => {
    if (isTokenLoaded) {
      if (tokenDetails.balance && total) {
        const tokenBalance = ethers.utils.parseUnits(
          tokenDetails.balance,
          tokenDetails.decimal
        );
        const remaining = tokenBalance.sub(total);
        console.log(remaining);
        setRemaining(ethers.utils.formatUnits(remaining, tokenDetails.decimal));
      } else {
        setRemaining(null);
      }
    }
  }, [total]);

  return (
    <div>
      <div className="main-div-for-upload-csv-file">
        <div className="Whole-div-for-same-csv">
          {/* ------ */}
          <div>
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
          {/* ------ */}
          {/* token section starts here */}
          <div className="token-div-same-csv">
            <div className="title-load-token-same-csv">
              <h2 style={{ padding: "10px" }}>
                Select or Load Token you want to Disperse
              </h2>
            </div>
            {isTokenLoaded ? null : (
              <button
                id="background-purple"
                className="button-to-add-form-data"
                onClick={() => {
                  getEthBalance();
                }}
              >
                Send Eth
              </button>
            )}
            {isTokenLoaded ? null : " OR "}
            <input
              id="border-purple"
              type="text"
              className="each-input-of-create-list"
              placeholder="Enter token Address"
              value={customTokenAddress}
              onChange={(e) => setCustomTokenAddress(e.target.value)}
            />
            {isTokenLoaded ? (
              <button
                id="background-green"
                className="sbutton-t-add-form-data-unload"
                onClick={() => {
                  unloadToken();
                }}
              >
                Unload Token
              </button>
            ) : (
              <button
                id="background-purple"
                className="button-to-add-form-data"
                onClick={() => {
                  loadToken();
                }}
              >
                Load Token
              </button>
            )}

            {/* token section ends here */}
            {isTokenLoaded || isSendingEth ? (
              <div>
                <div className="title-for-upload-file-csv-same">
                  <h2 style={{ padding: "10px" }}>
                    Upload your Csv file which contains recipient Address and
                    Token Amount
                  </h2>
                </div>
                <div className="upload-or-download">
                  <div className="input-div-for-csv">
                    {/* <label>Upload File</label> &nbsp; &nbsp; */}
                    <input
                      className="input-csv-feild"
                      type="file"
                      accept=".csv"
                      onChange={handleFileUpload}
                    />
                  </div>

                  <div>
                    <a
                      href="/Book2.csv"
                      download="Book2.csv"
                      className="download-btn"
                    >
                      <button>Download sample CSV file</button>
                    </a>
                  </div>
                </div>
              </div>
            ) : null}
          </div>
          {listData.length > 0 && isSendingEth ? (
            <div>
              <div id="background-csv" className="account-summary-create-title">
                <h2>Account Summary</h2>
              </div>
              <table className="showtoken-table">
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
            </div>
          ) : null}

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

          {(listData.length > 0 && isSendingEth) || isTokenLoaded ? (
            <div className="display-csvfile-here">
              <div className="table-wrapper">
                <div className="title-tnx-line-same-csv">
                  <h2>Transaction Lineup</h2>
                </div>
                <table>
                  <thead id="table-header-csv-same">
                    <tr>
                      <th>Receiver address</th>
                      <th>Token Amount</th>
                      <th>Token Symbol</th>
                      <th>Chain Name</th>
                      <th>Remove</th>
                    </tr>
                  </thead>
                  <tbody>
                    {listData.map((data, index) => (
                      <tr key={index}>
                        <td>
                          <input
                            className={`each-input-of-create-list ${
                              isValidAddress(data.receiverAddress)
                                ? ""
                                : "input-error"
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
                              isValidValue(data.tokenAmount)
                                ? ""
                                : "input-error"
                            }`}
                            type="number"
                            name="tokenAmount"
                            value={data.tokenAmount}
                            placeholder="Enter Token Amount"
                            onChange={(e) => handleInputChange(e, index)}
                          />
                        </td>
                        <td>{isTokenLoaded ? tokenDetails.symbol : "ETH"}</td>
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
          ) : null}
        </div>
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
                <button onClick={() => setErrorModalIsOpen(false)}>
                  Close
                </button>
              </div>
            </>
          ) : (
            <>
              <h2>Notice</h2>
              <p>{alertMessage}</p>
              <div className="div-to-center">
                <button onClick={() => setErrorModalIsOpen(false)}>
                  Close
                </button>
              </div>
            </>
          )}
        </Modal>
      </div>
    </div>
  );
}

export default SameCsvList;
