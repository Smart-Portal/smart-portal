import React, { useState, useEffect } from "react";
import "../../../Styles/dashboard/createlist.css";
import { crossSendInstance } from "../../../Helpers/ContractInstance";
import { getTokenBalance } from "../../../Helpers/TokenBalance";
import { approveToken } from "../../../Helpers/ApproveToken";
import tokensContractAddress from "../../../Helpers/GetTokenContractAddress.json";
import DecimalValue from "../../../Helpers/DecimalValue.json";
import ERC20 from "../../../../src/artifacts/contracts/ERC20.sol/ERC20.json";

import Modal from "react-modal";
import { ethers } from "ethers";
import { useAccount } from "wagmi";

function SameCreateList() {
  const { address } = useAccount();
  const [listData, setListData] = useState([]);
  const [errorModalIsOpen, setErrorModalIsOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [alertMessage, setAlertMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [customTokenAddress, setCustomTokenAddress] = useState("");
  const [total, setTotal] = useState(null);
  const [remaining, setRemaining] = useState(null);
  const [ethBalance, setEthBalance] = useState(null);
  const [isSendingEth, setIsSendingEth] = useState(false);
  const [isTokenLoaded, setTokenLoaded] = useState(false);
  const [blockExplorerURL, setBlockExplorerURL] = useState("");
  const [createlist, setcreatelist] = useState();

  const [formData, setFormData] = useState({
    receiverAddress: "",
    tokenAmount: "",
    chainName: "Scroll",
  });
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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  //validating Address and amount entered
  const isValidAddress = (address) => ethers.utils.isAddress(address);

  const isValidValue = (value) => {
    console.log(value);
    if (isTokenLoaded) {
      try {
        console.log(ethers.utils.parseUnits(value, tokenDetails.decimal));
        return ethers.utils.parseUnits(value, tokenDetails.decimal);
      } catch (err) {
        return false;
      }
    } else {
      try {
        if (ethers.utils.parseUnits(value, "ether") <= 0) {
          return false;
        }
        console.log(ethers.utils.parseUnits(value, "ether"));
        return ethers.utils.parseUnits(value, "ether");
      } catch (err) {
        return false;
      }
    }
  };

  const validateFormData = async () => {
    var address = formData.receiverAddress;
    var amount = formData.tokenAmount;
    if (!/^\d/.test(amount)) {
      amount = amount.slice(1);
    }
    console.log(isValidValue(amount));
    console.log(isValidAddress(address));
    if (!isValidValue(amount) && !isValidAddress(address)) {
      setErrorMessage("Incorrect details");
      setErrorModalIsOpen(true);
      return false;
    }

    if (!isValidValue(amount)) {
      setErrorMessage("Invalid token Value");
      setErrorModalIsOpen(true);
      return false;
    }
    if (!isValidAddress(address)) {
      setErrorMessage("Invalid recipient Address");
      setErrorModalIsOpen(true);
      return false;
    }
    var amountnew = isValidValue(amount);
    formData.tokenAmount = amountnew;
    return true;
  };

  const handleAddClick = async () => {
    const isvalid = await validateFormData();

    if (isvalid) {
      setListData([...listData, formData]);
      setFormData({
        receiverAddress: "",
        tokenAmount: "",
        chainName: formData.chainName,
      });
    }
  };

  const handleDeleteRow = (index) => {
    const updatedList = [...listData];
    updatedList.splice(index, 1);
    setListData(updatedList);
  };

  // Main function to do the Contract Call
  const executeTransaction = async () => {
    console.log(listData);
    setLoading(true);

    if (isSendingEth) {
      const { ethereum } = window;

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
          values.push(listData[i]["tokenAmount"]);
        }

        try {
          const con = await crossSendInstance();
          console.log(recipients, values, total);

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
      var recipients = [];
      var values = [];

      for (let i = 0; i < listData.length; i++) {
        recipients.push(listData[i]["receiverAddress"]);
        values.push(listData[i]["value"]);
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
      let newTotal = listData[0].tokenAmount;
      for (let i = 1; i < listData.length; i++) {
        newTotal = newTotal.add(listData[i].tokenAmount);
        console.log(listData[i].tokenAmount);
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
        console.log(remaining);
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
      {/* <p>1. Select Tokens to disperse</p> */}
      <div className="div-in-same-create-list-token-load">
        <div className="enter-address-div-title">
          <h2 style={{ padding: "10px" }}>
            Enter the Recipient Address and Token Amount{" "}
          </h2>
        </div>
        <input
          id="blue-div"
          className="each-input-of-create-list"
          type="text"
          name="receiverAddress"
          value={formData.receiverAddress}
          placeholder="Enter Receiver Address"
          onChange={handleInputChange}
        />
        <input
          id="blue-div"
          className="each-input-of-create-list"
          type="number"
          name="tokenAmount"
          value={formData.tokenAmount}
          placeholder="Enter Token Amount"
          onChange={handleInputChange}
        />

        <input
          id="blue-div"
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
      <div className="select-load-token-title">
        <h2 style={{ padding: "10px" }}>
          Select or Load Token you want to Disperse
        </h2>
      </div>
      {isTokenLoaded ? null : (
        <button
          className="button-to-add-form-data"
          onClick={() => {
            getEthBalance();
          }}
        >
          Send Eth
        </button>
      )}

      {isTokenLoaded ? null : "  "}
      <input
        id="blue-div"
        type="text"
        className="each-input-of-create-list"
        placeholder="Enter token Address"
        value={customTokenAddress}
        onChange={(e) => setCustomTokenAddress(e.target.value)}
      />
      {isTokenLoaded ? (
        <button
          className="button-to-add-form-data-unload"
          onClick={() => {
            unloadToken();
          }}
        >
          Unload Token
        </button>
      ) : (
        <button
          className="button-to-add-form-data"
          onClick={() => {
            loadToken();
          }}
        >
          Load Token
        </button>
      )}

      {/* <div
        className={`user-form-for-list ${
          errorModalIsOpen ? "blurred-background" : ""
        }`}
      > */}
      {listData.length > 0 && isSendingEth ? (
        <div>
          <div className="account-summary-create-title">
            <h2 style={{ padding: "10px" }}>Account Summary</h2>
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

      {/* <div className="div-to-add-the-tx"> */}
      {listData.length > 0 ? (
        <div>
          <div className="view-address-div-title">
            <h2 style={{ padding: "10px" }}>Your Transaction Lineup</h2>
          </div>
          <div className="scrollable-table-container">
            <table>
              <thead>
                <tr>
                  <th>Receiver Address</th>
                  <th>Token Amount</th>
                  <th>Token Symbol</th>
                  <th>Chain Name</th>
                  <th>Delete</th>
                </tr>
              </thead>
              <tbody>
                {listData.map((data, index) => (
                  <tr key={index}>
                    <td>{data.receiverAddress}</td>
                    <td>
                      {isTokenLoaded
                        ? ethers.utils.formatUnits(
                            data.tokenAmount,
                            tokenDetails.decimal
                          )
                        : ethers.utils.formatEther(data.tokenAmount)}
                    </td>
                    <td>{isTokenLoaded ? tokenDetails.symbol : "ETH"}</td>
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
          <div>
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
        </div>
      ) : null}
      {/* </div> */}
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
      {/* </div> */}
    </div>
  );
}

export default SameCreateList;
