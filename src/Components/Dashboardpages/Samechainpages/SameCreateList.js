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
import { type } from "@testing-library/user-event/dist/type";

function SameCreateList() {
  const { address } = useAccount();
  const [listData, setListData] = useState([]);
  const [tokenSymbolFinal, setTokenSymbol] = useState("ETH");
  const [errorModalIsOpen, setErrorModalIsOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [alertMessage, setAlertMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [customTokenAddress, setCustomTokenAddress] = useState("");
  const [total, setTotal] = useState(null);
  const [remaining, setRemaining] = useState(null);
  const [ethBalance, setEthBalance] = useState(null);

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
  const [isTokenLoaded, setTokenLoaded] = useState(false);

  const loadToken = async () => {
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
          const balance = await erc20.balanceOf(customTokenAddress);
          const decimals = await erc20.decimals();
          setTokenDetails({
            name,
            symbol,
            balance: ethers.utils.formatEther(balance),
            decimal: decimals,
          });
          setTokenLoaded(true);
          console.log(tokenDetails);
          setTokenSymbol(symbol);
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
    setTokenLoaded(false);
    setTokenSymbol("ETH");
  };

  const getEthBalance = async () => {
    const { ethereum } = window;
    if (!ethBalance) {
      const provider = new ethers.providers.Web3Provider(ethereum);
      let ethBalance = await provider.getBalance(address);
      ethBalance = ethers.utils.formatEther(ethBalance);
      setEthBalance(ethBalance);
    }
  };

  const tokenBalance = async (totalTokenAmount) => {
    const balance = await getTokenBalance(address, customTokenAddress);
    const decimal = isTokenLoaded
      ? tokenDetails.decimal
      : DecimalValue[tokenSymbolFinal];
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

  //validating Address and amount entered
  const isValidAddress = (address) => ethers.utils.isAddress(address);

  const isValidValue = (value) => {
    console.log(value);
    try {
      console.log(ethers.utils.parseUnits(value, "ether"));
      return ethers.utils.parseUnits(value, "ether");
    } catch (err) {
      return false;
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
    console.log(tokenSymbolFinal);
    if (tokenSymbolFinal === "ETH") {
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
          const txsendPayment = await con.disperseEther(recipients, values, {
            value: total,
          });

          const receipt = await txsendPayment.wait();
          setLoading(false);
          setErrorMessage(
            <div
              dangerouslySetInnerHTML={{
                __html: `Your Transaction was successful. Visit <a href="https://sepolia.scrollscan.dev/tx/${receipt.transactionHash}" target="_blank">here</a> for details.`,
              }}
            />
          );
          setErrorModalIsOpen(true);
          setListData([]);
          setSuccess(true);
          console.log("Transaction receipt:", receipt);
        } catch (error) {
          setLoading(false);
          setErrorMessage(
            `Transaction failed. ${error.message || "Please try again later."}`
          );
          setErrorModalIsOpen(true);
          setSuccess(false);
          console.error("Transaction failed:", error);
        }
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
        if (isTokenLoaded) {
          values.push(
            ethers.utils.parseUnits(etherAmount, tokenDetails.decimal)
          );
        } else {
          values.push(
            ethers.utils.parseUnits(etherAmount, DecimalValue[tokenSymbolFinal])
          );
        }
      }
      let userTokenBalance;
      console.log("first", totalAmount);
      userTokenBalance = await tokenBalance(totalAmount);
      if (userTokenBalance) {
        const { ethereum } = window;
        const provider = new ethers.providers.Web3Provider(ethereum);
        const isTokenApproved = await approveToken(
          totalAmount.toString(),
          isTokenLoaded
            ? customTokenAddress
            : tokensContractAddress[tokenSymbolFinal],
          DecimalValue[tokenSymbolFinal]
        );

        console.log(
          isTokenLoaded
            ? customTokenAddress
            : tokensContractAddress[tokenSymbolFinal],
          recipients,
          values
        );
        if (isTokenApproved) {
          const con = await crossSendInstance();
          const txsendPayment = await con.disperseToken(
            isTokenLoaded
              ? customTokenAddress
              : tokensContractAddress[tokenSymbolFinal],
            recipients,
            values
          );

          const receipt = await txsendPayment.wait();
          setLoading(false);
          setErrorMessage(
            <div
              dangerouslySetInnerHTML={{
                __html: `Your Transaction was successful. Visit <a href="https://sepolia.scrollscan.dev/tx/${receipt.transactionHash}" target="_blank">here</a> for details.`,
              }}
            />
          );
          setErrorModalIsOpen(true);
          setListData([]);
          setSuccess(true);
          console.log("Transaction receipt:", receipt);
        }
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
  }, [listData]);

  useEffect(() => {
    if (ethBalance && total) {
      const tokenBalance = ethers.utils.parseEther(ethBalance);
      const remaining = tokenBalance.sub(total);
      setRemaining(ethers.utils.formatEther(remaining));
    } else {
      setRemaining(null);
    }
  }, [total]);

  useEffect(() => {
    getEthBalance();
  }, []);

  return (
    <div>
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
        <button
          className="button-to-add-form-data-unload"
          onClick={() => {
            // Add logic to handle the custom token address
            // For example, you might add it to a list of selected tokens.
            unloadToken();
          }}
        >
          Unload Token
        </button>
      ) : (
        <button
          className="button-to-add-form-data"
          onClick={() => {
            // Add logic to handle the custom token address
            // For example, you might add it to a list of selected tokens.
            loadToken();
          }}
        >
          Load Token
        </button>
      )}
      <div>
        {!isTokenLoaded ? null : (
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
        )}
      </div>
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

      {/* Display total amount */}
      <table>
        <thead>
          <tr>
            <th>Total Amount</th>
            <th>Your Balance</th>
            <th>Remaining Balance</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>{total ? ethers.utils.formatEther(total) : ""}</td>
            <td>{ethBalance} </td>
            <td style={{ color: remaining < 0 ? "red" : "inherit" }}>
              {remaining}
            </td>
          </tr>
        </tbody>
      </table>

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
                      <td>{ethers.utils.formatEther(data.tokenAmount)}</td>
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
