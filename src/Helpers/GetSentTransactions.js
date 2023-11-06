import axios from "axios";

export const getSentTransaction = async (address) => {
  return new Promise(async (resolve, reject) => {
    // Define the parameters
    const parameters = {
      method: "searchGMP",
      size: 20,
      senderAddress: address,
      sourceContractAddress: "0x6339EdEFeFAC4DAac16e9E3e6A9D2583E0Bf6518",
    };

    // Define the API endpoint
    const apiUrl = "https://testnet.api.gmp.axelarscan.io";

    try {
      // Make the POST request
      const response = await axios.post(apiUrl, parameters);

      // Handle the response data here
      const gasFees = response.data; // Assuming the response contains gas fee data

      resolve(gasFees);
    } catch (error) {
      // Handle any errors
      console.error("Error:", error);
      reject(error);
    }
  });
};
