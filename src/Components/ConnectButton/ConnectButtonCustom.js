import { ConnectButton } from "@rainbow-me/rainbowkit";
const ConnectButtonCustom = () => {
  return (
    <ConnectButton.Custom>
      {({
        account,
        chain,
        openAccountModal,
        openChainModal,
        openConnectModal,
        authenticationStatus,
        mounted,
      }) => {
        // Note: If your app doesn't use authentication, you
        // can remove all 'authenticationStatus' checks
        const ready = mounted && authenticationStatus !== "loading";
        const connected =
          ready &&
          account &&
          chain &&
          (!authenticationStatus || authenticationStatus === "authenticated");
        return (
          <div
            {...(!ready && {
              "aria-hidden": true,
              style: {
                opacity: 0,
                pointerEvents: "none",
                userSelect: "none",
              },
            })}
          >
            {(() => {
              if (!connected) {
                return (
                  <button
                    onClick={openConnectModal}
                    type="button"
                    style={{
                      padding: "15px 30px",
                      borderRadius: "26px",
                      border:" 0.5px solid #0019FF",
                      background: "linear-gradient(92deg, #1E1E1E 0.87%, #1C1B1B 98.92%)",
                      width: "100%",
                      fontWeight: "700",
                      fontSize:"15px",
                      letterSpacing:"1px",
                      cursor: "pointer",
                      background: "linear-gradient(90deg, #9F53FF 27.06%, #3B7DFF 74.14%)",
                      backgroundClip:" text",
                      WebkitBackgroundClip:"text",
                      WebkitTextFillColor:"transparent"

                    }}
                  >
                    Connect Wallet
                  </button>
                );
              }
              if (chain.unsupported) {
                return (
                  <button
                    onClick={openChainModal}
                    type="button"
                    style={{
                      padding: "15px 30px",
                      borderRadius: "26px",
                      border:" 0.5px solid #0019FF",
                      background: "linear-gradient(92deg, #1E1E1E 0.87%, #1C1B1B 98.92%)",
                      width: "100%",
                      fontWeight: "700",
                      fontSize:"15px",
                      cursor: "pointer",
                      background: "linear-gradient(90deg, #9F53FF 27.06%, #3B7DFF 74.14%)",
                      backgroundClip:" text",
                      WebkitBackgroundClip:"text",
                      WebkitTextFillColor:"transparent"
                    }}
                  >
                    Wrong network
                  </button>
                );
              }
              return (
                <div style={{ display: "flex", gap: 12 }}>
                  <button
                    onClick={openChainModal}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      borderRadius: "26px",
                      border:" 0.5px solid #0019FF",
                      background: "linear-gradient(92deg, #1E1E1E 0.87%, #1C1B1B 98.92%)",
                      padding: "15px 30px ",
                      fontSize:"15px",
                      background: "linear-gradient(90deg, #9F53FF 27.06%, #3B7DFF 74.14%)",
                      backgroundClip:" text",
                      WebkitBackgroundClip:"text",
                      WebkitTextFillColor:"transparent",
                      borderRadius: "26px",
                      fontWeight: "700",
                      cursor: "pointer",
                    }}
                    type="button"
                  >
                    {chain.hasIcon && (
                      <div
                        style={{
                          background: chain.iconBackground,
                          width: 12,
                          height: 12,
                          borderRadius: "26px",
                          overflow: "hidden",
                          marginRight: 4,
                        }}
                      >
                        {chain.iconUrl && (
                          <img
                            alt={chain.name ?? "Chain icon"}
                            src={chain.iconUrl}
                            style={{ width: 12, height: 12 }}
                          />
                        )}
                      </div>
                    )}
                    {chain.name}
                  </button>
                  <button
                    onClick={openAccountModal}
                    type="button"
                    style={{
                      padding: "15px 30px ",
                      borderRadius: "26px",
                      border:" 0.5px solid #0019FF",
                      background: "linear-gradient(92deg, #1E1E1E 0.87%, #1C1B1B 98.92%)",
                      fontWeight: "700",
                      fontSize:"15px",
                      cursor: "pointer",
                      background: "linear-gradient(90deg, #9F53FF 27.06%, #3B7DFF 74.14%)",
                      backgroundClip:" text",
                      WebkitBackgroundClip:"text",
                      WebkitTextFillColor:"transparent"
                    }}
                  >
                    {account.displayName}
                    {account.displayBalance
                      ? ` (${account.displayBalance})`
                      : ""}
                  </button>
                </div>
              );
            })()}
          </div>
        );
      }}
    </ConnectButton.Custom>
  );
};
export default ConnectButtonCustom;