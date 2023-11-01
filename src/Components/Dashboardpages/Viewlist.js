import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch } from "@fortawesome/free-solid-svg-icons";
import "../../Styles/dashboard/viewlist.css";
import { getSentTransaction } from "../../Helpers/GetSentTransactions";
import { decode } from "../../Helpers/DecodePayload";
import Modal from "react-modal";
import { useAccount, useSigner } from "wagmi";

function Viewlist() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [transactionDetails, setTransactionDetails] = useState([]);
  const [errorModalIsOpen, setErrorModalIsOpen] = useState(false);
  const [data, setData] = useState();
  const { address, isConnected } = useAccount();

  const handleSearch = () => {
    const filtered = transactionDetails.filter(
      (transaction) =>
        transaction.ChainName.toLowerCase().includes(
          searchQuery.toLowerCase()
        ) ||
        transaction.TokenSymbol.toLowerCase().includes(
          searchQuery.toLowerCase()
        )
    );
    setFilteredTransactions(filtered);
  };

  const handleInputChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleExpandClick = (receiverAddress, amounts) => {
    let data = [];
    for (let i = 0; i < receiverAddress.length; i++) {
      data[i] = {
        receiverAddress: receiverAddress[i],
        amount: parseInt(amounts[i] / 1000000),
      };
    }
    console.log(data);
    setData(data);
    setErrorModalIsOpen(true);
  };

  const fetchTransaction = async () => {
    const [allTransactions] = await Promise.all([getSentTransaction(address)]);
    console.log(allTransactions.data[0]["call"]["returnValues"]["payload"]);
    const details = [];

    for (let i = 0; i < allTransactions.data.length; i++) {
      const rec = await decode(
        allTransactions.data[i]["call"]["returnValues"]["payload"]
      );

      const totalSeconds = allTransactions.data[i]["time_spent"]["total"];

      const minutes = Math.floor(totalSeconds / 60);
      const seconds = totalSeconds % 60;
      const newTransaction = {
        ReceiverAddress: rec.receivers,
        TokenAmount: rec.amounts,
        TokenSymbol: allTransactions.data[i]["symbol"],
        ChainName:
          allTransactions.data[i]["call"]["returnValues"]["destinationChain"],
        Status: allTransactions.data[i]["status"],
        TransactionHash:
          allTransactions.data[i]["call"]["transactionHash"] +
          ":" +
          allTransactions.data[i]["call"]["logIndex"],
        TimeTaken: `${minutes} minutes ${seconds} seconds`,
        TotaTokenAmount: allTransactions.data[i]["amount"],
        TimeExecuted: new Date(
          allTransactions.data[i]["call"]["block_timestamp"] * 1000
        ).toLocaleString("en-US", {
          timeZone: "Asia/Kolkata", // IST time zone
          hour12: false,
        }),
        expanded: false, // Initially, details are not expanded
      };

      details.push(newTransaction);
    }
    setTransactionDetails(details);
    console.log(details);
  };

  useEffect(() => {
    handleSearch();
  }, [searchQuery, transactionDetails]);

  useEffect(() => {
    fetchTransaction();
  }, []);

  return (
    <div>
      <div className="title-view-history">
        <h1>View Your Transactions</h1>
      </div>
      <div className="div-for-search-bar">
        <div className="search-bar">
          <div className="search-input-container">
            <FontAwesomeIcon icon={faSearch} className="search-icon" />
            <input
              type="text"
              className="search-bar-view"
              placeholder="Search for Chain or Token"
              value={searchQuery}
              onChange={handleInputChange}
            />
          </div>
        </div>
      </div>
      <div className="div-to-display-all-txs">
        <table>
          <thead>
            <tr>
              <th>Chain</th>
              <th>Token Symbol</th>
              <th>Total Amount</th>
              <th>Transfer date</th>
              <th>Time Taken</th>
              <th>Current Status</th>
              <th>Hash</th>
              <th>View Recipients</th>
            </tr>
          </thead>
          <tbody style={{ maxHeight: "300px", overflowY: "auto" }}>
            {filteredTransactions.map((transaction, index) => (
              <>
                <tr key={index}>
                  <td>{transaction.ChainName}</td>
                  <td>{transaction.TokenSymbol}</td>
                  <td>{transaction.TotaTokenAmount}</td>
                  <td>{transaction.TimeExecuted}</td>
                  <td>{transaction.TimeTaken}</td>
                  <td>{transaction.Status}</td>
                  <td>
                    <a
                      href={
                        "https://testnet.axelarscan.io/gmp/" +
                        transaction.TransactionHash
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {"Click Me!!"}
                    </a>
                  </td>
                  <td>
                    <button
                      onClick={() =>
                        handleExpandClick(
                          transaction.ReceiverAddress,
                          transaction.TokenAmount
                        )
                      }
                    >
                      {transaction.expanded ? "Hide Details" : "Show Details"}
                    </button>
                  </td>
                </tr>
                {transaction.expanded && <></>}
              </>
            ))}
          </tbody>
        </table>
      </div>
      {errorModalIsOpen ? (
        <Modal
          className="popup-for-payment"
          isOpen={setErrorModalIsOpen}
          onRequestClose={() => setErrorModalIsOpen(false)}
          contentLabel="Error Modal"
        >
          <table>
            <thead>
              <tr>
                <th>Receiver Address</th>
                <th>Amount</th>
              </tr>
            </thead>
            <tbody>
              {data.map((item, index) => (
                <tr key={index}>
                  <td>{item.receiverAddress}</td>
                  <td>{item.amount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Modal>
      ) : null}
    </div>
  );
}

export default Viewlist;
