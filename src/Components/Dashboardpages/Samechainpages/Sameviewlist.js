import React, { useState } from "react";
import Modal from "react-modal";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch } from "@fortawesome/free-solid-svg-icons";

function SameViewList() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [transactionDetails, setTransactionDetails] = useState([]);
  const [errorModalIsOpen, setErrorModalIsOpen] = useState(false);
  const [data, setData] = useState();

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
  return (
    <div>
      View same list
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
                      <button>
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
    </div>
  );
}

export default SameViewList;
