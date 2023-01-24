import { Contract, providers, utils, BigNumber } from "ethers";
import {
  EXCHANGE_CONTRACT_ABI,
  EXCHANGE_CONTRACT_ADDRESS,
} from "../constants";

/**
 * removeLiquidity: Removes the `removeBNTCTokensWei` amount of BNTC tokens from
 * liquidity and also the calculated amount of `ether` and `CD` tokens
 */
export const removeLiquidity = async (signer, removeBNTCTokensWei) => {
  // Create a new instance of the exchange contract
  const exchangeContract = new Contract(
    EXCHANGE_CONTRACT_ADDRESS,
    EXCHANGE_CONTRACT_ABI,
    signer
  );
  const tx = await exchangeContract.removeLiquidity(removeBNTCTokensWei);
  await tx.wait();
};

/**
 * getTokensAfterRemove: Calculates the amount of `Eth` and `CD` tokens
 * that would be returned back to user after he removes `removeBNTCTokenWei` amount
 * of BNTC tokens from the contract
 */
export const getTokensAfterRemove = async (
  provider,
  removeBNTCTokenWei,
  _ethBalance,
  cryptoDevTokenReserve
) => {
  try {
    // Create a new instance of the exchange contract
    const exchangeContract = new Contract(
      EXCHANGE_CONTRACT_ADDRESS,
      EXCHANGE_CONTRACT_ABI,
      provider
    );
    // Get the total supply of `Crypto Dev` BNTC tokens
    const _totalSupply = await exchangeContract.totalSupply();
    // Here we are using the BigNumber methods of multiplication and division
    // The amount of Eth that would be sent back to the user after he withdraws the BNTC token
    // is calculated based on a ratio,
    // Ratio is -> (amount of Eth that would be sent back to the user / Eth reserve) = (BNTC tokens withdrawn) / (total supply of BNTC tokens)
    // By some maths we get -> (amount of Eth that would be sent back to the user) = (Eth Reserve * BNTC tokens withdrawn) / (total supply of BNTC tokens)
    // Similarly we also maintain a ratio for the `CD` tokens, so here in our case
    // Ratio is -> (amount of CD tokens sent back to the user / CD Token reserve) = ( tokens withdrawn) / (total supply of BNTC tokens)
    // Then (amount of CD tokens sent back to the user) = (CD token reserve * BNTC tokens withdrawn) / (total supply of BNTC tokens)
    const _removeEther = _ethBalance.mul(removeBNTCTokenWei).div(_totalSupply);
    const _removeCD = cryptoDevTokenReserve
      .mul(removeBNTCTokenWei)
      .div(_totalSupply);
    return {
      _removeEther,
      _removeCD,
    };
  } catch (err) {
    console.error(err);
  }
};