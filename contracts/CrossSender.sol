    //SPDX-License-Identifier: MIT
    pragma solidity ^0.8.4;
    import {IERC20} from "@axelar-network/axelar-gmp-sdk-solidity/contracts/interfaces/IERC20.sol";
    import {IAxelarGateway} from "@axelar-network/axelar-gmp-sdk-solidity/contracts/interfaces/IAxelarGateway.sol";
    import {IAxelarGasService} from "@axelar-network/axelar-gmp-sdk-solidity/contracts/interfaces/IAxelarGasService.sol";

    contract CrossSender {
        IAxelarGateway gateway;
        IAxelarGasService gasService;
        

        constructor(address _gateway, address _gasReceiver) {
            gateway = IAxelarGateway(_gateway);
            gasService = IAxelarGasService(_gasReceiver);
        }

        struct PaymentDetails {
            address sender;
            address receiver;
            string destinationChain;
            uint256 amount;
            string tokenSymbol;
            uint256 paymentId;
        }

        struct PaymentData {

            address[] receivers;
            uint256[] amounts;
            string destChain;
            string detContractAddress;
            string tokenSymbol;
            uint256 gasFees;
        }

        mapping(address => mapping(uint256 => PaymentDetails)) public sentPayments;
        mapping(address =>uint256[]) public  senderToPaymentId;
        
        
        uint256 public currPaymentId = 0;
    
        function sendPayment(PaymentData[] memory _paymentData) external payable {
                uint256 totalAmount = 0;
                uint256 paymentLength = _paymentData.length;
                for(uint256 i=0;i<paymentLength;i++){
                    uint256 receiversLength = _paymentData[i].receivers.length;
                    for(uint256 j=0;j<receiversLength;j++)
                    {
                        currPaymentId++;
                        senderToPaymentId[msg.sender].push(currPaymentId);
                        totalAmount+= _paymentData[i].amounts[j];
                        PaymentDetails memory payment = PaymentDetails(msg.sender, _paymentData[i].receivers[j], _paymentData[i].destChain,_paymentData[i].amounts[j],_paymentData[i].tokenSymbol, currPaymentId);
                        sentPayments[msg.sender][currPaymentId] = payment;
                    }

                    address tokenAddress = gateway.tokenAddresses(_paymentData[i].tokenSymbol);
                    IERC20(tokenAddress).transferFrom(msg.sender, address(this), totalAmount);
                    IERC20(tokenAddress).approve(address(gateway), totalAmount);
                    bytes memory payload = abi.encode(_paymentData[i].receivers,_paymentData[i].amounts);

                    if (msg.value> 0) {
                        gasService.payNativeGasForContractCallWithToken{value: _paymentData[i].gasFees}(
                            address(this),
                            _paymentData[i].destChain,
                            _paymentData[i].detContractAddress,
                            payload,
                            _paymentData[i].tokenSymbol,
                            totalAmount,
                            msg.sender
                        );
                    }

                    gateway.callContractWithToken(
                        _paymentData[i].destChain,
                        _paymentData[i].detContractAddress,
                        payload,
                        _paymentData[i].tokenSymbol,
                        totalAmount
                        );
                
                        totalAmount=0;
                }
                    
        }

        function getSentPayments(address _sender) external view returns (PaymentDetails[] memory) {
            PaymentDetails[] memory result = new PaymentDetails[](currPaymentId);
            uint256[] memory paymentIds = senderToPaymentId[_sender];
            uint256 totalPaymentIds = paymentIds.length;
            uint256 count = 0;
            for (uint256 i = 0; i <totalPaymentIds; i++) {
                    result[count] = sentPayments[_sender][paymentIds[i]];
                    count++;
            }
            return result;
        }

    }
