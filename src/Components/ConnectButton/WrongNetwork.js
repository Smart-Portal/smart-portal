import React, { useState } from "react";
import { useNetwork, useSwitchNetwork } from "wagmi";

function WrongNetwork() {
  const { chain } = useNetwork();
  const { chains, error, isLoading, pendingChainId, switchNetwork } =
    useSwitchNetwork();

  const [dropdownVisible, setDropdownVisible] = useState(false);

  const handleButtonClick = () => {
    setDropdownVisible(!dropdownVisible);
  };

  const handleOptionClick = (networkId) => {
    switchNetwork?.(networkId);
    setDropdownVisible(false);
  };

  return (
    <div className="switch-chain-container">
      <button
        className="connect-chain"
        type="button"
        onClick={handleButtonClick}
      >
        <span>{chain ? ` ${chain.name}` : "wrong network"}</span>
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
          }}
        >
          {chains.map((network) => (
            <button
              key={network.id}
              className="network-option"
              disabled={isLoading || pendingChainId === network.id}
              onClick={() => handleOptionClick(network.id)}
            >
              {network.name}
              {isLoading && pendingChainId === network.id && " (switching)"}
            </button>
          ))}
        </div>
      )}
      {error && <div>{error.message}</div>}
    </div>
  );
}

export default WrongNetwork;
