import { ethers } from "ethers";
import crossSendABI from "../artifacts/contracts/CrossSender.sol/CrossSender.json";

export const CROSS_SENDER_ADDRESS =
  // "0x05c106CaD72b04c09F228286fEd949eC6f9539a7";
  "0x85b83843424ff60F1Dc0AE03E1577c420d1ef0Bc";

export const crossSendInstance = async () => {
  const { ethereum } = window;
  if (ethereum) {
    const provider = new ethers.providers.Web3Provider(ethereum);
    const signer = provider.getSigner();
    if (!provider) {
      console.log("Metamask is not installed, please install!");
    }
    const con = new ethers.Contract(
      CROSS_SENDER_ADDRESS,
      crossSendABI.abi,
      signer
    );
    console.log(con);
    return con;
  } else {
    console.log("error");
  }
};
