import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch } from "@fortawesome/free-solid-svg-icons";
import "../../../Styles/dashboard/viewlist.css";
import { getSentTransaction } from "../../../Helpers/GetSentTransactions";
import { decode } from "../../../Helpers/DecodePayload";
import Modal from "react-modal";
import { useAccount, useSigner } from "wagmi";

function SameViewlist() {
  return <div></div>;
}

export default SameViewlist;
