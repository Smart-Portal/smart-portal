import { ethers } from "ethers";
import ERC20ABI from "../artifacts/contracts/ERC20.sol/ERC20.json";

export const approveToken = async (amount, tokenContractAddress) => {
  console.log(tokenContractAddress);

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
      const tokenAmount = ethers.utils.parseUnits(amount, 6);
      const tx = await tokenContract.approve(
        "0x6339EdEFeFAC4DAac16e9E3e6A9D2583E0Bf6518",
        tokenAmount
      );
      await tx.wait();
      console.log(`${amount} tokens Approved`);

      return true;
    } catch (error) {
      console.error("Error Approving token:", error);
    }
  }
};
