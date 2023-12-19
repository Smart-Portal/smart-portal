import { ethers } from "ethers";
import ERC20ABI from "../artifacts/contracts/ERC20.sol/ERC20.json";
import ContractAddress from "../Helpers/ContractAddresses.json";

export const approveToken = async (amount, tokenContractAddress) => {
  const chainId = Number(
    await window.ethereum.request({ method: "eth_chainId" })
  );
  const network = ethers.providers.getNetwork(chainId);

  if (network.chainId == 919) {
    const { ethereum } = window;
    if (ethereum) {
      try {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const tokenContract = new ethers.Contract(
          tokenContractAddress,
          ERC20ABI.abi,
          signer
        );

        const tx = await tokenContract.approve(
          ContractAddress["CROSS_SENDER_ADDRESS_TEST"],
          amount
        );
        await tx.wait();
        console.log(`${amount} tokens Approved`);

        return true;
      } catch (error) {
        console.error("Error Approving token:", error);
        return false;
      }
    }
  } else if (network.chainId == 534352) {
    const { ethereum } = window;
    if (ethereum) {
      try {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const tokenContract = new ethers.Contract(
          tokenContractAddress,
          ERC20ABI.abi,
          signer
        );

        const tx = await tokenContract.approve(
          ContractAddress["CROSS_SENDER_ADDRESS_MAIN"],
          amount
        );
        await tx.wait();
        console.log(`${amount} tokens Approved`);

        return true;
      } catch (error) {
        console.error("Error Approving token:", error);
        return false;
      }
    }
  }
};
