import React, { useState, useRef, useEffect } from "react";
import { useNetwork, useSwitchNetwork } from "wagmi";

function SwitchChain() {
  const { chain } = useNetwork();
  const { chains, error, isLoading, pendingChainId, switchNetwork } =
    useSwitchNetwork();

  const [dropdownVisible, setDropdownVisible] = useState(false);

  const buttonRef = useRef(null);

  const handleButtonClick = () => {
    setDropdownVisible(!dropdownVisible);
  };

  const handleOptionClick = (networkId) => {
    switchNetwork?.(networkId);
    setDropdownVisible(false);
  };

  const handleClickOutside = (event) => {
    if (buttonRef.current && !buttonRef.current.contains(event.target)) {
      setDropdownVisible(false);
    }
  };

  useEffect(() => {
    document.addEventListener("click", handleClickOutside);

    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, []);

  return (
    <div className="switch-chain-container">
      <button
        ref={buttonRef}
        className="connect-chain"
        type="button"
        onClick={handleButtonClick}
        onMouseEnter={() => setDropdownVisible(true)}
      >
        <span>
          {chain && chains.some((network) => network.id === chain.id)
            ? ` ${chain.name}`
            : "Wrong Network"}
        </span>
      </button>
      {dropdownVisible && (
        <div
          className="dropdown"
          style={{
            position: "absolute",
            display: "flex",
            top: "78px",
            width: "200px",
            flexDirection: "column",
            borderRadius: "10px",
            border: "0.5px solid #0019ff",
            background:
              " linear-gradient(92deg, #1e1e1e 0.87%, #1c1b1b 98.92%)",
          }}
        >
          {chains.map((network) => (
            <button
              key={network.id}
              className="network-option"
              disabled={isLoading || pendingChainId === network.id}
              onClick={() => handleOptionClick(network.id)}
              style={{
                borderRadius: "5px",
                border: " 0.5px solid #0019ff",
                background:
                  " linear-gradient(92deg, #1e1e1e 0.87%, #1c1b1b 98.92%)",
                color: "white",
                padding: "10px",

                width: "80%",
                margin: "10px auto",
              }}
            >
              <span
                style={{
                  content: "",
                  top: "50%",
                  left: " 50%",
                  fontSize: "15px",
                  transform: "translate(-50%, -50%)",
                  background:
                    "linear-gradient(90deg, #9f53ff 27.06%, #3b7dff 74.14%)",
                  backgroundClip: "text",
                  webkitBackgroundClip: "text",
                  webkitTextFillColor: "transparent",
                  zIndex: "0",
                }}
              >
                {network.name}
              </span>
              {isLoading && pendingChainId === network.id && " (switching)"}
            </button>
          ))}
        </div>
      )}
      {error && (
        <div>
          {error.code === "UNSUPPORTED_CHAIN" ? (
            <div>Wrong network. Please select the correct one.</div>
          ) : (
            <div>{error.message}</div>
          )}
        </div>
      )}
    </div>
  );
}

export default SwitchChain;
