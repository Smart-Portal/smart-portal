import React, { useState, useEffect } from "react";
import { crossSendInstance } from "../../../Helpers/ContractInstance";
import { getTokenBalance } from "../../../Helpers/TokenBalance";
import { approveToken } from "../../../Helpers/ApproveToken";
import tokensContractAddress from "../../../Helpers/GetTokenContractAddress.json";
import DecimalValue from "../../../Helpers/DecimalValue.json";
import ERC20 from "../../../../src/artifacts/contracts/ERC20.sol/ERC20.json";
import "../../../Styles/dashboard/textlist.css";

import Modal from "react-modal";
import { ethers } from "ethers";
import { useAccount } from "wagmi";

function SameTextlist() {
  const [inputText, setInputText] = useState("");
  const [textValue, setTextValue] = useState("");
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
    if (isTokenLoaded) {
      try {
        console.log(ethers.utils.parseUnits(value, tokenDetails.decimal));
        return ethers.utils.parseUnits(value, tokenDetails.decimal);
      } catch (err) {
        return false;
      }
    } else {
      try {
        console.log(ethers.utils.parseUnits(value, "ether"));

        if (!/^\d/.test(value)) {
          value = value.slice(1);
        }
        return ethers.utils.parseUnits(value, "ether");
      } catch (err) {
        return false;
      }
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

    lines.map((line) => {
      if (
        line.includes(" ") ||
        line.includes(",") ||
        line.includes("=") ||
        line.includes("\t")
      ) {
        const [address, value] = line.split(/[,= \t]+/);
        const validValue = isValidValue(value);
        if (isValidAddress(address) && validValue) {
          updatedRecipients.push({
            address,
            value: validValue,
          });
        }
      }
    });
    setListData(updatedRecipients);
    console.log(updatedRecipients);

    return;
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
  }, [textValue]);

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
  }, [listData]);

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
      <div className="div-to-cover-same-text-div">
        <div>
          <div className="text-list-div">
            <div className="title-same-text-textarea">
              <h2 style={{ padding: "20px", fontSize: "15px", margin: "0px" }}>
                Enter Recipients and Amount (enter one address and amount in ETH
                on each line, supports any format)
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
                  borderRadius: "5px",
                  border: "none",
                  background: "#e6e6fa",
                  color: "black",
                  fontSize: "16px",
                  fontFamily: "Arial, sans-serif",
                  boxSizing: "border-box",
                  resize: "vertical",
                }}
                placeholder=" 0xe57f4c84539a6414C4Cf48f135210e01c477EFE0=1.41421
              0xe57f4c84539a6414C4Cf48f135210e01c477EFE0 1.41421
              0xe57f4c84539a6414C4Cf48f135210e01c477EFE0,1.41421"
              ></textarea>
            </div>
          </div>
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
        <div className="title-load-token-same-text">
          <h2 style={{ padding: "10px" }}>
            Select or Load Token you want to Disperse
          </h2>
        </div>
        <div style={{padding:"20px"}}>
        {isTokenLoaded ? null : (
          <button
            id="background-green"
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
          id="border-green"
          type="text"
          className="each-input-of-create-list token-input"
          placeholder="Enter token Address"
          value={customTokenAddress}
          onChange={(e) => setCustomTokenAddress(e.target.value)}
          style={{borderRadius: "175px",
            border:" 1px solid #fff",
            background:" linear-gradient(90deg, rgba(97, 38, 193, 0.58) 0.06%, rgba(63, 47, 110, 0.58) 98.57%)",
            padding:"10px 20px",
            margin:"0px 20px",
          }}
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
            id="background-green"
            className="button-to-add-form-data"
            onClick={() => {
              loadToken();
            }}
          >
            Load Token
          </button>
        )}
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

        {listData.length > 0 && isSendingEth ? (
          <div>
            {isTokenLoaded || isSendingEth ? (
              <div className="table-container">
                <div className="title-for-linup-same-text">
                  <h2 style={{ padding: "10px" }}>Your Transaction Lineup</h2>
                </div>
                <table className="table-text-list">
                  <thead className="table-header-text-list">
                    <tr>
                      <th>Wallet Address</th>
                      <th>Amount</th>
                    </tr>
                  </thead>
                  <div style={{borderBottom:"1px solid white", width:"190%",margin:"0px 20px"}}></div>
                  <tbody>
                  
                    {listData.length > 0
                      ? listData.map((data, index) => (
                          <tr key={index}>
                            <td>{data.address}</td>
                            <td>
                              <div style={{width:"100px",margin:"0 auto", background:"linear-gradient(269deg, #0FF 2.32%, #1BFF76 98.21%)",color:"black",borderRadius:"30px",padding:"5px 10px"}}>
                                 {isTokenLoaded
                                ? `${ethers.utils.formatUnits(
                                    data.value,
                                    tokenDetails.decimal
                                  )} ${tokenDetails.symbol}`
                                : `${ethers.utils.formatEther(data.value)} ETH`}</div>
                             
                            </td>
                          </tr>
                        ))
                      : null}
                  </tbody>
                </table>
              </div>
            ) : null}
          </div>
        ) : null}

        {listData.length > 0 && isSendingEth ? (
          <div>
            <br />
            <br />
            <br />
            <div className="title-for-account-summary-text-same">
              <h2 style={{ padding: "10px" }}>Account Summary</h2>
            </div>
            <table className="showtoken-table-same-text">
              <thead>
                <tr style={{width:"100%",margin:"0 auto"}}>
                  <th ><div style={{width:"30%"}}>Total Amount</div></th>
                  <th style={{width:"30%"}}>Your Balance</th>
                  <th style={{width:"30%"}}>Remaining Balance</th>
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
        <div>
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

          <div style={{margin:"30px 0px"}}>
            {listData.length > 0 ? (
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
