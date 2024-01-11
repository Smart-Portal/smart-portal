import React, { useState } from "react";
import "../../Styles/dashboard/createlist.css";
import { crossSendInstance } from "../../Helpers/ContractInstance";
import { getDestChainAddress } from "../../Helpers/DestChainAddresses";
import { getTokenBalance } from "../../Helpers/TokenBalance";
import { getGasFees } from "../../Helpers/getGasEstimation";
import { approveToken } from "../../Helpers/ApproveToken";
import DecimalValue from "../../Helpers/DecimalValue.json";
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
  const [selectedtoken, setselectedtoken] = useState("");
  const [ethBalance, setEthBalance] = useState(null);
  const [isTokenLoaded, setTokenLoaded] = useState(false);
  const [success, setSuccess] = useState(false);
  const [isSendingEth, setIsSendingEth] = useState(false);
  const [total, setTotal] = useState(null);
  const [tokenDetails, setTokenDetails] = useState();
  const [remaining, setRemaining] = useState(null);
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
    if (
      formData.receiverAddress.trim() === "" ||
      formData.tokenAmount.trim() === "" ||
      formData.chainName.trim() === ""
    ) {
      setErrorMessage(`Please Fill all the fields`);
      setErrorModalIsOpen(true);
      return;
    }
    formData.tokenAmount = String(Number(formData.tokenAmount));

    if (!ethereumAddressPattern.test(formData.receiverAddress)) {
      setErrorMessage("Invalid receipient address");
      setErrorModalIsOpen(true);
      return;
    }

    console.log(parseInt(formData.tokenAmount, 10));
    if (parseInt(formData.tokenAmount, 10) <= 0) {
      setErrorMessage("Token amount invalid");
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
    const updatedList = [...listData];
    updatedList.splice(index, 1);
    setListData(updatedList);
  };

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
          calAmount: [],
        };
      }

      const group = groupedData[chainName];
      group.receivers.push(receiverAddress);
      group.amounts.push(
        ethers.utils.parseUnits(tokenAmount, DecimalValue[tokenSymbolFinal])
      );
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
    const newData = groupedDataArray.map((item) => {
      const totalCalAmount = item.calAmount.reduce((acc, val) => acc + val, 0);
      const { calAmount, ...rest } = item; // Remove the "calAmount" key
      return {
        ...rest,
        totalAmount: ethers.utils.parseUnits(
          totalCalAmount.toString(),
          DecimalValue[tokenSymbolFinal]
        ),
      };
    });
    console.log(newData);
    return newData;
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
              console.log("transaction cancelled");
            }
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
      <div className="div-in-same-create-list-token-load">
        <div className="select-load-token-title">
          <h2 style={{ padding: "10px" }}>
            Select or Load Token you want to Disperse
          </h2>
        </div>
        <select
          id="border-blue"
          className="custom-select"
          name="tokenSymbol"
          value={selectedtoken}
          onChange={(e) => {
            setselectedtoken(e.target.value);
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
        {selectedtoken && (
          <div>
            <div
              className={`user-form-for-list ${
                errorModalIsOpen ? "blurred-background" : ""
              }`}
            >
              <div className="enter-address-div-title">
                <h2>Enter the Recipient Address and Token Amount </h2>
              </div>
              <input
                id="border-blue"
                className="each-input-of-create-list"
                type="text"
                name="receiverAddress"
                value={formData.receiverAddress}
                placeholder="Enter Receiver Address   "
                onChange={handleInputChange}
              />
              <input
                id="border-blue"
                className="each-input-of-create-list"
                type="number"
                name="tokenAmount"
                value={formData.tokenAmount}
                placeholder="Enter Token Amount"
                onChange={handleInputChange}
              />

              <select
                id="border-blue"
                className="each-input-of-create-list"
                name="chainName"
                value={formData.chainName}
                onChange={handleInputChange}
              >
                <option value="" disabled selected>
                  Select Chain
                </option>
                <option id="white-color" value="Polygon">
                  Polygon
                </option>
                <option id="white-color" value="ethereum-2">
                  Ethereum
                </option>
                <option id="white-color" value="Avalanche">
                  Avalanche
                </option>
                <option id="white-color" value="Moonbeam">
                  Moonbeam
                </option>
                <option id="white-color" value="arbitrum">
                  Arbitrum
                </option>
              </select>
              <button
                className="button-to-add-form-data"
                onClick={handleAddClick}
              >
                Add to List
              </button>
            </div>
            {listData.length > 0 && (
              <div>
                <div className="div-to-add-the-tx">
                  {/* {listData.length > 0 ? ( */}
                  <div>
                    <div className="view-address-div-title">
                      <h2>Your Transact0ion Lineup</h2>
                    </div>
                    <br></br>
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
                  </div>
                  {/* // ) : (  */}
                  {/* //   <h3>Your Transactions list will be listed here!!</h3> */}
                  {/* )} */}
                </div>
                {/* {listData.length > 0 && isSendingEth ? ( */}
                <div>
                  <div className="account-summary-create-title">
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
                          {total
                            ? `${ethers.utils.formatEther(total)}  ETH`
                            : null}
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
                {/* ) : null} */}

                {isTokenLoaded ? (
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
            )}
          </div>
        )}
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
      <div className="steps-to-get-ausdc">
        <button>
          <a href="/Getting%20aUSDC.pdf" target="_blank">
            Steps to Get aUSDC
          </a>
        </button>
      </div>
    </div>
  );
}

export default Createlist;
