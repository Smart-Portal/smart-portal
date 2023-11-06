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


        struct PaymentData {

            address[] receivers;
            uint256[] amounts;
            string destChain;
            string detContractAddress;
            string tokenSymbol;
            uint256 gasFees;
            uint256 totalAmount;
        }

    
        function sendPayment(PaymentData[] memory _paymentData) external payable {
                uint256 paymentLength = _paymentData.length;
                for(uint256 i=0;i<paymentLength;i++){
            
                    address tokenAddress = gateway.tokenAddresses(_paymentData[i].tokenSymbol);
                    IERC20(tokenAddress).transferFrom(msg.sender, address(this), _paymentData[i].totalAmount);
                    IERC20(tokenAddress).approve(address(gateway), _paymentData[i].totalAmount);
                    bytes memory payload = abi.encode(_paymentData[i].receivers,_paymentData[i].amounts);

                    if (msg.value> 0) {
                        gasService.payNativeGasForContractCallWithToken{value: _paymentData[i].gasFees}(
                            address(this),
                            _paymentData[i].destChain,
                            _paymentData[i].detContractAddress,
                            payload,
                            _paymentData[i].tokenSymbol,
                             _paymentData[i].totalAmount,
                            msg.sender
                        );
                    }

                    gateway.callContractWithToken(
                        _paymentData[i].destChain,
                        _paymentData[i].detContractAddress,
                        payload,
                        _paymentData[i].tokenSymbol,
                         _paymentData[i].totalAmount
                        );
                
                }
                    
        }

    }
