import React, { useState } from "react";
import Modal from "react-modal";
// import "../../Styles/dashboard/createlist.css";

function SCL() {
  const [listData, setListData] = useState([]);
  const [errorModalIsOpen, setErrorModalIsOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [alertMessage, setAlertMessage] = useState("");
  const [tokenSymbolFinal, setTokenSymbol] = useState("aUSDC");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    receiverAddress: "",
    tokenAmount: "",
    chainName: "Polygon",
  });
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleDeleteRow = (index) => {
    const updatedList = [...listData]; // Create a copy of the list
    updatedList.splice(index, 1); // Remove the item at the specified index
    setListData(updatedList); // Update the state with the modified list
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

    // if (!ethereumAddressPattern.test(formData.receiverAddress)) {
    //   setErrorMessage("Invalid receipient address");
    //   setErrorModalIsOpen(true);
    //   return;
    // }

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

  return (
    <div>
      <div>
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
          <option svalue="aUSDC">aUSDC</option>
          <option value="axlWETH">axlWETH</option>
          <option value="wAXL">wAXL</option>
          <option value="WMATIC">WMATIC</option>
          <option value="WDEV">WDEV</option>
        </select>

        <div
          className={`user-form-for-list ${
            errorModalIsOpen ? "blurred-background" : ""
          }`}
        >
          <input
            className="each-input-of-create-list"
            type="text"
            name="receiverAddress"
            // value={formData.receiverAddress}
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

          <select
            className="each-input-of-create-list"
            name="chainName"
            value={formData.chainName}
            onChange={handleInputChange}
          >
            <option value="" disabled selected>
              Select Chain
            </option>
            <option value="Polygon">Polygon</option>
            <option value="ethereum-2">Ethereum</option>
            <option value="Avalanche">Avalanche</option>
            <option value="Moonbeam">Moonbeam</option>
            <option value="arbitrum">Arbitrum</option>
          </select>
          <button className="button-to-add-form-data" onClick={handleAddClick}>
            Add to List
          </button>
        </div>
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
              <button
                className="send-button"
                onClick={() => {
                  //   executeTransaction();
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
        <div>
          <a href="/Getting%20aUSDC.pdf" target="_blank">
            Steps to Get aUSDC
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

export default SCL;
