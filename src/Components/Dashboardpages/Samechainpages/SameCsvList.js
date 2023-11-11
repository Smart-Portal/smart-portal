import React, { useState } from "react";
import Modal from "react-modal";

function SameCsvList() {
  const [listData, setListData] = useState([]);
  const [tokenSymbolFinal, setTokenSymbol] = useState("");
  const [errorModalIsOpen, setErrorModalIsOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [isSuccess, setSuccess] = useState(false);

  const handleDeleteRow = (index) => {
    const updatedList = [...listData];
    updatedList.splice(index, 1);
    setListData(updatedList);
  };

  const handleInputChange = (e, index) => {
    const { name, value } = e.target;
    const updatedRecord = { ...listData[index] };
    updatedRecord[name] = value;
    setListData((prevListData) => {
      const newListData = [...prevListData];
      newListData[index] = updatedRecord;
      return newListData;
    });
  };

  return (
    <div>
      <div className="main-div-for-upload-csv-file">
        <div className="input-div-for-csv">
          <label>Upload File</label> &nbsp; &nbsp;
          <input
            className="input-csv-feild"
            type="file"
            accept=".csv"
            // onChange={handleFileUpload}
          />
        </div>
      </div>
      <div
        className={`user-form-for-list ${
          errorModalIsOpen ? "blurred-background" : ""
        }`}
      >
        <div className="display-csvfile-here">
          <p>Upload your CSV File</p>
          <div className="table-wrapper">
            {/* Uncomment and complete this section based on your requirements */}
            {/* <select
              className="each-input-of-create-list"
              name="tokenSymbol"
              value={tokenSymbolFinal}
              onChange={(e) => {
                setTokenSymbol(e.target.value);
              }}
            >
              {/* Options */}
            {/* </select> */}
            {/* Table contents */}
          </div>
          {listData.length > 0 && (
            <button
              className="button-to-submit-csv"
              onClick={() => {
                // executeTransaction();
              }}
              disabled={loading}
            >
              {loading ? <div className="loader"></div> : "Begin Payment"}
            </button>
          )}
        </div>
      </div>
      <div>
        <a href="/Book1.csv" download="Book1.csv">
          Download sample CSV file
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
            <h2>{isSuccess ? "Congratulations!!" : "Error"}</h2>
            <p>{errorMessage}</p>
          </>
        ) : (
          <>
            <h2>Notice</h2>
            {/* <p>{alertMessage}</p> */}
          </>
        )}
        <div className="div-to-center">
          <button onClick={() => setErrorModalIsOpen(false)}>Close</button>
        </div>
      </Modal>
    </div>
  );
}

export default SameCsvList;
