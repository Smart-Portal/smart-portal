import React, { useState, useEffect } from "react";
import { crossSendInstance } from "../../../Helpers/ContractInstance";
import { getTokenBalance } from "../../../Helpers/TokenBalance";
import { approveToken } from "../../../Helpers/ApproveToken";
import tokensContractAddress from "../../../Helpers/GetTokenContractAddress.json";
import DecimalValue from "../../../Helpers/DecimalValue.json";
import ERC20 from "../../../../src/artifacts/contracts/ERC20.sol/ERC20.json";
import "../../../Styles/dashboard/textlist.css";
import { useTheme } from "../../../ThemeProvider";

import Modal from "react-modal";
import { ethers } from "ethers";
import { useAccount } from "wagmi";

const useLocalStorage = (key, initialValue = "") => {
  // State to track the input value
  const [value, setValue] = useState(() => {
    const storedValue = localStorage.getItem(key);
    return storedValue !== null ? storedValue : initialValue;
  });

  // Effect to save the input value to local storage whenever it changes
  useEffect(() => {
    localStorage.setItem(key, value);
  }, [key, value]);

  return [value, setValue];
};

function SameTextlist() {
  const { toggleDarkMode, themeClass } = useTheme();
  const [inputText, setInputText] = useState("");
  // const [textValue, setTextValue] = useState("");
  const [walletList, setWalletList] = useState([]);
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
  const [recipientAddress, setRecipientAddress] = useState("");
  const [isInputValid, setIsInputValid] = useState(false);
  const [blockExplorerURL, setBlockExplorerURL] = useState("");
  const [showTokenSections, setShowTokenSections] = useState(false);
  // const [customTokenAddress, setCustomTokenAddress] = useLocalStorage(
  //   "customTokenAddress",
  //   ""
  // );
  const [textValue, setTextValue] = useLocalStorage("textValue", "");

  const defaultTokenDetails = {
    name: null,
    symbol: null,
    balance: null,
    decimal: null,
  };
  const [tokenDetails, setTokenDetails] = useState(defaultTokenDetails);
  const [formData, setFormData] = useState();

  const isValidAddress = (address) => ethers.utils.isAddress(address);
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

  const isValidValue = (value) => {
    console.log(value);

    try {
      if (value.includes("$")) {
        // Remove the dollar sign before parsing as USD
        value = value.replace("$", "");
        console.log(`${value} USD`);
        return parseFloat(value);
      } else {
        console.log(ethers.utils.parseUnits(value, "ether"));

        if (!/^\d/.test(value)) {
          value = value.slice(1);
        }
        return ethers.utils.parseUnits(value, "ether");
      }
    } catch (err) {
      return false;
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
      setLoading(false);

      return false;
    } else {
      return true;
    }
  };
  const parseText = async (textValue) => {
    const lines = textValue.split("\n");
    let updatedRecipients = [];

    lines.forEach((line) => {
      const [address, value] = line.split(/[,= \t]+/);
      const validValue = isValidValue(value);

      if (isValidAddress(address) && validValue) {
        const isUsdAmount = /\$$/.test(value.trim());
        updatedRecipients.push({
          address,
          value: ethers.BigNumber.from(validValue),
          isUsdAmount,
        });
      }
    });

    setListData(updatedRecipients);
    console.log(updatedRecipients);
    return;
  };

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
          recipients.push(listData[i]["address"]);
          values.push(listData[i]["value"]);
        }
        console.log(recipients, values, total);
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
        recipients.push(listData[i]["address"]);
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
    setFormData(parseText(textValue));
    getExplorer();
  }, [textValue, isTokenLoaded]);

  useEffect(() => {
    if (listData.length > 0) {
      let newTotal = listData[0].value;
      console.log(listData);
      for (let i = 1; i < listData.length; i++) {
        console.log(listData[i].value);
        newTotal = newTotal.add(listData[i].value);
        console.log(listData[i].value);
      }
      setTotal(newTotal);
    } else {
      setTotal(null);
    }
  }, [listData, isTokenLoaded]);

  useEffect(() => {
    const isValidRecipient = isValidAddress(recipientAddress);
    const isValidToken = isValidAddress(customTokenAddress);

    setIsInputValid(isValidRecipient && isValidToken);
  }, [recipientAddress, customTokenAddress]);

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
  }, [isTokenLoaded, isSendingEth, total]);

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

  const [ethToUsdExchangeRate, setEthToUsdExchangeRate] = useState(null);
  const [usdTotal, setUsdTotal] = useState(null);

  useEffect(() => {
    const fetchExchangeRate = async () => {
      try {
        const response = await fetch(
          "https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd"
        );
        const data = await response.json();
        const rate = data.ethereum.usd;
        console.log("data here", data);
        setEthToUsdExchangeRate(rate);
        if (total) {
          console.log(data);
          const totalInUsd = ethers.utils.formatEther(total) * rate;
          setUsdTotal(totalInUsd);
        }
        console.log("tk details here", tokenDetails.decimal);
      } catch (error) {
        console.error("Error fetching exchange rate:", error);
      }
    };
    fetchExchangeRate();
  }, [total]);

  // useEffect(() => {
  //   const savedTokenAddress = localStorage.getItem("customTokenAddress");
  //   if (savedTokenAddress) {
  //     setCustomTokenAddress(savedTokenAddress);
  //   }
  // }, []);

  // // Save the custom token address to local storage whenever it changes
  // useEffect(() => {
  //   localStorage.setItem("customTokenAddress", customTokenAddress);
  // }, [customTokenAddress]);
  const handleImporttokenbuttonClick = () => {
    setIsSendingEth(false);
    setShowTokenSections(!showTokenSections);
  };
  const handleSendEthbuttonClick = () => {
    console.log("send eth button click");
    setTokenLoaded(false);
    getEthBalance();
    setShowTokenSections(false);
  };
  return (
    <div>
      <div className={`div-to-cover-same-text-div ${themeClass}`}>
        <div className="div-for-whole-token">
          <div className="title-load-token-same-text">
            <h2
              style={{
                padding: "10px",
                letterSpacing: "1px",
                fontSize: "15px",
                margin: "0px",
              }}
            >
              Select or Load Token you want to Disperse
            </h2>
          </div>
          <div
            style={{
              padding: "30px 20px",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
            className="sametext-main"
          >
            {isTokenLoaded ? null : (
              <div>
                <button
                  id=""
                  className="button-to-add-form-data"
                  onClick={handleSendEthbuttonClick}
                >
                  Send Eth
                </button>
              </div>
            )}
            <div>
              {isTokenLoaded ? null : " OR "}

              <button
                className="button-to-add-form-data-unload"
                onClick={handleImporttokenbuttonClick}
              >
                Import Token
              </button>
            </div>
          </div>
          {showTokenSections && (
            <div>
              <div
                style={{
                  marginBottom: "10px ",
                }}
                className="account-summary-create-title"
              >
                <h2
                  style={{
                    padding: "10px",
                    fontSize: "15px",
                    margin: "0px",
                    letterSpacing: "1px",
                  }}
                >
                  Load Your Token
                </h2>
              </div>
              {isTokenLoaded ? null : " "}
              <div style={{ padding: "20px" }}>
                <label style={{ margin: "5px" }}>Enter Token Address: </label>
                <input
                  id="input-token-load"
                  // id="border-green"
                  type="text"
                  className={`each-input-of-create-list token-input ${themeClass}`}
                  placeholder="Enter token Address"
                  value={customTokenAddress}
                  onChange={(e) => setCustomTokenAddress(e.target.value)}
                  style={{
                    borderRadius: "5px",
                    border: " 1px solid #fff",
                    background:
                      " linear-gradient(90deg, rgba(97, 38, 193, 0.58) 0.06%, rgba(63, 47, 110, 0.58) 98.57%)",
                    padding: "10px 20px",
                    margin: "0px 20px",
                  }}
                />
                {isTokenLoaded ? (
                  <button
                    id="background-green"
                    className={`button-t-add-form-data-unload ${themeClass}`}
                    onClick={() => {
                      unloadToken();
                    }}
                  >
                    Unload Token
                  </button>
                ) : (
                  <button
                    id="background-green"
                    className="button-to-add-form-data"
                    onTouchStart={() => {
                      loadToken();
                    }}
                    onClick={() => {
                      loadToken();
                    }}
                  >
                    Load Token
                  </button>
                )}
              </div>
            </div>
          )}

          {isTokenLoaded ? (
            <div>
              <div className="account-summary-create-title">
                <h2
                  style={{
                    padding: "10px",
                    fontSize: "15px",
                    margin: "0px",
                    letterSpacing: "1px",
                  }}
                >
                  Token Details
                </h2>
              </div>
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
                <table className=" table-text-list">
                  <thead className="table-header-text-list">
                    <tr>
                      <th style={{ letterSpacing: "1px" }}>Name</th>
                      <th style={{ letterSpacing: "1px" }}>Symbol</th>
                      <th style={{ letterSpacing: "1px" }}>Balance</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td style={{ letterSpacing: "1px" }}>
                        {tokenDetails.name}
                      </td>
                      <td style={{ letterSpacing: "1px" }}>
                        {tokenDetails.symbol}
                      </td>
                      <td>{tokenDetails.balance}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          ) : null}
        </div>

        {(isSendingEth || isTokenLoaded) && (
          <div>
            <div className="text-list-div">
              <div className="title-same-text-textarea">
                <h2
                  style={{
                    padding: "10px",
                    fontSize: "15px",
                    margin: "0px",
                    letterSpacing: "1px",
                  }}
                >
                  Enter Recipients and Amount (enter one address and amount on
                  each line, supports any format)
                </h2>
              </div>
              <div>
                <textarea
                  spellCheck="false"
                  value={textValue}
                  onChange={(e) => setTextValue(e.target.value)}
                  style={{
                    width: "100%",
                    minHeight: "100px",
                    padding: "10px",
                    border: "none",
                    background: "#e6e6fa",
                    color: "black",
                    fontSize: "16px",
                    fontFamily: "Arial, sans-serif",
                    boxSizing: "border-box",
                    resize: "vertical",
                  }}
                  placeholder="0xe57f4c84539a6414C4Cf48f135210e01c477EFE0=1.41421"
                ></textarea>
              </div>
            </div>
          </div>
        )}

        {listData.length > 0 && (isSendingEth || isTokenLoaded) ? (
          // {listData.length > 0 && isSendingEth ? (
          <div>
            <div className="table-container">
              <div
                className="title-for-linup-same-text"
                style={{ padding: "5px 0px" }}
              >
                <h2 style={{ padding: "10px", letterSpacing: "1px" }}>
                  Your Transaction Lineup
                </h2>
              </div>
              <div className="scrollable-table-container">
                <table
                  className="table-text-list"
                  style={{ padding: "30px 20px" }}
                >
                  <thead className="table-header-text-list">
                    <tr>
                      <th
                        className="font-size-12px"
                        style={{ letterSpacing: "1px" }}
                      >
                        Wallet Address
                      </th>
                      <th
                        className="font-size-12px"
                        style={{ letterSpacing: "1px" }}
                      >
                        Amount(ETH)
                      </th>
                      <th
                        className="font-size-12px"
                        style={{ letterSpacing: "1px" }}
                      >
                        Amount(USD)
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {(listData.length > 0) &
                    (typeof ethToUsdExchangeRate === "number")
                      ? listData.map((data, index) => (
                          <tr key={index}>
                            <td
                              id="font-size-10px"
                              style={{ letterSpacing: "1px" }}
                            >
                              {data.address}
                            </td>
                            <td
                              id="font-size-10px"
                              className={`showtoken-remaining-balance ${
                                remaining < 0
                                  ? "showtoken-remaining-negative"
                                  : ""
                              }`}
                            >
                              <div
                                id="font-size-10px"
                                // className="font-size-12px"
                                style={{
                                  width: "fit-content",
                                  margin: "0 auto",
                                  background:
                                    "linear-gradient(269deg, #0FF 2.32%, #1BFF76 98.21%)",
                                  color: "black",
                                  borderRadius: "10px",
                                  padding: "10px 10px",
                                  fontSize: "12px",
                                  letterSpacing: "1px",
                                }}
                              >
                                {isTokenLoaded || data.isUsdAmount
                                  ? data.isUsdAmount
                                    ? `${(
                                        data.value / ethToUsdExchangeRate
                                      ).toFixed(9)} ETH`
                                    : `${(+ethers.utils.formatUnits(
                                        data.value,
                                        tokenDetails.decimal
                                      )).toFixed(9)} ${tokenDetails.symbol}`
                                  : `${(+ethers.utils.formatEther(
                                      data.value
                                    )).toFixed(9)} ETH`}
                              </div>
                            </td>
                            <td
                              id="font-size-10px"
                              className={`showtoken-remaining-balance ${
                                remaining < 0
                                  ? "showtoken-remaining-negative"
                                  : ""
                              }`}
                            >
                              <div
                                id="font-size-10px"
                                // className="font-size-12px"
                                style={{
                                  width: "fit-content",
                                  margin: "0 auto",
                                  background:
                                    "linear-gradient(269deg, #0FF 2.32%, #1BFF76 98.21%)",
                                  color: "black",
                                  borderRadius: "10px",
                                  padding: "10px 10px",
                                  fontSize: "12px",
                                  letterSpacing: "1px",
                                }}
                              >
                                {data.isUsdAmount
                                  ? `${(+data.value).toFixed(2)} $`
                                  : `${(
                                      +ethers.utils.formatUnits(
                                        data.value,
                                        tokenDetails.decimal
                                      ) * ethToUsdExchangeRate
                                    ).toFixed(2)} $`}
                              </div>
                            </td>
                          </tr>
                        ))
                      : null}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        ) : null}

        {listData.length > 0 && isSendingEth ? (
          <div style={{ padding: "30px 0px" }}>
            <div className="title-for-account-summary-text-same">
              <h2 style={{ padding: "10px", letterSpacing: "1px" }}>
                Account Summary
              </h2>
            </div>
            <div id="table-responsive">
              <table className="showtoken-table-same-text table-text-list">
                <thead className="table-header-text-list">
                  <tr style={{ width: "100%", margin: "0 auto" }}>
                    <th className="account-summary-th">Total Amount(ETH)</th>
                    <th className="account-summary-th">Total Amount(USD)</th>
                    <th className="account-summary-th">Your Balance</th>
                    <th className="account-summary-th">Remaining Balance</th>
                  </tr>
                </thead>

                <tbody>
                  <tr>
                    <td id="font-size-10px">
                      {" "}
                      <div
                        id="font-size-10px"
                        // className="font-size-12px"
                        style={{
                          width: "fit-content",
                          margin: "0 auto",
                          background:
                            "linear-gradient(269deg, #0FF 2.32%, #1BFF76 98.21%)",
                          color: "black",
                          borderRadius: "10px",
                          padding: "10px 10px",
                          fontSize: "12px",
                          letterSpacing: "1px",
                        }}
                      >
                        {total && ethToUsdExchangeRate && (
                          <div id="font-size-10px">
                            {`${(+ethers.utils.formatEther(total)).toFixed(
                              9
                            )} ETH `}
                            {/* <span style={{ color: "red", fontWeight: "500" }}>
                              {`( ${
                                usdTotal
                                  ? usdTotal.toFixed(2)
                                  : "Calculating..."
                              } USD )`}
                            </span> */}
                          </div>
                        )}{" "}
                      </div>
                    </td>{" "}
                    <td id="font-size-10px">
                      {" "}
                      <div
                        id="font-size-10px"
                        // className="font-size-12px"
                        style={{
                          width: "fit-content",
                          margin: "0 auto",
                          background:
                            "linear-gradient(269deg, #0FF 2.32%, #1BFF76 98.21%)",
                          color: "black",
                          borderRadius: "10px",
                          padding: "10px 10px",
                          fontSize: "12px",
                          letterSpacing: "1px",
                        }}
                      >
                        {total && ethToUsdExchangeRate && (
                          <div id="font-size-10px">
                            {/* {`${ethers.utils.formatEther(total)} ETH `} */}
                            <span
                              id="font-size-10px"
                              style={{ fontWeight: "500" }}
                            >
                              {` ${
                                usdTotal
                                  ? usdTotal.toFixed(2)
                                  : "Calculating..."
                              } $ `}
                            </span>
                          </div>
                        )}{" "}
                      </div>
                    </td>{" "}
                    <td id="font-size-10px">
                      <div
                        id="font-size-10px"
                        style={{
                          width: "fit-content",
                          margin: "0 auto",
                          color: "white",

                          borderRadius: "10px",

                          // fontSize: "17px",
                          // fontWeight: "700",
                          letterSpacing: "1px",
                        }}
                      >
                        {/* {`${ethBalance} ETH`}{" "} */}
                        {`${(+ethBalance).toFixed(9)} ETH `}
                      </div>
                    </td>
                    <td
                      id="font-size-10px"
                      className={`showtoken-remaining-balance ${
                        remaining < 0 ? "showtoken-remaining-negative" : ""
                      }`}
                    >
                      <div
                        id="font-size-10px"
                        // className="font-size-12px"
                        style={{
                          width: "fit-content",
                          margin: "0 auto",
                          background:
                            remaining < 0
                              ? "red"
                              : "linear-gradient(269deg, #0FF 2.32%, #1BFF76 98.21%)",
                          color: remaining < 0 ? "white" : "black",
                          borderRadius: "10px",
                          padding: "10px 10px",
                          fontSize: "12px",
                        }}
                      >
                        {remaining === null
                          ? null
                          : `${(+remaining).toFixed(9)} ETH`}{" "}
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        ) : null}
        <div>
          {listData.length > 0 && isTokenLoaded ? (
            <div>
              <div className="account-summary-create-title">
                <h2
                  style={{
                    padding: "10px",
                    fontSize: "15px",
                    margin: "0px",
                    letterSpacing: "1px",
                  }}
                >
                  Account Summary
                </h2>
              </div>
              <div id="table-responsive">
                <table className="showtoken-table  table-text-list">
                  <thead className="table-header-text-list">
                    <tr>
                      <th style={{ letterSpacing: "1px" }}>
                        Total Amount(ETH)
                      </th>
                      <th style={{ letterSpacing: "1px" }}>
                        Total Amount(USD)
                      </th>
                      <th style={{ letterSpacing: "1px" }}>
                        Remaining Balance
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td id="font-size-10px" style={{ letterSpacing: "1px" }}>
                        {total && ethToUsdExchangeRate && (
                          <>
                            <div
                              // className="font-size-12px"
                              style={{
                                width: "fit-content",
                                margin: "0 auto",
                                background:
                                  "linear-gradient(269deg, #0FF 2.32%, #1BFF76 98.21%)",
                                color: "black",
                                borderRadius: "10px",
                                padding: "10px 10px",
                                fontSize: "12px",
                                letterSpacing: "1px",
                              }}
                            >
                              {`${(+ethers.utils.formatEther(total)).toFixed(
                                9
                              )} ETH `}
                            </div>

                            {/* <span style={{ color: "red", fontWeight: "500" }}>
                              {`( ${
                                usdTotal
                                  ? usdTotal.toFixed(2)
                                  : "Calculating..."
                              } USD )`}
                            </span> */}
                          </>
                        )}
                      </td>
                      <td id="font-size-10px" style={{ letterSpacing: "1px" }}>
                        {total && ethToUsdExchangeRate && (
                          <>
                            {/* {`${ethers.utils.formatEther(total)} ETH `} */}
                            <div
                              className="font-size-12px"
                              style={{
                                width: "fit-content",
                                margin: "0 auto",
                                background:
                                  "linear-gradient(269deg, #0FF 2.32%, #1BFF76 98.21%)",
                                color: "black",
                                borderRadius: "10px",
                                padding: "10px 10px",
                                fontSize: "12px",
                                letterSpacing: "1px",
                              }}
                            >
                              {` ${
                                usdTotal
                                  ? usdTotal.toFixed(2)
                                  : "Calculating..."
                              } $ `}
                            </div>
                          </>
                        )}
                      </td>

                      <td
                        id="font-size-10px"
                        className={`showtoken-remaining-balance ${
                          remaining < 0 ? "showtoken-remaining-negative" : ""
                        }`}
                        style={{ letterSpacing: "1px" }}
                      >
                        <div
                          className="font-size-12px"
                          style={{
                            width: "fit-content",
                            margin: "0 auto",
                            background:
                              remaining < 0
                                ? "red"
                                : "linear-gradient(269deg, #0FF 2.32%, #1BFF76 98.21%)",
                            color: remaining < 0 ? "white" : "black",
                            padding: "10px 10px",
                            borderRadius: "10px",
                            fontSize: "12px",
                            letterSpacing: "1px",
                          }}
                        >
                          {remaining === null
                            ? null
                            : `${(+remaining).toFixed(9)} ${
                                tokenDetails.symbol
                              }`}
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          ) : null}

          <div>
            {/* {listData.length > 0 ? ( */}
            {listData.length > 0 && (isSendingEth || isTokenLoaded) ? (
              <button
                id="green-background"
                className="send-button"
                onClick={() => {
                  executeTransaction();
                }}
                disabled={loading}
              >
                {loading ? <div className="loader"></div> : "Begin Payment"}
              </button>
            ) : null}
          </div>
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

export default SameTextlist;
