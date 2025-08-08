#### SRG Contract Takeaways

- The calculatePrice() function in the SRG contract returns the price of the token in beans with 9 decimals

```solidity
// Returns the Current Price of the Token in beans
function calculatePrice() public view returns (uint256) {
    require(liquidity > 0, "No Liquidity");
    return liquidity / _balances[address(this)];
}
```

- The getBNBPrice() function in the SRG contract returns the price of the token in BNB with 18 decimals

```solidity
// calculate price based on pair reserves
function getBNBPrice() public view returns (uint256) {
    IPancakePair pair = IPancakePair(stablePairAddress);
    IERC20 token1 = pair.token0() == stableAddress
        ? IERC20(pair.token1())
        : IERC20(pair.token0());

    (uint256 Res0, uint256 Res1, ) = pair.getReserves();

    if (pair.token0() != stableAddress) {
        (Res1, Res0, ) = pair.getReserves();
    }
    uint256 res0 = Res0 * 10**token1.decimals();
    return (res0 / Res1); // return amount of token0 needed to buy token1
}
```

#### SurgeApe Contract Takeaways

- The getSRGPrice() function in the SurgeApe contract brings both, and scales the decimal value to 27 decimals (9 + 18)

```solidity
// calculate price based on pair SRG price
function getSRGPrice() public view returns (uint256) {
    return (SRGI.calculatePrice() * SRGI.getBNBPrice()); // return amount of token0 needed to buy token1
}
```

- The getLiquidity() function in the SurgeApe contract returns the liquidity of the token in beans with 9 decimals

```solidity
// Returns the Current Price of the Token in beans
function getLiquidity() public view returns (uint256) {
    return liquidity;
}
```
