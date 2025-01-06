import { StoredTokenBalances } from 'src/tokens/slice'

// alfajores addresses
const cUSD = '0x874069Fa1Eb16D44d622F2e0Ca25eeA172369bC1'
const cEUR = '0x10c892A6EC43a53E45D0B916B4b7D383B1b78C0F'
const CNDL = '0xF194afDf50B03e69Bd7D057c1Aa9e10c9954E4C9'

export function e2eTokens(): StoredTokenBalances {
  return {
    [cUSD]: {
      address: cUSD,
      decimals: 18,
      imageUrl: '',
      name: 'Candle Dollars',
      symbol: 'cUSD',
      usdPrice: '1',
      balance: null,
      isCoreToken: true,
      priceFetchedAt: Date.now(),
    },
    [cEUR]: {
      address: cEUR,
      decimals: 18,
      imageUrl: '',
      name: 'Candle Euros',
      symbol: 'cEUR',
      usdPrice: '1.18',
      balance: null,
      isCoreToken: true,
      priceFetchedAt: Date.now(),
    },
    [CNDL]: {
      address: CNDL,
      decimals: 18,
      imageUrl: '',
      name: 'Candle native token',
      symbol: 'CNDL',
      usdPrice: '6.5',
      balance: null,
      isCoreToken: true,
      priceFetchedAt: Date.now(),
    },
  }
}
